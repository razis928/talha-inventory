import { Document, Page, Text, View } from '@react-pdf/renderer';
import React from 'react';

import styles from '@/app/(financial_statements)/cargo-policy/_components/styles';

const policy = () => {
  return (
    <>
      <Document>
        <Page size='A4' style={styles.page}>
          <View style={styles.section}>
            {/* 1st section */}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  width: '15%',
                  display: 'flex',
                  // justifyContent: 'center',
                  // alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <Text
                  style={{ width: 113, height: 101, backgroundColor: '#f00' }}
                >
                  ...
                </Text>
                <Text
                  style={{
                    ...styles.font_16,
                    ...styles.font_bold,
                    marginTop: 30,
                    marginLeft: 20,
                  }}
                >
                  50006167
                </Text>
              </View>
              <View
                style={{
                  width: '70%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Text
                  style={{
                    ...styles.font_24,
                    fontWeight: 'semibold',
                    textTransform: 'uppercase',
                  }}
                >
                  WethePeople insurance corporation
                </Text>
                <Text
                  style={{
                    ...styles.font_12,
                    width: '85%',
                  }}
                >
                  Head office 21 & 22/F, MIPEC Tower, No 229 Tay Son str, Dog Da
                  dist, Ha noi, Veit Nam <br />
                  Tel: (84.4) 37760867, 37760865, Fax(84.4) 37760865, 37763283
                </Text>
                <Text style={styles.font_12}>
                  Website : http://www.pjico.com.vn Email:
                  Pjico@petrolienmex.com.vn
                </Text>
              </View>
            </View>
            {/* heading */}
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Text style={{ ...styles.font_24, fontWeight: 'semibold' }}>
                CARGO INSURANCE POLICY
              </Text>
            </View>
            {/* headingEnd */}
            {/* policyNo. */}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '90%',

                justifyContent: 'space-between',
                marginTop: 36,
                marginBottom: 50,
                // backgroundColor: '#f0f',
              }}
            >
              <View
                style={{
                  // backgroundColor: '#0f0',
                  width: '50%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <Text style={{ ...styles.font_16 }}>
                  POLICY NUMBER: TRUONGTHANHDAT-1911147637
                </Text>
              </View>
              <View>
                <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                  ORIGINAL
                </Text>
              </View>
            </View>
            {/* policyNo. End */}
            {/* Info */}
            <View>
              {/* Name View */}
              <View style={styles.Column}>
                {/* 1st section */}
                <View style={styles.row}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    NAME OF ASSURED:
                  </Text>
                  <Text style={styles.font_16}>
                    VIET DELTA INDUSTRIAL CO.LTD
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    BENEFICIAL:{' '}
                  </Text>
                  <Text style={styles.font_16}>COMMERCIAL PROIAR.S.A</Text>
                </View>
              </View>
              {/* Name View End */}
              {/*  Vessels */}
              <View style={styles.Column}>
                {/* 1st section */}
                <View style={styles.row}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    VESSELS:
                  </Text>
                  <Text style={styles.font_16}>DISEPINA P/HL550R</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.row}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      SAILING ON OR ABOUT:
                    </Text>
                    <Text style={styles.font_16}>13 dec 2020</Text>
                  </View>
                  <View style={{ ...styles.row, marginLeft: 40 }}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      VOYAGE No:
                    </Text>
                    <Text style={styles.font_16}> HL550R</Text>
                  </View>
                </View>
              </View>
              {/* Vessels End */}

              {/* Voyage */}
              <View style={styles.Column}>
                {/* 1st section */}

                <View style={styles.row}>
                  <View style={styles.row}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      VOYAGE:
                    </Text>
                    <Text style={styles.font_16}>
                      At and from CATLAI, HOCHIMINH,VIETNAM CY
                    </Text>
                  </View>
                  <View style={{ ...styles.row, marginLeft: 40 }}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      Transhipment:
                    </Text>
                    <Text style={styles.font_16}>. Allowed</Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    To:
                  </Text>
                  <Text style={styles.font_16}>VALENCIA, SPAIN CY</Text>
                </View>
              </View>
              {/* Voyage End */}

              {/* Amount */}

              <View style={{ ...styles.row, marginBottom: 30 }}>
                <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                  AMOUNT INSURED HEREUNDER:
                </Text>
                <Text style={styles.font_16}>8,251 10 US Dollar</Text>
              </View>
              {/* Amount End */}
              {/* SubjectMatter */}
              <View style={styles.Column}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* 1st section */}
                  <View style={styles.row}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      SUBJECT MATTER INSURED:
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.row}>
                      <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                        Container No:
                      </Text>
                      <Text style={styles.font_16}>
                        MEDU8556435267/Seal FEJ83518980()FCL/FCL
                      </Text>
                    </View>
                    <View style={{ ...styles.row, marginLeft: 40 }}>
                      <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                        Invoice No:
                      </Text>
                      <Text style={styles.font_16}> VD00208</Text>
                    </View>
                  </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* 1st section */}
                  <View style={styles.row}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      Date:
                    </Text>
                    <Text style={styles.font_16}>10 dec 2020</Text>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.row}>
                      <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                        B/L No:
                      </Text>
                      <Text style={styles.font_16}> HCM-S1530767 .</Text>
                    </View>
                    <View
                      style={{
                        ...styles.row,
                        marginLeft: 100,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '45%',
                      }}
                    >
                      <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                        Gross weight (Kg):
                      </Text>
                      <Text style={styles.font_16}>23,280,00 KGS</Text>
                    </View>
                  </View>
                </View>
              </View>
              {/* SubjectMatter End */}

              {/* Clauses */}
              <View style={styles.Column}>
                <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                  CLAUSES, ENDORSEMENT, SPECIAL,CONDITIONS AND WARRANTIES:
                </Text>
                <Text style={styles.font_16}>
                  Institute Cargo Clause (A) 1/1/82,{' '}
                </Text>
                <Text style={styles.font_16}>
                  Institute strikes Clauses (Cargo) 1/1/82, Cargo ISM
                  Endorsement,
                </Text>
                <Text style={styles.font_16}>
                  Institute Standard ( Cover all risks - ICCI982)
                </Text>
              </View>
              {/* Clauses End */}
              {/* Claims */}
              <View style={styles.Column}>
                <View style={styles.row}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    Claims, if any payable at/in:
                  </Text>
                  <Text style={styles.font_16}>PETROLIMEX INSURANCE CORP</Text>
                </View>
                <View>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    In the even of loss or damage which may not involve claim
                    under this insurance, no cliam will be admitted unless
                    immediately notice survey has been given to and a survey
                    report obtained from or with approval of
                  </Text>
                </View>
              </View>
              {/* Claims End */}
              {/* Agent */}
              <View style={styles.Column}>
                <Text style={styles.font_16}>
                  agent of PETROLIMEX INSURANCE CORP in spain
                </Text>
              </View>
              {/* AgentEnd */}
              {/* Rate */}
              <View style={styles.Column}>
                <View style={styles.row}>
                  <View style={styles.row}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      Rate:
                    </Text>
                  </View>
                  <View style={{ ...styles.row, marginLeft: 100 }}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      Premium:
                    </Text>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      23.86USD
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.row}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      VAT:
                    </Text>
                  </View>
                  <View style={{ ...styles.row, marginLeft: 100 }}>
                    <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                      Total amount of payment:
                    </Text>
                  </View>
                </View>
              </View>
              {/* Rate End */}
              {/* Issued */}
              <View style={styles.row}>
                <View style={styles.row}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    Issued In:
                  </Text>
                  <Text style={styles.font_16}>
                    Valencia, Spain - Issued in 3 folds (1 copy & 2 originals)
                  </Text>
                </View>
                <View style={{ ...styles.row, marginLeft: 40 }}>
                  <Text style={{ ...styles.font_16, ...styles.font_bold }}>
                    on:
                  </Text>
                  <Text style={styles.font_16}> 13 dec 2020</Text>
                </View>
              </View>
              {/* Issued End */}
            </View>
            {/* Info End */}
          </View>
        </Page>
      </Document>
    </>
  );
};

export default policy;
