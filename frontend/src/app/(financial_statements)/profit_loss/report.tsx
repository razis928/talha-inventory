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

import styles from '@/app/(financial_statements)/profit_loss/styles';
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
              fileName={`ledger_${ledgers[0].company_name}.pdf`}
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
          <Text style={styles.heading}>PROFIT & LOSS STATEMENT</Text>
          <Text style={{ paddingTop: '5px' }}>Date: 27 September 2024</Text>
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
            justifyContent: 'space-between',
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
              items
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '30px',
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                left: '80px',
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                  paddingTop: '10px',
                }}
              >
                Previous[period] in
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                }}
              >
                incert currency
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '10px',
                position: 'relative',
                left: '80px',
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                  paddingTop: '10px',
                }}
              >
                Current year[period]in
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                }}
              >
                incert currency
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '10px',
                position: 'relative',
                left: '20px',
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                  paddingTop: '10px',
                  position: 'relative',
                  left: '10px',
                }}
              >
                Amount increase or(decrease)
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                  position: 'relative',
                  left: '10px',
                }}
              >
                incert currency
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '10px',
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                  paddingTop: '10px',
                }}
              >
                percentage increase
              </Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  paddingLeft: '30px',
                  fontSize: '13px',
                }}
              >
                (or decrease)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.liabilitiesHeading}>
          <Text style={{ position: 'relative', bottom: '1px' }}>
            Operating revenue
          </Text>
        </View>

        {/* Asset rows manually added */}
        <View style={{ ...styles.assetsRow, marginTop: '10px' }}>
          <Text style={styles.assetsText}>Net sales</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Cost of goods sold (COGS)</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>
            Gross profit (Net sales - COGS) (A)
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={{ ...styles.assetsText, fontWeight: 700 }}>
            Expenses
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={{ ...styles.assetsText, fontWeight: 400 }}>
            Operating expenses
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Selling expenses</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
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
          <Text style={styles.assetsText}>Salaries and wages</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>Commissions</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}> Marketing, advertising</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}> Depreciation</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={styles.assetsText}> Total selling expenses (B)</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>

        <View style={styles.liabilitiesHeading}>
          <Text> General and administrative expenses</Text>
        </View>

        {/* Liability rows manually added */}
        <View style={{ ...styles.assetsRow, marginTop: '10px' }}>
          <Text style={styles.assetsText}>Rent</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Wages and salaries</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Employee benefit</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={styles.assetsText}>Payroll taxes</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
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
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={styles.assetsText}>Insurance</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{
            ...styles.assetsRow,
          }}
        >
          <Text style={styles.assetsText}>Amortization and depreciation</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>

        <View style={styles.assetsRow}>
          <Text style={styles.assetsText}>Office supplies</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
                position: 'relative',
                right: '80px',
              }}
            >
              0
            </Text>
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
          <Text style={styles.assetsText}>Postage</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={styles.assetsText}>
            Equipment rental and maintenance
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>
            Total general and
            <Text>administrative expenses (C)</Text>
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={{ ...styles.assetsRow }}>
          <Text style={styles.assetsText}>
            Total operating expenses (B + C)
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View
          style={{ ...styles.assetsRow, borderBottom: '1px solid #03045E' }}
        >
          <Text style={styles.assetsText}>
            Income from operations
            <Text>(A - Total operating expenses)</Text>
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>

        <View style={styles.equityHeading}>
          <Text>Other expenses</Text>
        </View>

        {/* Equity rows manually added */}
        <View style={{ ...styles.assetsRowWithBorder, marginTop: '2px' }}>
          <Text style={styles.assetsText}>Interest expense</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRowWithBorder2}>
          <Text style={styles.assetsText}>
            Net income before tax
            <Text>(Income from operations)</Text>
            <Text> (- Interest expense)</Text>
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.assetsRowWithBorder3}>
          <Text style={styles.assetsText}>Taxes</Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText23}>0$</Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
              0
            </Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '50px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 400,
              }}
            >
              0
            </Text>
          </View>
        </View>

        <View style={styles.assetsTotal1}>
          <View></View>
        </View>

        <View style={styles.assetsRowWithBorder9}>
          <Text
            style={{ ...styles.assetsText, fontSize: '16px', fontWeight: 700 }}
          >
            Net income (Net income before tax - Taxes)
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text style={styles.assetsText}></Text>
            <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}></Text>
            <Text
              style={{
                ...styles.assetsText,
                position: 'relative',
                right: '40px',
                fontWeight: 700,
                fontSize: '16px',
              }}
            >
              0$
            </Text>
            <Text
              style={{
                ...styles.assetsValueText6,
                fontWeight: 700,
                fontSize: '16px',
                width: '100%',
              }}
            >
              0$
            </Text>
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
