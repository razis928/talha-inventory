'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { getUserDetails, UserDetails } from '@/lib/supabase';
import { getCompanyCode } from '@/lib/supabase/company';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

import { ClientFormSchema } from '@/app/dashboard/clients/_components/client-form-config';
import { VendorFormSchema } from '@/app/dashboard/vendors/_components/vendor-form-config';
import { useAppContext } from '@/providers/context-provider';
import { unformatCurrency } from '@/utils/stripe/csv-templates/transactions';
import { createClient } from '@/utils/supabase/client';
import { getExtractedValues } from '@/utils/textract';

import { ClientForm } from '@/types/client';
import { ExtractedKeys } from '@/types/textract';
import { CSVTransaction } from '@/types/transactions';
import { VendorForm } from '@/types/vendor';

interface NewPayableProps {
  buttonName: string;
  type: 'client' | 'vendor';
}

// Define dynamic form types based on 'type'
type FormDataType<T extends 'client' | 'vendor'> = T extends 'client'
  ? z.infer<typeof ClientFormSchema>
  : z.infer<typeof VendorFormSchema>;

export function NewPayable({ buttonName, type }: NewPayableProps) {
  const [open, setOpen] = useState(false);
  const { userDetails } = useAppContext();
  const [uploadedInvoice, setUploadedInvoice] = useState<File>();
  const [isExtracting, setIsExtracting] = useState(false);

  const form = type === 'client' ? ClientFormSchema : VendorFormSchema;

  const selectedForm = useForm<FormDataType<typeof type>>({
    resolver: zodResolver(form),
    defaultValues: {
      company_name: '',
      address_1: '',
      address_2: '',
      phone: '',
      email: '',
      tax_payer_id: '',
      invoice_date: '',
      due_date: '',
      account_number: '',
      invoice_number: '',
      amount: '',
      company_tagging_id: '',
      invoice_tagging_id: '',
      company_invoice: new File([], ''),
    },
  });
  const fileUploadHandler = async (file: File) => {
    try {
      setUploadedInvoice(file);
      setIsExtracting(true);
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file); // Append the file to the FormData object

      // Send the form data to the API
      const response = await fetch('/api/textract', {
        method: 'POST',
        body: formData, // Set the body to the FormData object
      });

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        const result = await response.json();
        setIsExtracting(false);
        throw new Error(result.error);
      }

      // Parse the JSON response
      const result = (await response.json()) as {
        data: ExtractedKeys;
      };

      const { clientForm, vendorForm } = await getExtractedValues(result.data);

      const tagging_id = await getCompanyCode(clientForm.company_name);
      const commonFields = {
        tagging_id,
        user_id: userDetails?.id,
        company_id: userDetails?.company.id,
        created_by: userDetails?.id,
      };

      selectedForm.reset({
        ...selectedForm.getValues(),
        ...commonFields,
        ...(type === 'client' ? clientForm : vendorForm),
      });
      setIsExtracting(false);
      if (validateMissingFields()) return;
    } catch (error) {
      setIsExtracting(false);
      return toast({
        title: 'Error',
        description: (error as Error).message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const validateMissingFields = useCallback(() => {
    const requiredFields: Array<keyof ClientForm | keyof VendorForm> = [
      'company_name',
      'address_1',
      'phone',
      'tax',
      'tax_payer_id',
      'payment_term',
      'account_number',
      'invoice_number',
      'amount',
      'due_date',
      'invoice_date',
    ];

    const formValues = selectedForm.getValues();
    const missingFields = requiredFields.filter(
      (key) => !formValues[key as keyof FormDataType<typeof type>],
    );

    if (missingFields.length > 0) {
      toast({
        title: 'Error',
        description: `Missing fields: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return true; // Indicates validation failure
    }
    return false; // Validation success
  }, [selectedForm]);

  const onSubmit = useCallback(
    async (data: FormDataType<typeof type>) => {
      if (validateMissingFields()) return;

      const supabase = createClient();
      const userDetails = (await getUserDetails(supabase)) as UserDetails;
      const formattedAmount = unformatCurrency(data.amount);

      const {
        // eslint-disable-next-line unused-imports/no-unused-vars
        company_invoice,
        line_items,
        invoice_tagging_id,
        tax = '',
        payment_term = '',
        contact_name = '',
        ...rest
      } = data;

      let transaction: CSVTransaction = {
        ...rest,
        id: uuidv4(),
        tax,
        payment_term,
        amount: `-${formattedAmount}`,
        contact_name,
        currency: 'usd',
        code: invoice_tagging_id,
        description: '',
        status: 'completed',
        memo: '',
        line_items: JSON.stringify(line_items),
      } as CSVTransaction;

      try {
        if (type === 'client') {
          transaction = {
            ...transaction,
            amount: `-${formattedAmount}`,
          };
          // await addNewClient({ ...data });
        } else {
          // await addNewVendor({ ...data });
          transaction = {
            ...transaction,
            amount: formattedAmount.toString(),
          };
        }

        const invoiceDate = format(new Date(data.invoice_date), 'yyyy-MM');
        const key = `stripe_data/${userDetails.company.company_name}/users/${userDetails.email}/transactions/${invoiceDate}`;

        const res = await fetch('/api/s3/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactions: [transaction],
            key,
          }),
        });
        const responseData = await res.json();
        if (!res.ok) {
          toast({
            title: 'Error',
            description: responseData.error || 'Something went wrong',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Success',
          description: `${type} added successfully!`,
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    },
    [type, validateMissingFields],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='border-gray-500'
          onClick={() => setOpen(true)}
        >
          <Image
            src='/assets/vendors/plus.svg'
            alt='Image'
            width={16}
            height={16}
            className='mr-1'
          />
          {buttonName} {/* Use the buttonName prop here */}
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-[600px] p-6'>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <FormProvider {...selectedForm}>
          <form onSubmit={selectedForm.handleSubmit(onSubmit)}>
            <FormField
              control={selectedForm.control}
              name='company_invoice'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div
                      className='relative my-4 flex flex-grow flex-col items-center justify-center rounded-lg border border-gray-300 transition-colors hover:border-gray-400'
                      style={{ width: '100%', height: '200px' }}
                    >
                      {isExtracting && (
                        <Loader2 className='absolute top-5 h-20 w-20 animate-spin text-gray-500' />
                      )}
                      <div className='relative text-center'>
                        {/* File Input Icon */}
                        <label htmlFor='file-input'>
                          <Image
                            src='/assets/vendors/add-file.svg'
                            alt='Add Vendor Icon'
                            width={50}
                            height={50}
                            className='m-auto mb-4 cursor-pointer'
                          />
                        </label>

                        <Input
                          id='file-input'
                          type='file'
                          disabled={isExtracting}
                          className='hidden'
                          onChange={(e) => {
                            field.onChange(
                              e.target.files?.length ? e.target.files[0] : null,
                            );
                            if (e.target.files)
                              fileUploadHandler(e.target.files[0]);
                          }}
                        />

                        <p
                          className={`mb-1 text-base font-semibold text-${isExtracting ? 'gray-500' : 'black'}`}
                        >
                          {uploadedInvoice?.name ??
                            'Click to upload or drag and drop'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          SVG, PNG, JPG, or GIF (max 800 x 400px)
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name='email'
              control={selectedForm.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder='Email'
                      className='border border-gray-300 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                className='transition-colors hover:text-white'
                type='reset'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                onClick={() => selectedForm.trigger()}
                className='transition-colors hover:text-white'
              >
                Upload
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
