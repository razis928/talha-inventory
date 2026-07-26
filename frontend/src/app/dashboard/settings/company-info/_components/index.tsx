'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Papa from 'papaparse';
import React, { FC, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { callFinancialAnalysisAgent } from '@/lib/agents/financial-analysis-agent';
import { UserDetails } from '@/lib/supabase';
import { CompanyDetails } from '@/lib/supabase/company';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

import * as companyJSON from '@/app/dashboard/settings/company-info/_components/company-data.json';
import { sendNotification } from '@/utils/notification';
import { createClient } from '@/utils/supabase/client';

const FormSchema = z
  .object({
    company_name: z.string().min(3, {
      message: 'Company Name is required.',
    }),
    company_files: z.instanceof(File).optional(),
    documents: z.boolean().optional(),
    compliances: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If a file is uploaded, at least one of documents or compliances must be selected
      if (data.company_files!.size > 0) {
        return data.documents || data.compliances;
      }
      // If no file is uploaded, no need for documents or compliances
      return true;
    },
    {
      message:
        'At least one of Documents or Compliance must be selected if a file is uploaded.',
      path: ['documents'], // You can specify which field to highlight the error on
    },
  );

interface Props {
  user: UserDetails;
  companyDetails: CompanyDetails;
}
const Companyinfo: FC<Props> = ({ user, companyDetails }: Props) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      company_name: user?.company?.company_name || '',
      company_files: new File([], ''),
      compliances: false,
      documents: false,
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setIsLoading(true);

      const { error } = await supabase
        .from('companies')
        .update({ company_name: data.company_name })
        .eq('id', user?.company.id)
        .select();

      if (error) {
        setIsLoading(false);
        toast({
          title: 'Error: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Company Information Updated',
        description: 'Your company details have been successfully updated.',
        variant: 'default',
      });
      setIsLoading(false);

      const documentType = data.compliances ? 'compliances' : 'documents';
      if (data.company_files) {
        const formData = new FormData();
        formData.append('file', data.company_files); // Append the file to the FormData object
        formData.append(
          'keyPath',
          `stripe_data/${data.company_name}/${documentType}/${data.company_files.name}`,
        ); // Append the file to the FormData object

        // Send the form data to the API
        const response = await fetch('/api/s3', {
          method: 'POST',
          body: formData, // Set the body to the FormData object
        });

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          const result = await response.json();
          return toast({
            title: 'Error: ' + result.error,
            variant: 'destructive',
          });
        }

        // Parse the JSON response
        const result = await response.json();
        toast({
          title: result.message,
          variant: 'default',
        });
      }
      await sendNotification(companyDetails, 'companyInfo');
      setIsLoading(false);
    },
    [supabase, user?.company.id, companyDetails],
  );

  const handleProcessCSV = (file: File) => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const rows = result.data;
          console.log('Parsed CSV Data:', rows);

          // Columns that act as reference values for filling missing fields
          const columnsToFill = ['invoice_date', 'invoice_number', 'memo'];

          // Initialize the last valid reference row
          let lastReferenceRow = {};

          // Process rows
          const filledRows = rows.map((row) => {
            // Check if the current row qualifies as a valid reference row
            const isReferenceRow = columnsToFill.every(
              (column) => row[column] && row[column].trim() !== '',
            );

            if (isReferenceRow) {
              // Update the last reference row
              lastReferenceRow = { ...lastReferenceRow, ...row };
            } else {
              // Fill missing values from the last valid reference row
              columnsToFill.forEach((column) => {
                if (!row[column] || row[column].trim() === '') {
                  row[column] = lastReferenceRow[column] || ''; // Use the reference row's value
                }
              });
            }

            return row; // Return the updated row
          });

          console.log('Filled Rows:', filledRows);

          // Further processing to validate rows and calculate amounts
          const processedRows = filledRows
            .filter((row) => {
              // Ensure the row contains mandatory fields
              const debitAmount = parseFloat(row.debit) || 0;
              const creditAmount = parseFloat(row.credit) || 0;
              return (
                row.account_number &&
                row.description &&
                (debitAmount > 0 || creditAmount > 0)
              );
            })
            .map((row) => {
              // Create the 'amount' field
              let amount = '';
              const debitAmount = parseFloat(row.debit) || 0;
              const creditAmount = parseFloat(row.credit) || 0;

              if (debitAmount > 0) {
                amount = `-${debitAmount}`;
              } else if (creditAmount > 0) {
                amount = `${creditAmount}`;
              }

              // Construct the processed row object
              return {
                id: '',
                invoice_date: row.invoice_date,
                memo: row.memo,
                description: row.description,
                amount: amount,
                account_number: row.account_number,
                invoice_number: row.invoice_number,
                company_name: '',
                code: '',
              };
            });

          // Log the processed rows
          console.log('Processed Rows:', processedRows);

          // Check for duplicates and assign unique IDs
          const { uniqueArray } = checkDublicate(processedRows);

          const attachedUniqueIds = uniqueArray.map((item) => ({
            ...item,
            id: uuidv4(),
          }));
          const batchRecords = groupIntoChunks(attachedUniqueIds, 10);

          const filteredBatchRecordsWithNoCompanyNames = companyJSON?.filter(
            (chunk) => chunk.some((item) => !item.company_name),
          );
          const formatedDataWithCompanyNames = generateCompanyNames(
            filteredBatchRecordsWithNoCompanyNames,
          ).then((result) => {
            console.log({ result });
            return result;
          });

          // Handle processed rows as needed (e.g., update state, download JSON, etc.)
        },
        header: true, // Ensure the CSV header is respected
      });
    }
  };

  const checkDublicate = (array) => {
    const seen = new Set();
    const duplicates = new Set();
    const uniqueArray = [];

    array.forEach((item) => {
      const serialized = JSON.stringify(item);
      if (seen.has(serialized)) {
        duplicates.add(serialized);
      } else {
        seen.add(serialized);
        uniqueArray.push(item);
      }
    });

    // Generate the duplicated array
    const duplicatedArray = array.filter((item) =>
      duplicates.has(JSON.stringify(item)),
    );
    // Log results
    console.log('Original Array (All):', array);
    console.log('Unique Array:', uniqueArray);
    console.log('Duplicated Array:', duplicatedArray);
    return {
      uniqueArray,
      duplicatedArray,
    };
  };

  // Helper function to group items into arrays of a specific size
  const groupIntoChunks = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };
  const generateCompanyNames = async (array) => {
    const recordsWithCompanyNames = [];

    // Retry settings
    const maxRetries = 3;
    const retryDelay = 1000; // Delay between retries in milliseconds

    // Function to retry request in case of connection reset or invalid JSON
    const fetchWithRetry = async (record, retries = 0) => {
      try {
        const responseWithCompanyNames =
          await callFinancialAnalysisAgent(record);

        // Check if the response is valid JSON
        return JSON.parse(responseWithCompanyNames);
      } catch (error) {
        if (
          error.message.includes('ERR_CONNECTION_RESET') &&
          retries < maxRetries
        ) {
          console.warn(
            `Connection reset for record: ${JSON.stringify(record)}. Retrying... Attempt ${retries + 1}`,
          );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchWithRetry(record, retries + 1); // Retry the request
        } else if (retries < maxRetries) {
          console.error(
            `Invalid JSON response for record: ${JSON.stringify(record)}, retrying...`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchWithRetry(record, retries + 1); // Retry on invalid JSON
        } else {
          console.error(
            `Error processing record after ${retries + 1} attempts: ${JSON.stringify(record)} - ${error.message}`,
          );
          return []; // Return null if not recoverable after retries
        }
      }
    };

    // Iterate over the array asynchronously, ensuring sequential processing
    for (const record of array) {
      const parsedResponse = await fetchWithRetry(record); // Sequential processing with retries
      recordsWithCompanyNames.push(parsedResponse); // Push the parsed response or null
      console.log({ recordsWithCompanyNames });
    }

    console.log({ allRecords: recordsWithCompanyNames });
    return recordsWithCompanyNames;
  };

  return (
    <Card className='rounded-lg'>
      <Form {...form}>
        <form id='invite-form' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex flex-col items-center justify-between pt-6 sm:flex-row'>
            <div className='sm:px-9'>
              <h2 className='sm:section-title text-sm font-bold'>
                Company Profile
              </h2>
              <p className='para-text--extra-small pt-3 font-medium opacity-50'>
                Update your company information and details here.
              </p>
            </div>
            <div className='flex flex-wrap gap-2 px-4 sm:gap-3 sm:px-5'>
              <Button variant='outline' type='submit' className='px-6 py-2'>
                Cancel
              </Button>
              <Button type='submit' className='px-6 py-2'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Save
              </Button>
            </div>
          </div>
          <div className='border-grey-900 mx-6 mt-6 border-b opacity-25'></div>
          <div className='mt-6 flex w-11/12 flex-row justify-between gap-4 px-9'>
            <div className='flex flex-col gap-2'>
              <h2 className='section-title font-bold'>Public Profile</h2>
              <p className='para-text--extra-small font-medium opacity-50'>
                This will be displayed on your profile
              </p>
            </div>
            <div className='w-1/2 font-poppins text-[10px] font-medium sm:text-xs'>
              <FormField
                control={form.control}
                name='company_name'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type='text'
                        placeholder='Company Name'
                        className='border border-custom-border bg-transparent placeholder:text-gray-500'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className='mb-4 mt-4 flex items-center overflow-hidden rounded-md border border-custom-border'>
                <Image
                  src='/assets/setting/company-info/link.svg'
                  alt='Add Vendor Icon'
                  width={16}
                  height={16}
                  className='ms-4'
                />
                <span className='para-text--small whitespace-nowrap px-2 py-2 font-medium text-gray-500 sm:px-3'>
                  app.fairsplit.us/profile/
                </span>
                <input
                  type='text'
                  defaultValue={form.formState.defaultValues?.company_name}
                  className='para-text--small flex-grow border-l border-custom-border p-2 font-medium placeholder-black'
                  placeholder='Company name'
                />
              </div>
            </div>
          </div>
          <div className='border-opacity-24 mx-4 mb-4 mt-4 border border-gray-200 sm:mx-8'></div>
          <div className='mt-6 flex w-[84%] flex-col px-9 sm:flex-row'>
            <div className='flex w-1/2 flex-col gap-2'>
              <h2 className='section-title font-bold'>Company Files</h2>
              <p className='para-text--extra-small w-1/2 font-medium opacity-50'>
                Update your company information and choose if you want it to be
                displayed on your documentation
              </p>
            </div>
            <div className='-ml-2 flex w-1/2 justify-center font-poppins text-[10px] text-gray-500 sm:text-sm'>
              <FormField
                control={form.control}
                name='company_files'
                render={({ field }) => (
                  <FormItem className='mb-7 w-[84%] px-7'>
                    <FormControl className='flex h-[120px] w-full flex-col items-center rounded-lg border border-gray-500 border-opacity-45'>
                      <div className='relative flex items-center'>
                        <Input
                          id='file-upload'
                          type='file'
                          // accept='.pdf'
                          className='hidden'
                          onChange={(e) => {
                            field.onChange(
                              e.target.files ? e.target.files[0] : null,
                            );
                            if (e.target.files)
                              handleProcessCSV(e.target.files[0]);
                          }}
                        />
                        <label
                          htmlFor='file-upload'
                          className='para-text--extra-small flex h-full w-1/2 cursor-pointer flex-col items-center justify-center gap-2 text-center'
                        >
                          <Image
                            src='/assets/vendors/file-upload.svg'
                            alt='uploadFile'
                            width={41}
                            height={41}
                          />
                          <span>
                            <b>Click to upload</b> or drag and drop SVG, PNG,
                            JPG or GIF (max 800 x 400px)
                          </span>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className='border-opacity-24 mx-4 mb-4 mt-4 border border-gray-200 sm:mx-8'></div>
          <div className='mt-6 flex w-4/5 flex-col px-9 pb-16 sm:flex-row'>
            <div className='flex w-3/5 flex-col gap-2'>
              <h2 className='section-title font-bold'>Internal System</h2>
              <p className='para-text--extra-small font-medium opacity-50'>
                Add documents and files
              </p>
            </div>
            <div className='-ml-3 w-2/5'>
              <FormField
                control={form.control}
                name='documents'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex w-1/2 items-start space-x-2'>
                        <Checkbox
                          variant='green'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor='documents'
                          className='para-text--small font-medium text-black'
                        >
                          Documents
                        </label>
                      </div>
                    </FormControl>
                    <p className='para-text--extra-small mb-4 font-medium opacity-50'>
                      Documents are in the system
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='compliances'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex items-start space-x-2 pt-5'>
                        <Checkbox
                          variant='green'
                          id='compliances'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label
                          htmlFor='compliances'
                          className='para-text--small font-medium text-black'
                        >
                          Compliance
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className='para-text--extra-small font-medium opacity-50'>
                Documents are in compliance
              </p>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default Companyinfo;
