import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';

import { balanceInfo } from '@/app/(financial_statements)/bank-reconciliation/mockdata';
import { reconcilingItems } from '@/app/(financial_statements)/bank-reconciliation/mockdata';
import styles from '@/app/(financial_statements)/bank-reconciliation/styles';

const MyDocument = () => (
  <Document>
    {/* Outer View for background color and border */}
    <View
      style={{
        padding: '20px', // Space between border and content
      }}
    >
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.tableHeader}>
            <Text
              style={{
                ...styles.title,
                color: 'rgba(239,23,34,1)',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              ADDRESS
            </Text>
            <Text style={styles.title}>Bank ID#</Text>
            <Text style={{ ...styles.title, color: 'rgba(239,23,34,1)' }}>
              BANK NAME: ACCT#
            </Text>
            <Text style={{ ...styles.title, color: 'rgba(239,23,34,1)' }}>
              DATE:
            </Text>
          </View>

          {/* Table for Balance Information */}
          <View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                marginTop: '20px',
              }}
            >
              <View
                style={{ flex: '1', backgroundColor: 'rgba(3, 4, 94, 0.86)' }}
              ></View>
              <View
                style={{
                  backgroundColor: 'rgba(3, 4, 94, 0.86)',
                  width: '100%',
                  color: 'white',
                  textAlign: 'justify',
                  flex: '1',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'var(--font-DM_Serif_Display)',
                    fontWeight: 700,
                    paddingLeft: '100px',
                  }}
                >
                  Operating
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Information Rows */}
          {balanceInfo.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.cell}>{item.label}</Text>
              <Text style={styles.cellBorder}>{item.value}</Text>
              <Text style={styles.cellBorder}></Text>
            </View>
          ))}

          {/* Reconciling Items */}
          <View style={{ display: 'flex', lineHeight: '40px', height: '40vh' }}>
            <Text
              style={{
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                flex: 2.6,
                borderLeft: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <View
                style={{
                  position: 'relative',
                  top: 100,
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                }}
              >
                <Text style={{ paddingLeft: '14px' }}>Reconciling Items:</Text>
                <br />
                {reconcilingItems.map((item, index) => (
                  <Text style={{ paddingLeft: '14px' }} key={index}>
                    {item.label} {item.value} <br />
                  </Text>
                ))}
              </View>
            </Text>
            <Text
              style={{
                flex: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
                paddingRight: '5px',
              }}
            ></Text>
            <Text
              style={{
                flex: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
                paddingRight: '6px',
              }}
            ></Text>
          </View>

          {/* Outstanding Checks Section */}
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderRight: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View
              style={{ flex: 1, backgroundColor: 'rgba(3, 4, 94, 0.86)' }}
            ></View>
            <View
              style={{ flex: 2.3, backgroundColor: 'rgba(3, 4, 94, 0.86)' }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 500,
                  paddingLeft: '77px',
                  color: 'white',
                }}
              >
                Outstanding Checks
              </Text>
            </View>
            <View></View>
          </View>

          {/* Prepared by Section */}
          <View
            style={{
              display: 'flex',
              borderLeft: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View
              style={{
                flex: 1.7,
                fontFamily: 'var(--font-DM_Serif_Display)',
                fontWeight: 500,
                position: 'relative',
                top: 220,
                // Bottom border added here
              }}
            >
              <Text style={{ paddingLeft: '10px' }}></Text> <br />
              <Text
                style={{
                  paddingLeft: '10px',
                }}
              ></Text>
            </View>
            <View
              style={{
                flex: 0.8,
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
                height: '180px',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                  paddingLeft: '10px',
                }}
              >
                Date
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                borderRight: '1px solid rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                  paddingLeft: '10px',
                }}
              >
                Check#
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                  paddingLeft: '10px',
                }}
              >
                Amount:
              </Text>
            </View>
          </View>

          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              borderRight: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View
              style={{ flex: 1, backgroundColor: 'rgba(3, 4, 94, 0.86)' }}
            ></View>
            <View
              style={{ flex: 2.3, backgroundColor: 'rgba(3, 4, 94, 0.86)' }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 500,
                  paddingLeft: '79px',
                  color: 'white',
                }}
              >
                In transit Deposits
              </Text>
            </View>
            <View></View>
          </View>

          {/* Prepared by Section */}
          <View
            style={{
              display: 'flex',
              borderLeft: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View
              style={{
                flex: 1.7,
                fontFamily: 'var(--font-DM_Serif_Display)',
                fontWeight: 400,
                position: 'relative',
                top: 100,
                // Bottom border added here
              }}
            >
              <Text style={{ paddingLeft: '10px' }}>Prepared by:</Text> <br />
              <Text
                style={{
                  paddingLeft: '10px',
                }}
              >
                Date:
              </Text>
            </View>
            <View
              style={{
                flex: 0.8,
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
                height: '100px',
                borderBottom: '1px solid rgba(0,0,0,0.1)', // Bottom border for the Date view
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                  paddingLeft: '10px',
                }}
              >
                Date:
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                borderRight: '1px solid rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                  paddingLeft: '10px',
                }}
              >
                Doc Num
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-DM_Serif_Display)',
                  fontWeight: 400,
                  paddingLeft: '10px',
                }}
              >
                Amount
              </Text>
            </View>
          </View>

          {/* Additional Rows */}
          <View
            style={{
              display: 'flex',
              borderLeft: '1px solid rgba(0,0,0,0.1)',
              // borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View style={{ flex: 1.7 }}>
              <Text></Text>
            </View>
            <View
              style={{
                flex: 0.8,
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
                height: '50px',
              }}
            >
              <Text></Text>
            </View>
            <View
              style={{
                flex: 1,
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
            <View
              style={{
                flex: 1,

                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
          </View>
          {/* Additional Rows */}
          <View
            style={{
              display: 'flex',
              // borderLeft: '1px solid rgba(0,0,0,0.1)',
              // borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View style={{ flex: 1.2 }}>
              <Text></Text>
            </View>
            <View
              style={{
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
            <View
              style={{
                flex: 1,
                borderRight: '1px solid rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
            <View
              style={{
                flex: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
          </View>
          {/* Additional Rows */}
          <View
            style={{
              display: 'flex',
              borderLeft: '1px solid rgba(0,0,0,0.1)',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <View style={{ flex: 1.7 }}>
              <Text></Text>
            </View>
            <View
              style={{
                flex: 0.8,
                borderLeft: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
                height: '60px',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
            <View
              style={{
                flex: 1,
                borderRight: '1px solid rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
            <View
              style={{
                flex: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                borderRight: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <Text></Text>
            </View>
          </View>
        </View>
      </Page>
    </View>
  </Document>
);

export default MyDocument;
