'use client';
import {
  Document,
  Image as PDFIMAGE,
  Page,
  Text,
  View,
} from '@react-pdf/renderer';
import React from 'react';

import { payment } from '@/app/(financial_statements)/invoice/_components/data';
import { tableData } from '@/app/(financial_statements)/invoice/_components/data';
import styles from '@/app/(financial_statements)/invoice/_components/styles';

const pdfInvoice = () => {
  return (
    <>
      <Document>
        <Page size='A4' style={styles.page}>
          <View style={styles.section}>
            {/* 1st section */}
            <View
              style={{
                display: 'flex',
                flex: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ backgroundColor: '#f00', width: 170, height: 64 }}>
                <Text>....</Text>
                <PDFIMAGE
                  src='/assets/invoice/logo.png'
                  style={{ width: 170, height: 64 }}
                />
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  alignItems: 'flex-end',
                }}
              >
                <Text style={styles.invoice}>Invoice</Text>
                <Text style={styles.invoiceNumber}>#1223113</Text>
              </View>
            </View>
            {/* 1st sectionEnd */}
            {/* middleSection */}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '35%',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                <Text style={styles.heading}>Fairsplit</Text>
                <Text style={styles.Text}>
                  500 Howard street San Francisco, CA 94105
                </Text>
                <Text style={{ ...styles.Text, marginTop: 20 }}>Bill to:</Text>
                <Text style={styles.heading}>Tesla</Text>
                <Text style={styles.Text}>
                  500 Howard street San Francisco, CA 94105
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '60%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    width: '100%  ',
                  }}
                >
                  {payment.map((field, index) => (
                    <View
                      key={index}
                      style={{
                        ...styles.payment,
                        backgroundColor:
                          index === payment.length - 1 ? '#E7E8E9' : '',
                        padding: index === payment.length - 1 ? 13 : '',
                        fontWeight: index === payment.length - 1 ? 700 : 500,
                      }}
                    >
                      <Text
                        style={{
                          ...styles.feildPayment,
                          color:
                            index === payment.length - 1
                              ? '#000000'
                              : 'var(--gray-600)',
                          fontWeight: index === payment.length - 1 ? 700 : 500,
                        }}
                      >
                        {field.payment}
                      </Text>
                      <Text
                        style={{
                          ...styles.feildDetail,
                          fontWeight: index === payment.length - 1 ? 700 : 500,
                        }}
                      >
                        {field.detail}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {/* middleSectionEnd */}
            {/* 3rd section */}
            <View>
              <View>
                <View style={styles.tablehead}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '45%',
                      }}
                    >
                      <Text style={styles.cell}>Item</Text>
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '55%',
                        justifyContent: 'space-around',
                      }}
                    >
                      <Text
                        style={{
                          ...styles.cell,
                          width: '28%',
                          display: 'flex',
                          justifyContent: 'center',
                          // backgroundColor: '#faf',
                        }}
                      >
                        Quantity
                      </Text>
                      <Text
                        style={{
                          ...styles.cell,
                          width: '28%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          marginRight: 10,
                          // backgroundColor: '#aaf',
                        }}
                      >
                        Rate
                      </Text>
                      <Text
                        style={{
                          ...styles.cell,
                          width: '28%',
                          display: 'flex',
                          justifyContent: 'center',
                          // backgroundColor: '#faa',
                        }}
                      >
                        Amount
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View>
                <View style={styles.tablebody}>
                  {tableData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          width: '45%',
                        }}
                      >
                        <Text
                          style={{
                            ...styles.cell,
                            width: '80%',
                          }}
                        >
                          {item.Item}
                        </Text>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          width: '55%',
                          justifyContent: 'space-around',
                        }}
                      >
                        <Text
                          style={{
                            ...styles.cell,
                            width: '30%',
                            display: 'flex',
                            justifyContent: 'center',
                            ...(item.styling ? item.styling : {}),
                            // backgroundColor: '#f0f',
                          }}
                        >
                          {item.Quantity}
                        </Text>
                        <Text
                          style={{
                            ...styles.cell,
                            width: '30%',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginRight: 5,
                            // backgroundColor: '#a0f',
                          }}
                        >
                          {item.Rate}
                        </Text>
                        <Text
                          style={{
                            ...styles.cell,
                            width: '30%',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            // backgroundColor: '#790e79',
                            ...(item.styling ? item.styling : {}),
                          }}
                        >
                          {item.Amount}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            {/* 3rd sectionEnd */}
          </View>
        </Page>
      </Document>
    </>
  );
};

export default pdfInvoice;
