import { StyleSheet } from '@react-pdf/renderer';
export const styles = StyleSheet.create({
  section: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '10px',
    marginTop: '10px',
  },
  tablehead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',

    padding: '5px 60px 0px 20px',
    fontSize: '9px',
    width: '100%',
    marginTop: '20px',
  },
  tableCell: {
    fontWeight: 'bold',
    fontSize: '10px',
    color: 'black',
    flex: 1,
    borderBottom: '1px solid rgba(0, 0, 0, 0.31)',
    paddingVertical: '10px',
    paddingHorizontal: '5px',
    marginBottom: 5,
  },
  tablebody: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 13,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(3, 4, 94, 0.05)',
    padding: '6px 0px 10px 5px',
    margin: '0px 10px 10px 10px',
    fontWeight: 400,
    fontSize: '10px',
  },
  text: {
    fontSize: '10px',
    color: '#000',
    paddingVertical: 2,
    flex: 1,
  },
});
