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

import styles from '@/app/(financial_statements)/account-payable-subsidiary-ledger/style';
import { AccountPayableSubsidaryLedger } from '@/utils/financials/payables/payable-subsidary-ledger';

interface Props {
  ledgers: AccountPayableSubsidaryLedger[];
}

const Report: FC<Props> = ({ ledgers }: Props) => {
  return (
    <div className='bg-WHITE'>
      {/* Single PDF for all data */}
      <PDFDownloadLink
        document={<LedgerPDF ledgers={ledgers} />}
        fileName='accounts_payable_vendor_list.pdf'
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
                position: 'relative',
                top: '10px',
                right: '10px',
                paddingLeft: '30px',
                paddingRight: '30px',
                marginBottom: '20px',
              }}
            >
              {loading ? 'Loading...' : 'Download '}
            </Button>
          </a>
        )}
      </PDFDownloadLink>
      <LedgerPDF ledgers={ledgers} />
    </div>
  );
};

export default Report;

// Consolidated PDF Component
const LedgerPDF = ({
  ledgers,
}: {
  ledgers: AccountPayableSubsidaryLedger[];
}) => (
  <Document>
    <Page style={styles.page} size='A3'>
      {/* Header */}
      <View
        style={{
          ...styles.header,
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Text>ACCOUNTS PAYABLE SUBSIDIARY LEDGER</Text>
      </View>

      {ledgers.map((ledger) => (
        <View key={ledger.id} style={{ marginBottom: 20 }}>
          {/* Vendor Section */}
          <View style={styles.vendorSection}>
            <View style={styles.column}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{ledger.company_name}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{ledger.address}</Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCellWide}>Item</Text>{' '}
            {/* Wide Item cell */}
            <Text style={styles.tableCell}>Tag Code</Text>
            <Text style={styles.tableCell}>Tax Payer ID</Text>
            <Text style={styles.tableCell}>PostRef</Text>
            <Text style={styles.tableCell}>Debit</Text>
            <Text style={styles.tableCell}>Credit</Text>
            <Text style={styles.tableCell}>Balance</Text>
          </View>

          {/* Table Rows */}
          {ledger.invoices?.map((invoice) => (
            <View style={styles.tableRow} key={invoice.code}>
              <Text style={styles.tableCell}>{invoice.date}</Text>
              <Text style={styles.tableCellWide}>
                {invoice.description}
              </Text>{' '}
              {/* Same wide style */}
              <Text style={styles.tableCell}>{invoice.code}</Text>
              <Text style={styles.tableCell}>{invoice.ein}</Text>
              <Text style={styles.tableCell}>{invoice.postRef}</Text>
              <Text style={styles.tableCell}>{invoice.debit}</Text>
              <Text style={styles.tableCell}>{invoice.credit}</Text>
              <Text style={styles.tableCell}>{invoice.balance}</Text>
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);
