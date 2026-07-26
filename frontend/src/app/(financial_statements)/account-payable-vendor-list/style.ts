import { Font, StyleSheet } from '@react-pdf/renderer';
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

const styles = StyleSheet.create({
  page: {
    margin: 'auto',
    backgroundColor: '#FFFFFF',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '21px',
    fontWeight: 'bold',
    padding: '14px 5px 14px 5px',
    textAlign: 'center',
  },
  vendorSection: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '2px solid #000000',
    backgroundColor: '#F2F2F7',
    paddingRight: '70px',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '35px',
    paddingTop: '35px',
  },
  column: {
    display: 'flex',
    flexDirection: 'row',
    padding: '6px 0px 6px 1px',
    fontSize: '15px',
    paddingLeft: '20px',
  },
  label: {
    fontSize: '15px',
    fontWeight: 'bold',
    width: '100px',
  },
  value: {
    fontWeight: 500,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '1px solid rgba(0,0,0,0.17)',
    padding: '8px 0',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '1px solid rgba(0,0,0,0.17)',
    padding: '8px 0',
  },
  tableCell: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px',
    textAlign: 'center',
  },
  tableCell45: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px',
    textAlign: 'center',
    position: 'relative',
    right: '25px',
  },
  tableCell46: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px',
    textAlign: 'center',
    position: 'relative',
    right: '10px',
  },
  tableCellWide: {
    flex: 2,
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px',
  },
  tableCellID: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px',
    textAlign: 'center',
  },
  tableCellNoborder: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    padding: '5px',
    textAlign: 'center',
  },
});
export default styles;
