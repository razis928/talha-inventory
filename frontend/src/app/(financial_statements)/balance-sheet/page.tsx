import { Document, Page, Text, View } from '@react-pdf/renderer';
import Image from 'next/image';
import React from 'react';

import '@/app/(financial_statements)/pdf-fonts.css';

// Define the styles
import {
  assets,
  liabilities,
  shareholderEquity,
} from '@/app/(financial_statements)/balance-sheet/mockdata';
import styles from '@/app/(financial_statements)/balance-sheet/style';
import { getCompanyTransactionsWithVendorsDetails } from '@/utils/financials/payables/account-payable';
import {
  AccountReceivable,
  getCompanyTransactionsWithClientsDetails,
} from '@/utils/financials/receivables/account-receivable';

import { AccountPayables } from '@/types/vendor';

const BalanceSheet = async () => {
  const totalAssetsValue = '0$';
  const totalLiabilitiesValue = '0$';
  const totalEquityValue = '0$';
  // Function to clean up the "$" symbol and convert to number
  const parseAmount = (amount: string) => {
    return parseFloat(amount.replace('$', '').replace(',', ''));
  };

  const accountReceivables =
    (await getCompanyTransactionsWithClientsDetails()) as unknown as AccountReceivable[];
  const accountPayables =
    (await getCompanyTransactionsWithVendorsDetails()) as unknown as AccountPayables[];

  //  Given data from the mockdata
  const total_revenue = accountReceivables.reduce((sum, item) => {
    return sum + parseAmount(item.received_amount.toString()); // Add the cleaned amount to the sum
  }, 0);

  const total_expenses = accountPayables.reduce((sum, item) => {
    return sum + parseAmount(item.amount); // Add the cleaned amount to the sum
  }, 0);
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.heading}>Sample Company</Text>
          <Text>
            Date:
            {new Date().toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#03045E',
            marginTop: '20px',
            color: 'white',
          }}
        >
          <Text
            style={{
              paddingTop: '20px',
              fontSize: '18px',
              fontWeight: 'bold',
              paddingLeft: '15px',
            }}
          >
            Balance Sheet
          </Text>
          <View
            style={{
              display: 'flex',
              gap: '90px',
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '45px',
              }}
            >
              <Text style={{ fontWeight: 'bold', paddingLeft: '30px' }}>
                2023
              </Text>
              <Text>Prior Year</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '45px',
                paddingRight: '10px',
              }}
            >
              <Text style={{ fontWeight: 'bold', paddingLeft: '50px' }}>
                2024
              </Text>
              <Text>Current Year</Text>
            </View>
          </View>
        </View>

        <View style={styles.liabilitiesHeading}>
          <Text>Assets</Text>
        </View>

        {/* Map through the assets array to create asset rows */}
        {assets.map((asset, index) => {
          // Apply border style for the 4th and 8th rows
          let rowStyle;
          if (
            asset.label === '' &&
            asset.value === '' &&
            asset.description === ''
          ) {
            rowStyle = styles.assetsRowEmpty; // Apply empty row style
          } else if (index === 4 || index === 8) {
            rowStyle = styles.assetsRowWithBorder; // Apply border style
          } else {
            rowStyle = styles.assetsRow; // Default style
          }

          return (
            <View key={index} style={rowStyle}>
              <Text style={styles.assetsText}>{asset.label}</Text>
              <View style={styles.assetsValueContainer}>
                <Text style={styles.assetsText}>{asset.value}</Text>
                <Text style={{ ...styles.assetsValueText, fontWeight: 400 }}>
                  {asset.label === 'Accounts Receivable'
                    ? '$' + total_revenue
                    : asset.description}
                </Text>
              </View>
            </View>
          );
        })}

        <View
          style={{
            ...styles.assetsTotal,
            fontWeight: 'bold',
            fontSize: '21px',
          }}
        >
          <Text
            style={{
              ...styles.assetsText,
              fontWeight: 'bold',
              fontSize: '19px',
            }}
          >
            Total current assets
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text
              style={{
                ...styles.assetsText,
                fontWeight: 600,
                fontSize: '19px',
              }}
            >
              {totalAssetsValue}
            </Text>
            <Text style={{ ...styles.assetsValueText, fontSize: '18px' }}>
              {total_revenue}$
            </Text>
          </View>
        </View>
        <Text
          style={{ borderBottom: '1px solid  #03045E', paddingTop: '1px' }}
        ></Text>

        <View style={styles.liabilitiesHeading}>
          <Text>Liabilities</Text>
        </View>

        {/* Map through the liabilities array to create liability rows */}
        {liabilities.map((liability, index) => {
          let rowStyle;
          // Apply empty row style if all fields are empty
          if (
            liability.label === '' &&
            liability.value === '' &&
            liability.description === ''
          ) {
            rowStyle = styles.assetsRowEmpty; // Apply empty row style
          } else {
            rowStyle = styles.assetsRow; // Default style
          }

          // Check if the current index is 3 to apply bottom border
          const borderBottomStyle =
            index === 3 ? { borderBottom: '1px solid  #03045E' } : {};

          return (
            <View key={index} style={{ ...rowStyle, ...borderBottomStyle }}>
              <Text style={styles.assetsText}>{liability.label}</Text>
              <View style={styles.assetsValueContainer}>
                <Text style={styles.assetsText}>{liability.value}</Text>
                <Text style={{ ...styles.assetsValueText, fontWeight: 500 }}>
                  {liability.label === 'Accounts payable'
                    ? '$' + total_expenses
                    : liability.description}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.assetsTotal}>
          <Text
            style={{
              ...styles.assetsText,
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            Total Liabilities
          </Text>
          <View style={styles.assetsValueContainer}>
            <Text
              style={{
                ...styles.assetsText,
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              {totalLiabilitiesValue}
            </Text>
            <Text
              style={{
                ...styles.assetsValueText,
                fontWeight: 600,
                fontSize: '18px',
              }}
            >
              {total_expenses}$
            </Text>
          </View>
        </View>
        <Text
          style={{ borderBottom: '1px solid  #03045E', paddingTop: '1px' }}
        ></Text>

        <View style={styles.equityHeading}>
          <Text>Shareholder's Equity</Text>
        </View>

        {/* Map through the shareholder equity array to create equity rows */}
        {shareholderEquity.map((equity, index) => {
          // Apply border style for the 2nd and 3rd rows
          let rowStyle;
          if (index === 1 || index === 2) {
            rowStyle = styles.assetsRowWithBorder; // Apply border style
          } else {
            rowStyle = styles.assetsRow; // Default style
          }

          return (
            <View
              key={index}
              style={{ ...rowStyle, paddingLeft: '15px', fontWeight: 500 }}
            >
              <Text style={equity.isBold ? { fontWeight: 'bold' } : {}}>
                {equity.label}:
              </Text>
              <View style={styles.assetsValueContainer}>
                <Text style={{ ...styles.assetsText, fontWeight: 400 }}>
                  {equity.value}
                </Text>
                <Text style={{ ...styles.assetsValueText, fontWeight: 500 }}>
                  {equity.description}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={styles.assetsTotal}>
          <Text
            style={{
              ...styles.assetsText,
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            Total current assets
          </Text>
          <View
            style={{
              ...styles.assetsValueContainer,
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            <Text
              style={{
                ...styles.assetsText,
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              {totalEquityValue}
            </Text>
            <Text
              style={{
                ...styles.assetsValueText,
                fontWeight: 600,
                fontSize: '18px',
              }}
            >
              0$
            </Text>
          </View>
        </View>
        <View
          style={{ borderBottom: '1px solid  #03045E', paddingTop: '1px' }}
        ></View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '30px',
          }}
        >
          <Text
            style={{
              fontSize: '20px',
              paddingLeft: '15px',
              color: '#000000',
              fontWeight: 500,
            }}
          >
            Balance
          </Text>
          <Text
            style={{
              fontSize: '18px',
              color: '#000000',
              fontWeight: 400,
              position: 'relative',
              left: 180,
            }}
          >
            $0,00
          </Text>
          <Text style={{ fontSize: '18px', color: '#000000', fontWeight: 700 }}>
            $0,00
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(3, 4, 94, 0.05)',
            width: '830px',
            margin: 'auto',
            paddingTop: '20px',
            paddingBottom: '20px',
            marginTop: '70px',
            // height: '80px',
          }}
        >
          <Text
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              fontSize: '18px',
              color: ' #03045E',
              fontWeight: 500,
              gap: '40px',
              paddingRight: '50px',
            }}
          >
            <Image
              src='/assets/accounting-pdf/FairSplit.svg'
              alt='pencil'
              height={100}
              width={100}
            />
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default BalanceSheet;
