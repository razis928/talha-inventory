import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    margin: 0,
    padding: 0,
  },
  header: {
    lineHeight: '40px',
    backgroundColor: 'white',
    maxWidth: '900px',
    margin: 'auto',
    height: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  tableRow: {
    display: 'flex',
    lineHeight: '40px',
  },
  cell: {
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    flex: 2.5,
    fontFamily: 'var(--font-DM_Serif_Display)',
    fontWeight: 400,
    borderLeft: '1px solid rgba(0,0,0,0.1)',
    paddingLeft: '10px',
  },
  cellBorder: {
    flex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    borderLeft: '1px solid rgba(0,0,0,0.1)',
    borderRight: '1px solid rgba(0,0,0,0.1)',
    textAlign: 'center',
    position: 'relative',
    right: '2px',
  },

  title: {
    fontFamily: 'var(--font-DM_Serif_Display)',
    fontWeight: 500,
    borderLeft: '1px solid rgba(0,0,0,0.1)',
    borderRight: '1px solid rgba(0,0,0,0.1)',
    paddingLeft: '10px',
  },
});

export default styles;
