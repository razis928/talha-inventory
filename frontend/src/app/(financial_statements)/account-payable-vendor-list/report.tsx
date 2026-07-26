'use client';
import {
  Document,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from '@react-pdf/renderer';
import React, { FC } from 'react';

import { Button } from '@/components/ui/button';

import styles from '@/app/(financial_statements)/account-payable-vendor-list/style';
import { VendorList } from '@/utils/financials/payables/payable-vendors-list';

interface Props {
  ledgers: VendorList[];
}

const Report: FC<Props> = ({ ledgers }: Props) => {
  return (
    <div className='bg-white'>
      {/* PDF Download Link at the top */}
      <PDFDownloadLink
        document={<LedgerPDF ledgers={ledgers} />}
        fileName='ledger_all.pdf'
      >
        {({ url, loading }) => (
          <a
            style={{ float: 'inline-end' }}
            href={url || '#'}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button
              style={{
                width: '130px',
                marginRight: '5px',
                marginTop: '5px',
                marginBottom: '5px',
                position: 'relative',
                top: '8px',
              }}
            >
              {loading ? 'Loading...' : 'Download'}
            </Button>
          </a>
        )}
      </PDFDownloadLink>

      {/* Render PDF content as a preview */}
      <LedgerPDF ledgers={ledgers} />
    </div>
  );
};

export default Report;

const LedgerPDF = ({ ledgers }: { ledgers: VendorList[] }) => (
  <Document>
    <Page style={styles.page} size='A3'>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ paddingLeft: '17px' }}></View>
        <View style={{ flex: 4, paddingLeft: '20px' }}>
          <Text>ACCOUNTS PAYABLE VENDOR LIST</Text>
        </View>
      </View>

      {/* Vendor Section */}
      <View style={styles.vendorSection}></View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableCell45}>PHONE</Text>
        <Text
          style={{
            ...styles.tableCellWide,
            textAlign: 'center',
          }}
        >
          ADDRESS
        </Text>
        <Text style={styles.tableCell}>VENDOR NAME</Text>
        <Text style={styles.tableCellID}>TAG CODE</Text>
        <Text style={styles.tableCell}>CONTACT</Text>
        <Text style={styles.tableCell}>BALANCE</Text>
      </View>

      {/* Table Rows for all ledgers */}
      {ledgers.map((ledger) => (
        <View key={ledger.id} style={{ marginBottom: '20px' }}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell46}>{ledger.phone}</Text>
            <Text
              style={{
                ...styles.tableCellWide,
                textAlign: 'center',
              }}
            >
              {ledger.address_1}
            </Text>
            <Text style={styles.tableCell}>{ledger.company_name}</Text>
            <Text style={styles.tableCellID}>{ledger.company_tagging_id}</Text>
            <Text style={styles.tableCell}>{ledger.contact_name}</Text>
            <Text style={styles.tableCellNoborder}>{ledger.balance}</Text>
          </View>
        </View>
      ))}
    </Page>
  </Document>
);
