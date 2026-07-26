'use client';
import {
  Document,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from '@react-pdf/renderer';
import React from 'react';

import { Button } from '@/components/ui/button';

import styles from '@/app/(financial_statements)/taxes-report/style';

const Report = () => {
  return (
    <div className='bg-WHITE'>
      {/* Single PDF for all data */}
      <PDFDownloadLink document={<LedgerPDF />} fileName='taxes-report.pdf'>
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
      <LedgerPDF />
    </div>
  );
};

export default Report;

// Consolidated PDF Component
const LedgerPDF = () => (
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
        <Text>State and Federal Tax Rates</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        {/* Vendor Section */}
        <View style={styles.vendorSection}></View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellWide}>Taxable Income ($)</Text>
          <Text style={styles.tableCell}>State</Text>
          {/* Wide Item cell */}
          <Text style={styles.tableCell}>Federal Tax ($)</Text>
          <Text style={styles.tableCell}>TAG CODE</Text>
          <Text style={styles.tableCell}>State Tax ($)</Text>
          <Text style={styles.tableCellWide}>Total Tax Liability ($)</Text>
        </View>

        {/* Table Rows */}
        <View style={styles.tableRow}>
          <Text style={styles.tableCellWide}>1,000,000</Text>
          <Text style={styles.tableCell}>California</Text>
          {/* Same wide style */}
          <Text style={styles.tableCell}>210,000</Text>
          <Text style={styles.tableCell}>PCU1111-009</Text>
          <Text style={styles.tableCell}>$88,440</Text>
          <Text style={styles.tableCellWide}>$298,400</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellWide}>2,000,000</Text>
          <Text style={styles.tableCell}>California</Text>
          {/* Same wide style */}
          <Text style={styles.tableCell}>210,000</Text>
          <Text style={styles.tableCell}>PCU1111-009</Text>
          <Text style={styles.tableCell}>$88,440</Text>
          <Text style={styles.tableCellWide}>$298,400</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellWide}>3,000,000</Text>
          <Text style={styles.tableCell}>Texas</Text>
          {/* Same wide style */}
          <Text style={styles.tableCell}>210,000</Text>
          <Text style={styles.tableCell}></Text>
          <Text style={styles.tableCell}>$0</Text>
          <Text style={styles.tableCellWide}>$150,400</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCellWide}>5,000,000</Text>
          <Text style={styles.tableCell}>Naveda</Text>
          {/* Same wide style */}
          <Text style={styles.tableCell}>210,000</Text>
          <Text style={styles.tableCell}></Text>
          <Text style={styles.tableCell}>$0</Text>
          <Text style={styles.tableCellWide}>$420,400</Text>
        </View>
      </View>
    </Page>
  </Document>
);
