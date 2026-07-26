'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { redirect, useParams } from 'next/navigation';
import React, { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { getCompanyTaggingCode } from '@/lib/agents/get-tagging-code';
import { getUserDetails, UserDetails } from '@/lib/supabase';
import { extractFormFromDocument } from '@/lib/textract/extract-document';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

import LineItemsTable from '@/app/dashboard/vendors/_components/line-items-table';
import {
  vendorFormFields,
  VendorFormSchema,
} from '@/app/dashboard/vendors/_components/vendor-form-config';
import VendorDetailsModal from '@/app/dashboard/vendors/_components/view-vendor-modal';
import { unformatCurrency } from '@/utils/stripe/csv-templates/transactions';
import { createClient } from '@/utils/supabase/client';

import { ClientForm } from '@/types/client';
import { CSVTransaction } from '@/types/transactions';
import { Vendor } from '@/types/vendor';

interface Props {
  type: 'add' | 'update';
  initialState?: z.infer<typeof VendorFormSchema>;
}
const VendorForm: FC<Props> = ({ type, initialState }: Props) => {
  const [vendorDetails, setVendorDetails] = useState<Vendor | null>(null);
  const [clientForm, setClientForm] = useState<ClientForm | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<null | 'get-tagging-code'>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const params = useParams();
  const { id } = params;

  const form = useForm<z.infer<typeof VendorFormSchema>>({
    resolver: zodResolver(VendorFormSchema),
    defaultValues: initialState
      ? { ...initialState, company_invoice: new File([], '') }
      : {
          company_name: '',
          address_1: '',
          address_2: '',
          phone: '',
          email: '',
          tax: '',
          tax_payer_id: '',
          invoice_date: '',
          due_date: '',
          account_number: '',
          invoice_number: '',
          amount: '',
          contact_name: '',
          company_tagging_id: '',
          invoice_tagging_id: '',
          company_invoice: new File([], ''),
        },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof VendorFormSchema>) => {
      setLoading(true);

      const supabase = createClient();
      const userDetails = (await getUserDetails(supabase)) as UserDetails;

      if (!userDetails.id) {
        redirect('/login');
      }

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
      const invoiceDate = format(new Date(data.invoice_date), 'yyyy-MM');
      const key = `stripe_data/${userDetails.company.company_name}/users/${userDetails.email}/transactions/${invoiceDate}`;
      const vendorDetails: CSVTransaction = {
        ...rest,
        id: (id as string | undefined) || uuidv4(),
        tax,
        payment_term,
        amount: `-${Math.abs(formattedAmount)}`,
        contact_name,
        currency: 'usd',
        code: invoice_tagging_id,
        description: '',
        status: 'completed',
        memo: '',
        line_items: JSON.stringify(line_items),
      };

      const clientDetails: CSVTransaction = {
        ...vendorDetails,
        id: uuidv4(),
        amount: formattedAmount.toString(),
        company_name: clientForm?.company_name || '',
        address_1: clientForm?.address_1 || '',
        phone: clientForm?.phone || '',
      };

      const res = await fetch('/api/s3/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: id ? [vendorDetails] : [vendorDetails, clientDetails],
          key,
          updateRecord: id ? true : false,
        }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        toast({
          title: 'Error',
          description: responseData.error || 'Something went wrong',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: responseData.message || 'Invoice uploaded successfully',
        variant: 'default',
      });
      setLoading(false);
    },
    [clientForm?.address_1, clientForm?.company_name, clientForm?.phone, id],
  );

  const fileUploadHandler = async (file: File) => {
    try {
      setIsExtracting(true);
      const { clientForm, vendorForm } = await extractFormFromDocument(file);
      setClientForm(clientForm as ClientForm);

      form.reset({
        ...vendorForm,
        company_invoice: file,
      });
      setIsExtracting(false);
    } catch (error) {
      setIsExtracting(false);
      return toast({
        title: 'Error',
        description: (error as Error).message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const onFieldBlurHandler = useCallback(
    async (companyName: string) => {
      if (companyName.length === 0) {
        form.setValue('company_tagging_id', '');
        return;
      }
      setLoadingState('get-tagging-code');

      try {
        const tagging_id = await getCompanyTaggingCode(companyName);
        form.setValue('company_tagging_id', tagging_id || '');
        setLoadingState(null);
      } catch (error) {
        setLoadingState(null);
        toast({
          title: 'Error',
          description: (error as Error).message || 'An unknown error occurred.',
          variant: 'destructive',
        });
      }
    },
    [form],
  );

  return (
    <Card className='rounded-lg bg-white'>
      {vendorDetails && (
        <VendorDetailsModal
          vendor={vendorDetails}
          setVendor={setVendorDetails}
        />
      )}
      <CardHeader>
        <CardTitle className='me-4 mt-6 flex items-center gap-5'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-Gray400Opac'>
            <Image
              src='/assets/vendors/add-vendor.svg'
              alt='Add Vendor Icon'
              width={13.3}
              height={13.3}
            />
          </div>
          <div>
            <h3 className='font-poppins text-[1.25rem] font-semibold leading-[30px] text-smoke-400'>
              {type === 'update' ? 'Update' : 'Add'} Vendors
            </h3>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6 pt-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {vendorFormFields.map((item) => (
              <FormField
                key={item.id}
                name={item.id}
                render={({ field }) => (
                  <FormItem className='mb-7 flex flex-row items-center gap-5'>
                    <FormLabel className='para-text w-full text-right font-medium md:w-[20.3333%]'>
                      {item.label}
                    </FormLabel>
                    <FormControl
                      className={`flex w-full flex-col items-center ${item.type === 'file' ? 'h-[120px] rounded-lg border border-gray-500 border-opacity-45 md:w-1/4' : 'md:w-1/2'}`}
                    >
                      {item.type === 'file' ? (
                        <div
                          className={`relative flex items-center justify-center ${isExtracting ? 'animate-pulse bg-Gray400Opac' : ''}`}
                        >
                          {isExtracting && (
                            <Loader2 className='absolute top-2 h-20 w-20 animate-spin text-gray-500' />
                          )}
                          <Input
                            id={item.id}
                            type={item.type}
                            disabled={isExtracting}
                            className='hidden'
                            onChange={(e) => {
                              field.onChange(
                                e.target.files?.length
                                  ? e.target.files[0]
                                  : null,
                              );
                              if (e.target.files)
                                fileUploadHandler(e.target.files[0]);
                            }}
                          />
                          <label
                            htmlFor={item.id}
                            className='para-text--extra-small flex h-full w-1/2 cursor-pointer flex-col items-center justify-center gap-2 text-center'
                          >
                            <Image
                              src='/assets/vendors/file-upload.svg'
                              alt='uploadFile'
                              width={41}
                              height={41}
                            />
                            {form.getValues('company_invoice')?.name ? (
                              <span className='font-semibold'>
                                {form.getValues('company_invoice')?.name}
                              </span>
                            ) : (
                              <span>
                                <b>Click to upload</b> or drag and drop SVG,
                                PNG, JPG or GIF (max 800 x 400px)
                              </span>
                            )}
                          </label>
                        </div>
                      ) : (
                        <Input
                          {...field}
                          id={item.id}
                          type={item.type}
                          name={item.id}
                          onBlur={(e) => {
                            if (item.id === 'company_name') {
                              onFieldBlurHandler(e.target.value);
                            }
                          }}
                          value={field.value}
                          required={item.type !== 'file'}
                          disabled={
                            item.id === 'tagging_id' &&
                            loadingState === 'get-tagging-code'
                              ? true
                              : loading || isExtracting
                          }
                          className={`mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white ${loading ? 'animate-pulse bg-gray-200' : ''}`}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {/* Table for line items */}
            <FormField
              control={form.control}
              name='line_items'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LineItemsTable line_items={field.value || []} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-center'>
              <Button
                type='submit'
                className='h-[34px] w-[161px] max-w-xs rounded-lg bg-primary py-2 font-poppins text-sm font-normal leading-[21px]'
                disabled={loading || isExtracting}
              >
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Confirm
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default VendorForm;
