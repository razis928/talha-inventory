'use client';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';

import styles from '@/app/(financial_statements)/debt-cancellation/_components/style';
const cancallation = () => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.section}>
          {/* 1st half section */}
          <View
            style={{
              width: '40%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: 1,
              borderStyle: 'solid',
              borderColor: 'hsla(var(--black-opacity))',
            }}
          >
            {/* 1.1 */}
            <View
              style={{
                ...styles.pL_16,
                ...styles.border_bottom,
                height: '40%',
              }}
            >
              <Text style={styles.text}>
                Creditor’s name,street address,city or town,state or
                province,country,ZIP OR foreign postal code and telephone no.
              </Text>
            </View>
            {/* 1.1 end */}
            {/* 1.2 */}
            <View
              style={{
                ...styles.pL_16,
                ...styles.border_bottom,
                display: 'flex',
                flexDirection: 'row',
                height: '12%',
                marginBottom: 5,
              }}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '50%',
                  ...styles.border_Right,

                  paddingBottom: 5,
                }}
              >
                <Text style={{ ...styles.text, fontWeight: 500, marginTop: 5 }}>
                  CREDITORS’S TIN
                </Text>
                <Text
                  style={{
                    ...styles.font_20,
                    fontWeight: 600,
                  }}
                >
                  12-3456789
                </Text>
              </View>
              <View
                style={{
                  ...styles.pL_16,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '50%',
                }}
              >
                <Text style={{ ...styles.text, fontWeight: 500, marginTop: 5 }}>
                  DEBTORS’S TIN
                </Text>
                <Text
                  style={{
                    ...styles.font_20,
                    fontWeight: 600,
                  }}
                >
                  12-3456789
                </Text>
              </View>
            </View>
            {/* 1.2 end */}
            {/* 1.3 */}
            <View style={{ ...styles.border_bottom }}>
              <View
                style={{
                  ...styles.pL_16,
                  paddingTop: 25,
                  paddingBottom: 15,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '40%',
                }}
              >
                <Text style={{ ...styles.text, fontWeight: 500 }}>
                  DEBTOR’S name
                </Text>
                <Text style={styles.text_highlight}>Peter Payer</Text>
                <Text style={{ ...styles.text, fontWeight: 500 }}>
                  Street address(including apt. no)
                </Text>
                <Text style={styles.text_highlight}>5678 Short Ave</Text>
                <Text style={{ ...styles.text, fontWeight: 500 }}>
                  City or town, state or province, country, and ZIP or foreign
                  postal code
                </Text>
                <Text style={styles.text_highlight}>
                  Littleville,US State, 67890
                </Text>
              </View>
            </View>
            {/* 1.3 end */}
            {/* 1.4 */}
            <View
              style={{
                paddingTop: 5,
                paddingBottom: 25,
              }}
            >
              <Text
                style={{
                  ...styles.pL_16,
                  ...styles.text,
                  fontWeight: 500,
                  height: '8%',
                }}
              >
                Account number (see instructions)
              </Text>
            </View>
            {/* 1.4 end */}
          </View>
          {/* 2nd half section */}
          <View
            style={{ width: '60%', display: 'flex', flexDirection: 'column' }}
          >
            <View
              style={{ height: '35%', display: 'flex', flexDirection: 'row' }}
            >
              <View
                style={{
                  ...styles.border_Right,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  width: '33.3%',
                }}
              >
                <Text
                  style={{
                    ...styles.text,
                    ...styles.pL_16,
                    paddingTop: 22,
                    ...styles.border_bottom,
                    height: '33.3%',
                  }}
                >
                  1. Date of identifiable event
                </Text>
                <Text
                  style={{
                    ...styles.text,
                    ...styles.pL_16,
                    paddingTop: 22,
                    ...styles.border_bottom,
                    height: '33.3%',
                  }}
                >
                  2. Amount of debt discharged
                </Text>
                <Text
                  style={{
                    ...styles.text,
                    ...styles.pL_16,
                    paddingTop: 22,
                    ...styles.border_bottom,
                    height: '33.3%',
                  }}
                >
                  3. Interest, if included in box 2
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '33.3%',
                  ...styles.pL_16,
                  ...styles.border_bottom,
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'left',
                }}
              >
                <Text
                  style={{
                    ...styles.text,
                  }}
                >
                  OMB No. 1545-0116
                </Text>
                <Text style={styles.font_48}>1099-C</Text>
                <Text style={styles.font_15}>(Rev. January 2022)</Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '33.3%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...styles.border_bottom,
                  ...styles.border_Left,
                }}
              >
                <Text
                  style={{
                    ...styles.font_20,
                    textAlign: 'center',
                  }}
                >
                  Nonemployee Compensation
                </Text>
              </View>
            </View>
            <View
              style={{ height: '65%', display: 'flex', flexDirection: 'row' }}
            >
              <View
                style={{
                  width: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...styles.border_Right,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: '40%',
                    ...styles.border_bottom,
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                    }}
                  >
                    4. Debt description
                  </Text>
                </View>
                <View
                  style={{
                    width: '100%',
                    height: '30%',
                    ...styles.border_bottom,
                    border: 'solid',
                    borderColor: '#000000',
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                    }}
                  >
                    5. Check here if the debitor was personally liable for
                    repayment of the debt
                  </Text>
                </View>
                <View
                  style={{
                    // width: '70%',
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    height: '30%',
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      width: '50%',
                      ...styles.pL_16,
                      ...styles.border_Right,

                      paddingTop: 5,
                    }}
                  >
                    6. Identified event code
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      width: '50%',
                      paddingTop: 5,
                    }}
                  >
                    7. Fair market value of property
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: '25%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'right',
                  paddingRight: 5,
                }}
              >
                <Text style={styles.font_20}>Copy A</Text>
                <Text
                  style={{
                    ...styles.font_18,
                    marginTop: 5,
                    marginBottom: 5,
                  }}
                >
                  For
                  <br /> Internal Revenue service center
                </Text>
                <Text style={{ ...styles.text }}>
                  File with form 1096 for privacy Act and paperwork rduction act
                  notice,see the current general instructions for certain
                  informations for certain information returns
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default cancallation;
