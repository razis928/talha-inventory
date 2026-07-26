/* eslint-disable react/jsx-no-undef */
'use client';
import {
  Document,
  Image as PDFIMAGE,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from '@react-pdf/renderer';
import React, { FC } from 'react';

import { Button } from '@/components/ui/button';

import styles from '@/app/(financial_statements)/budget-report/styles';
import { AccountPayableSubsidaryLedger } from '@/utils/financials/payables/payable-subsidary-ledger';

interface Props {
  ledgers: AccountPayableSubsidaryLedger[];
}
const Report: FC<Props> = ({ ledgers }: Props) => {
  return (
    <>
      <div className='bg-background'>
        {ledgers && ledgers.length > 0 ? (
          <div>
            <PDFDownloadLink
              document={<LedgerPDF ledger={ledgers[0]} />}
              // fileName={`ledger_${ledgers[0].name}.pdf`}
            >
              {({ url, loading }) => (
                <a
                  style={{ display: 'flex', justifyContent: 'flex-end' }}
                  href={url || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Button
                    style={{
                      position: 'relative',
                      top: '70px',
                      paddingLeft: '30px',
                      paddingRight: '30px',
                      right: '40px',
                    }}
                  >
                    {loading ? 'Loading...' : 'Download'}
                  </Button>
                </a>
              )}
            </PDFDownloadLink>
            <LedgerPDF ledger={ledgers[0]} />
          </div>
        ) : (
          <div className='my-auto'>
            <h2 className='text-center text-xl'>No data found</h2>
          </div>
        )}
      </div>
    </>
  );
};

export default Report;

// eslint-disable-next-line unused-imports/no-unused-vars
const LedgerPDF = ({ ledger }: { ledger: AccountPayableSubsidaryLedger }) => (
  <Document>
    <Page size='A3' style={styles.page}>
      <View
        style={{
          backgroundColor: 'white',
          padding: '10px 30px 40px 30px',
          marginBottom: '5px',
          marginTop: '5px',
        }}
      >
        <View style={styles.container}>
          <Text style={styles.heading}>BUDGET REPORT</Text>
        </View>

        <View
          style={{
            display: 'flex',
            backgroundColor: '#03045E',
            color: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: '10px',
            height: '80px',
            // justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                paddingLeft: '15px',
              }}
            >
              Items
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                paddingLeft: '300px',
              }}
            >
              Amount
            </Text>
          </View>
        </View>

        <View style={styles.liabilitiesHeading}>
          <Text style={{ position: 'relative', bottom: '1px' }}>
            Revenue Projections
          </Text>
        </View>

        {/* Asset rows manually added */}
        <View style={{ ...styles.assetsRow, marginTop: '10px' }}>
          <Text style={styles.assetsText}>Product A Sales</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Product B Sales</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Service Revenue</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={{ ...styles.assetsText, fontWeight: 400 }}>
            Total Revenue
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={{ ...styles.assetsText, fontWeight: 700 }}>
            Cost of good sold (COGS)
          </Text>
          <View style={styles.assetsValueContainer}></View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Raw Materials</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>

        <View style={styles.assetsRow1}>
          <Text style={styles.assetsText}></Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText}></Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}></Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Direct Labor</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>Manufacturing Overhead</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={styles.assetsText}> Total COGS:</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>

        <View style={styles.liabilitiesHeading}>
          <Text> Operating Expenses</Text>
        </View>

        {/* Liability rows manually added */}
        <View style={{ ...styles.assetsRow, marginTop: '10px' }}>
          <Text style={styles.assetsText}>Rent</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Wages and salaries</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Marketing</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={styles.assetsText}>Utilities</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={styles.assetsText}>Total Capital Expenditunes</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={{ ...styles.assetsText, fontWeight: 700 }}>
            Capital Expenditures
          </Text>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={styles.assetsText}>Equipment</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>

        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Technology</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>

        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={styles.assetsText}>Total Capital Expenditures</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={{ ...styles.assetsText, fontWeight: 700 }}>
            Contigency Fund
          </Text>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={styles.assetsText}>Reserve Fund</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>

        <View style={styles.equityHeading}>
          <Text>Net Profit</Text>
        </View>

        {/* Equity rows manually added */}
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>Total Revenue</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>
            Total Expenses (COGS + Operating + CapEx + Contigency)
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>Net Profit</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
          </View>
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#03045E0D',
            marginTop: '5px',
          }}
        >
          <Text style={{ marginLeft: '640px' }}>
            <PDFIMAGE
              style={{
                width: '100px',
                height: '30px',
              }}
              src='/assets/accounting-pdf/logo.png'
            />
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);
