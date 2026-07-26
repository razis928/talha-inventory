'use client';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import Image from 'next/image';
import { useState } from 'react';

import styles from '@/app/(financial_statements)/accountant/styles';

import Dropdown from './components/dropdown';

const headers = [
  'Location',
  'Posted date',
  'Doc date',
  'Doc',
  'Memo',
  'Location Name',
  'JNL',
  'Debit',
  'Credit',
  'Balance',
];

const data = [
  {
    location: ['Totals for "X Name" – CASH: "Name"', 'eeeeeee', 'eewasss'],
    postedDate: ['xx/xx/xxxx', 'xx/xx/xxxx', '09/000/98'],
    docDate: ['xx/xx/xxxx', 'xx/xx/xxxx'],
    doc: [
      'INV-1234',
      'REC-1234',
      'CHK-1234',
      'PO-1234',
      'CON-1234',
      'CHK-1234',
      'PO-1234',
    ],
    memo: [
      'INV-1234',
      'REC-1234',
      'CHK-1234',
      'PO-1234',
      'CON-1234',
      'CHK-1234',
      'PO-1234',
    ],
    locationName: [
      'INV-1234',
      'REC-1234',
      'CHK-1234',
      'PO-1234',
      'CON-1234',
      'CHK-1234',
      'PO-1234',
      'PO-1234',
      'PO-1234',
      'po-eeeeeeeeee',
      'po-eeeeeeeeee',
      'eeeeeeeeee',
    ],
    jnl: [
      'INV-1234',
      'REC-1234',
      'CHK-1234',
      'PO-1234',
      'CON-1234',
      'CHK-1234',
      'PO-1234',
    ],
    debit: ['rrrrooo', 'ppppp', '99999999', 'eeeeededee'],
    credit: ['Credit1', 'Credit2', 'Credit3', 'Credit4'],
    balance: ['Balance1', 'Balance2', 'Balance3', 'Balance4'],
  },
];

const AccountantPDF: React.FC = () => {
  const [dropdownVisible, setDropdownVisible] = useState<{
    memo: boolean;
    jnl: boolean;
  }>({
    memo: false,
    jnl: false,
  });
  const [dropdownPosition, setDropdownPosition] = useState<{
    memo: number;
    jnl: number;
  }>({
    memo: 0,
    jnl: 0,
  });

  const toggleDropdown = (type: 'memo' | 'jnl') => {
    setDropdownPosition((prevPosition) => ({
      ...prevPosition,
      [type]: 60, // Set the position for dropdown
    }));
    setDropdownVisible((prevVisibility) => ({
      ...prevVisibility,
      [type]: !prevVisibility[type],
    }));
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header Row */}
        <View style={styles.header}>
          {headers.map((header, index) => (
            <View
              key={index}
              style={
                index === 0
                  ? styles.wideColumn
                  : index === headers.length - 1
                    ? styles.lastColumn
                    : styles.column
              }
            >
              <View
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px',
                }}
              >
                <Text>{header}</Text>
                {header === 'Memo' && (
                  <>
                    <Image
                      alt='Memo icon'
                      height={10}
                      width={10}
                      src='/assets/setting/team/access.svg'
                      onClick={() => toggleDropdown('memo')}
                      style={{ cursor: 'pointer' }}
                    />
                    {dropdownVisible.memo && (
                      <Dropdown
                        items={[
                          'Wire transfer',
                          'Check scanner Fee',
                          'Quick Books PMT',
                          'AP payment - ClearFly',
                          'NSP Paid item fee',
                        ]}
                        top={dropdownPosition.memo}
                        heading='Memo'
                      />
                    )}
                  </>
                )}
                {header === 'JNL' && (
                  <>
                    <Image
                      alt='JNL icon'
                      height={10}
                      width={10}
                      src='/assets/setting/team/access.svg'
                      onClick={() => toggleDropdown('jnl')}
                      style={{ cursor: 'pointer' }}
                    />
                    {dropdownVisible.jnl && (
                      <Dropdown
                        items={[
                          'JNL Item 1',
                          'JNL Item 2',
                          'JNL Item 3',
                          'JNL Item 4',
                        ]}
                        top={dropdownPosition.jnl}
                        heading='JNL'
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Data Rows */}
        {data.map((rowData, rowIndex) => {
          const maxLines = Math.max(
            rowData.location.length,
            rowData.postedDate.length,
            rowData.docDate.length,
            rowData.doc.length,
            rowData.memo.length,
            rowData.locationName.length,
            rowData.jnl.length,
            rowData.debit.length,
            rowData.credit.length,
            rowData.balance.length,
          );

          return (
            <View key={rowIndex}>
              {Array.from({ length: maxLines }).map((_, lineIndex) => (
                <View style={styles.row} key={lineIndex}>
                  {/* Location */}
                  <View style={styles.wideColumn}>
                    <Text>{rowData.location[lineIndex] || ''}</Text>
                  </View>

                  {/* Posted Date */}
                  <View style={styles.column}>
                    <Text>{rowData.postedDate[lineIndex] || ''}</Text>
                  </View>

                  {/* Doc Date */}
                  <View style={styles.column}>
                    <Text>{rowData.docDate[lineIndex] || ''}</Text>
                  </View>

                  {/* Doc */}
                  <View style={styles.column}>
                    <Text>{rowData.doc[lineIndex] || ''}</Text>
                  </View>

                  {/* Memo */}
                  <View style={styles.column}>
                    <Text>{rowData.memo[lineIndex] || ''}</Text>
                  </View>

                  {/* Location Name */}
                  <View style={styles.column}>
                    <Text>{rowData.locationName[lineIndex] || ''}</Text>
                  </View>

                  {/* JNL */}
                  <View style={styles.column}>
                    <Text>{rowData.jnl[lineIndex] || ''}</Text>
                  </View>

                  {/* Debit */}
                  <View style={styles.column}>
                    <Text>{rowData.debit[lineIndex] || ''}</Text>
                  </View>

                  {/* Credit */}
                  <View style={styles.column}>
                    <Text>{rowData.credit[lineIndex] || ''}</Text>
                  </View>

                  {/* Balance */}
                  <View style={styles.lastColumn}>
                    <Text>{rowData.balance[lineIndex] || ''}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default AccountantPDF;
