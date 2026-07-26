/* eslint-disable @next/next/no-img-element */
'use client';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import React, { FC, useState } from 'react';

import '@/app/(financial_statements)/pdf-fonts.css';

import { toast } from '@/components/ui/use-toast';

import GeneralLedgerReport from '@/app/(financial_statements)/general-ledger/document';
import { GeneralLedgerReportTemplate } from '@/app/(financial_statements)/general-ledger/page';

interface Props {
  reportData: GeneralLedgerReportTemplate[];
}
const Report: FC<Props> = ({ reportData }: Props) => {
  const [loading, setLoading] = useState(false);
  const generatePDF = async () => {
    setLoading(true); // Set loading to true when starting the PDF generation
    try {
      const blob = await pdf(
        <GeneralLedgerReport reportData={reportData} />,
      ).toBlob();

      saveAs(blob, 'general-ledger.pdf');

      const pdfUrl = URL.createObjectURL(blob);

      window.open(pdfUrl);
    } catch (error: unknown) {
      toast({
        title: 'Failed to generate PDF',
        description: (error as Error).message || 'An unknown error occurred.', // Type assertion to Error
      });
    } finally {
      setLoading(false); // Set loading to false after the process is done
    }
  };

  return (
    <>
      <div className='ms-36 mt-6 flex items-center justify-center gap-3'>
        {/* Flex container to hold both buttons */}
        <button
          onClick={generatePDF}
          className='me-8 rounded-lg bg-transparent px-4 py-2 font-bold text-[#000000] shadow-md transition duration-300 ease-in-out'
          disabled={loading}
        >
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </button>
        {/* <button
          onClick={generateExcel}
          className='me-12 rounded-lg bg-transparent px-4 py-2 font-bold text-[#000000] shadow-md transition duration-300 ease-in-out'
          disabled={loading}
        >
          {loading ? 'Generating Excel...' : 'Download Excel'}
        </button> */}
      </div>
      <div className='m-auto mb-6 mt-4 max-w-[1070px] bg-[rgba(3,4,94,0.01)]'>
        <div>
          <div className='flex flex-col'>
            <div className='flex flex-row justify-between pt-6 text-[#03045E]'></div>
            <div className='mt-4 pb-5 pe-5 ps-5'>
              <GeneralLedgerReport reportData={reportData} />
            </div>
            <div className='mb-4 me-4 ms-4 bg-[rgba(3,4,94,0.03)]'>
              <img
                style={{
                  width: '130px',
                  float: 'inline-end',
                  marginRight: '20px',
                }}
                src='/assets/accounting-pdf/FairSplit.svg'
                alt=''
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;
