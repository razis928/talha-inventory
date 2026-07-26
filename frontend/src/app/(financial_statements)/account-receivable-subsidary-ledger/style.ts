import { Font, StyleSheet } from '@react-pdf/renderer';
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

const styles = StyleSheet.create({
  page: {
    margin: 'auto',
    backgroundColor: '#FFFFFF',
    marginTop: '20px',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '20px',
    padding: '15px 5px 20px 45px',
  },
  vendorSection: {
    display: 'flex',
    flexDirection: 'column', // Change to row to place columns next to each other
    paddingLeft: '2px',
    borderBottom: '1px solid black',
    backgroundColor: '#F2F2F7',
    paddingRight: '70px',
    alignItems: 'flex-start', // Align items to the top
    justifyContent: 'space-between',
    height: 'auto',
    borderTop: '1px solid gray', // Adjust height to auto to accommodate content
  },
  column: {
    display: 'flex',
    flexDirection: 'row', // Stack label and value vertically
    padding: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100px',
  },
  value: {
    paddingLeft: '5px',
    fontWeight: 500,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid black',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid black',
  },
  tableCell: {
    flex: 1, // Default width for most cells
    fontSize: '12px',
    fontWeight: 500,
    padding: '10px',
    borderRight: '1px solid black', // Ensure borders between cells
    textAlign: 'center', // Align text to center for consistent look
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tableCellWide: {
    flex: 2, // Increased width for the Item cell
    fontSize: '14px',
    fontWeight: 500,
    padding: '10px',
    borderRight: '1px solid black',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
export default styles;
