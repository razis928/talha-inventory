'use client';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';

import styles from '@/app/(financial_statements)/miscellaneous/style';
const miscellaneous = () => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View
          style={{ display: 'flex', justifyContent: 'center', gap: '50px' }}
        >
          <View>
            <Text>9595</Text>
          </View>
          <View style={styles.container}>
            <input
              type='checkbox'
              style={{
                accentColor: 'red',
                width: '20px',
                height: '20px',
              }}
            />
            <Text>VOID</Text>
          </View>
          <View style={styles.container}>
            <input
              type='checkbox'
              style={{
                accentColor: 'red',
                width: '20px',
                height: '20px',
              }}
            />
            <Text>CORRECTED</Text>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <View style={styles.section}>
            {/* 1st half section */}
            <View
              style={{
                width: '95%',
                display: 'flex',
                flexDirection: 'column',
                borderRight: 1,
                borderStyle: 'solid',
                borderColor: 'hsla(var(--black-opacity))',
                height: '120vh',
              }}
            >
              {/* 1.1 */}
              <View
                style={{
                  ...styles.pL_16,
                  ...styles.border_bottom,
                  height: '240px',
                }}
              >
                <Text style={styles.text}>
                  PAYER’S name, street address, city or town,state or province,
                  country, ZIP or foreign postal code, and telphone
                  numberzxcbajcbjascbSJCVFSUgjhasbsuyqgwxadgqwehwidnxnqhesklmiohqwoewfnweohweuihfowDLJ
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
                  <Text
                    style={{ ...styles.text, fontWeight: 500, marginTop: 5 }}
                  >
                    PAYER’S TIN
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
                  <Text
                    style={{ ...styles.text, fontWeight: 500, marginTop: 5 }}
                  >
                    RECIPIENT’S TIN
                  </Text>
                </View>
              </View>

              <View>
                <View
                  style={{
                    ...styles.pL_16,
                    paddingTop: 25,
                    paddingBottom: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '20.6%',
                    ...styles.border_bottom,
                  }}
                >
                  <Text style={{ ...styles.text, fontWeight: 500 }}>
                    RECIPIENT’S NAME
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.pL_16,
                    paddingTop: 25,
                    paddingBottom: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '23.2%',
                    ...styles.border_bottom,
                  }}
                >
                  <Text style={{ ...styles.text, fontWeight: 500 }}>
                    Street address(including apt. no.)
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.pL_16,
                    paddingTop: 25,
                    paddingBottom: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '23.6%',
                    ...styles.border_bottom,
                  }}
                >
                  <Text style={{ ...styles.text, fontWeight: 500 }}>
                    City or town,state or province,country and ZIP or foreign
                    postal code
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.pL_16,
                    // paddingTop: 25,
                    paddingBottom: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '22.7%',
                    ...styles.border_bottom,
                    alignItems: 'flex-end',
                  }}
                >
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    {/* Separate border element */}
                    <View
                      style={{
                        position: 'absolute', // Make the border float separately
                        height: '88px', // Adjust this height to make the border taller without changing the View height
                        ...styles.border_Left,
                        left: 0, // Keep it aligned to the left
                        top: 0, // Align it to the top of the text
                      }}
                    />

                    {/* Text element */}
                    <Text
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        width: '100px',
                        paddingLeft: '10px',
                      }}
                    >
                      16. FATCA filing requirement
                    </Text>

                    {/* Checkbox at the bottom */}
                    <View
                      style={{
                        paddingLeft: '30px',
                      }}
                    >
                      <input
                        type='checkbox'
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: 'red',
                        }}
                      />
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    ...styles.pL_16,
                    paddingTop: 20,
                    paddingBottom: 15,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '29%',
                    // borderRight: 1,
                    // borderStyle: 'solid',
                    // borderColor: 'hsla(var(--black-opacity))',
                    position: 'relative',
                  }}
                >
                  {/* Separate border element */}
                  <View
                    style={{
                      position: 'absolute',

                      left: 0,
                      top: 0,
                    }}
                  />

                  {/* Main Text */}
                  <Text style={{ ...styles.text, fontWeight: 500 }}>
                    Account number (see instructions)
                  </Text>

                  {/* Stacking text and checkbox */}
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column', // Stack text and checkbox
                      alignItems: 'flex-end', // Align to the right
                      justifyContent: 'flex-end',
                      marginRight: '8px',
                      position: 'relative', // Required to position the border absolutely
                    }}
                  >
                    {/* Separate border element */}
                    <View
                      style={{
                        position: 'absolute', // Positioning the border independently
                        height: '96px', // Increase this height as needed
                        ...styles.border_Left,
                        left: 382, // Align it to the left
                        top: -40,
                        bottom: 50,
                        // Align it to the top of the View
                      }}
                    />

                    {/* Text at the top */}
                    <Text
                      style={{
                        fontWeight: 600,
                        fontSize: '15px',
                      }}
                    >
                      2nd TIN not.
                    </Text>

                    {/* Checkbox at the bottom */}
                    <View style={{ paddingRight: '39px' }}>
                      <input
                        type='checkbox'
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: 'red',
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {/* 2nd half section */}
            <View
              style={{ width: '90%', display: 'flex', flexDirection: 'column' }}
            >
              <View style={{ display: 'flex', flexDirection: 'row' }}>
                <View
                  style={{
                    ...styles.border_Right,
                    height: '123vh',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '46.3%',
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 6,
                      ...styles.border_bottom,
                      height: '80px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    1. Rents
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 5,
                      ...styles.border_bottom,
                      height: '80px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    2. Royalties
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 5,
                      ...styles.border_bottom,
                      height: '80px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    3.Other income
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 5,
                      ...styles.border_bottom,
                      height: '93px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    5. Fishing boat proceeds
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 2,
                      ...styles.border_bottom,
                      height: '86px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: '11px',
                    }}
                  >
                    7.Payer made direct sales totaling,$5000 or more of consumer
                    products to recipent for resale
                    <Text
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 12,
                      ...styles.border_bottom,
                      height: '91px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    9. Crop insurance proceeds
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 12,
                      ...styles.border_bottom,
                      height: '92px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    11. Fish purchased for resale
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 10,
                      ...styles.border_bottom,
                      height: '88px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    14. Excess golden parachute payments, if included in box 2
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      height: '100px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                      ...styles.border_Left,
                    }}
                  >
                    16. State tax withheld
                    <Text
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        borderBottom: '1px dotted black',
                      }}
                    >
                      $
                    </Text>
                    <Text
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                </View>
                <View
                  style={{
                    ...styles.border_Right,
                    height: '123vh',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '56%',
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 12,
                      ...styles.border_bottom,
                      height: '92px',
                      width: '17vw',
                    }}
                  >
                    OMB No. 1545-0115
                    <Text>From 1099-MISC</Text>
                    <Text>(Rev. January 2024)</Text>
                  </Text>
                  <View
                    style={{
                      ...styles.pL_16,
                      ...styles.border_bottom,
                      paddingTop: 10,
                      height: '68px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Text
                      style={{
                        ...styles.text,
                        borderBottom: '2px solid black',
                        paddingBottom: '4px',
                        width: '140px',
                      }}
                    >
                      For Calendar year
                    </Text>
                    {/* Empty space */}
                    <span></span>
                    {/* "$" symbol */}
                  </View>

                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 10,
                      ...styles.border_bottom,
                      height: '80px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    4.Federal income tax withheld
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 12,
                      ...styles.border_bottom,
                      height: '93px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    6.Medical and health care payment
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 10,
                      ...styles.border_bottom,
                      height: '86px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    8. Substitute payments in lieu of dividends or interest
                    <Text
                      style={{
                        paddingTop: '2px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 8,
                      ...styles.border_bottom,
                      height: '91px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    10. Gross proceed paid to an attorney
                    <Text
                      style={{
                        paddingTop: '2px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 8,
                      ...styles.border_bottom,
                      height: '92px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    12. Section 409A deferrals
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,
                      paddingTop: 7,
                      ...styles.border_bottom,
                      height: '88px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    15. Nonqualified deferred compensation
                    <Text
                      style={{
                        paddingTop: '6px',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      $
                    </Text>
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      ...styles.pL_16,

                      height: '100px',
                      width: '17vw',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    17. State/payer’s state no
                    <Text
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        borderBottom: '1px dotted black',
                      }}
                    >
                      $
                    </Text>
                  </Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '160px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...styles.border_bottom,
                  }}
                >
                  <Text
                    style={{
                      ...styles.font_20,
                      textAlign: 'center',
                      width: '220px',
                      marginTop: '380px',
                    }}
                  >
                    Miscellaneous Information
                  </Text>

                  <Text
                    style={{
                      marginTop: '100px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '20px',
                    }}
                  >
                    Copy A
                  </Text>
                  <br />
                  <Text style={{ textAlign: 'center', fontWeight: 700 }}>
                    For Internal Revenue service center
                  </Text>
                  <br />
                  <Text style={{ textAlign: 'center', lineHeight: '23px' }}>
                    File with form 1096 for privacy Act and paperwork rduction
                    act notice,see the current general instructions for certain
                    informations for certain information returns
                  </Text>
                  <View
                    style={{
                      position: 'relative',
                      top: '257px',
                      borderTop: '1px solid gray',
                      width: '100%',
                    }}
                  >
                    <Text
                      style={{
                        ...styles.text,
                        ...styles.pL_16,

                        height: '100px',
                        width: '17vw',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      18. State income
                      <Text
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          borderBottom: '1px dotted black',
                        }}
                      >
                        $
                      </Text>
                      <Text
                        style={{
                          paddingTop: '6px',
                          fontSize: '18px',
                          fontWeight: 700,
                        }}
                      >
                        $
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '10px',
          }}
        >
          <View>
            <Text>
              Form{' '}
              <span style={{ fontSize: '25px', fontWeight: 'bold' }}>
                1099-MISC
              </span>
            </Text>
            <Text>(Rev. 1-2024)</Text>
            <Text>Cat.No. 14425J</Text>
          </View>
          <View>
            <Text>www.irs.gov/Form 1099MISC</Text>
          </View>
          <View>
            <Text>Department of treasury - internal Revenue Service</Text>
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            paddingTop: '20px',
          }}
        >
          <Text>
            {' '}
            Do not cut or seperate forms on this page - Do not cut or seperate
            forms on this page
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default miscellaneous;
