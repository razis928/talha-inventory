import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    width: '60%',
    paddingTop: 64,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    flex: 'column',
    display: 'flex',
    flexDirection: 'column',
    marginTop: 20,
    paddingLeft: 70,
    paddingRight: 70,
  },
  font_24: {
    color: '#000000',
    fontWeight: 'medium',
    fontSize: 24,
    fontFamily: 'var(--font-poppins)',
  },
  font_12: {
    fontFamily: 'var(--font-poppins)',
    fontWeight: 'extralight',
    fontSize: 12,
    color: '#000000',
  },
  font_16: {
    color: '#000000',
    fontWeight: 'medium',
    fontSize: 16,
    fontFamily: 'var(--font-poppins)',
  },
  font_bold: {
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 3,
  },
  Column: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 30,
  },
});
export default styles;
