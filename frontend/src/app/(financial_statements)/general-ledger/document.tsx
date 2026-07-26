import {
  Document,
  Image as PDFIMAGE,
  Page,
  Text,
  View,
} from '@react-pdf/renderer';
import { FC } from 'react';

import { GeneralLedgerReportTemplate } from '@/app/(financial_statements)/general-ledger/page';
import { styles } from '@/app/(financial_statements)/general-ledger/styles';

interface Props {
  reportData: GeneralLedgerReportTemplate[];
}

const GeneralLedgerReport: FC<Props> = ({ reportData }: Props) => {
  return (
    <Document style={{ backgroundColor: 'rgba(3,4,94,0.05)' }}>
      <Page
        size={{ width: 1041.89, height: 595.28 }} // A4 Landscape in points
        style={{
          backgroundColor: 'rgba(3,4,94,0.05)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <View>
          <Text style={{ color: '#03045E', fontSize: '21px', fontWeight: 700 }}>
            <>GENERAL LEDGER REPORT</>
          </Text>

          <View style={styles.section}>
            <View style={styles.tablehead}>
              <Text
                style={{
                  ...styles.tableCell,
                  position: 'relative',
                  right: '7px',
                }}
              >
                Posted dt.
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  position: 'relative',
                  right: '2px',
                }}
              >
                Doc dt.
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  position: 'relative',
                  left: '5px',
                }}
              >
                Doc
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  position: 'relative',
                  left: '13px',
                }}
              >
                Memo/Description
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  paddingLeft: '30px',
                  position: 'relative',
                  left: '23px',
                  width: 60,
                }}
              >
                Accounts
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  paddingLeft: '50px',
                  position: 'relative',
                  left: '36px',
                  width: 30,
                }}
              >
                Debit
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  paddingLeft: '30px',
                  position: 'relative',
                  left: '45px',
                  width: 30,
                }}
              >
                Credit
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  paddingLeft: '30px',
                  position: 'relative',
                  left: '50px',
                  width: 40,
                }}
              >
                Balance
              </Text>
            </View>

            <View style={styles.tablebody}>
              {reportData.map((row, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.text}>{row.postedDate}</Text>
                  <Text style={{ ...styles.text, paddingLeft: '10px' }}>
                    {row.docDate}
                  </Text>
                  <Text style={styles.text}>{row.doc}</Text>
                  <Text style={styles.text}>{row.memo}</Text>
                  <Text
                    style={{
                      ...styles.text,
                      paddingLeft: '30px',
                      marginRight: '40px',
                    }}
                  >
                    {row.jnl}
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      paddingLeft: '20px',
                      marginRight: '20px',
                      position: 'relative',

                      width: '20px',
                    }}
                  >
                    {row.debit}
                  </Text>
                  <Text
                    style={{
                      ...styles.text,

                      position: 'relative',
                      width: '60px',
                      left: '17px',
                    }}
                  >
                    {row.credit}
                  </Text>
                  <Text
                    style={{
                      ...styles.text,
                      position: 'relative',
                      left: '30px',
                      paddingBottom: '2px',
                      marginRight: '30px',
                    }}
                  >
                    {row.balance}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                width: '955px',
                margin: 'auto',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: 'rgba(3,4,94,0.05)',
                marginLeft: '20px',
                textAlign: 'center',
                paddingRight: '20px',
              }}
            >
              <Text
                style={{
                  marginLeft: '70vw',
                }}
              >
                <PDFIMAGE
                  style={{
                    width: '100px',
                    height: '30px',
                    margin: 'auto',
                  }}
                  src='/assets/accounting-pdf/logo.png'
                />
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default GeneralLedgerReport;
