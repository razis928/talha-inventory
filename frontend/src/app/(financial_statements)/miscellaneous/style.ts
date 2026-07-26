import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 40,
    paddingBottom: 40,
    width: '1300px',
    margin: 'auto',
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    display: 'flex', // Use flex instead of block
    flexDirection: 'column', // Mimic block behavior with flex-direction
    // height: '100%',
  },
  section: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'var(--gray-500)', // Replaced with actual color code
    width: '1200px',
    display: 'flex',
    height: '135nvh',
    overflowWrap: 'anywhere',
  },
  border_Style: {
    borderStyle: 'solid',
    borderColor: '#000000', // Replaced with actual color code
  },
  text: {
    fontFamily: 'var(--font-poppins)', // Replaced with font family name
    fontSize: 14,
    color: '#000000',
    fontWeight: 500,
  },
  text_highlight: {
    fontFamily: 'var(--font-poppins)', // Replaced with font family name
    fontSize: 24,
    color: '#000000',
    fontWeight: 600,
    paddingBottom: 15,
    paddingTop: 3,
  },
  pL_16: {
    paddingLeft: 16,
  },
  border_bottom: {
    borderStyle: 'solid',
    borderBottomColor: 'var(--gray-500)', // Replaced with actual color code
    borderBottomWidth: 1,
  },
  border_Right: {
    borderStyle: 'solid',
    borderRightColor: 'var(--gray-500)', // Replaced with actual color code
    borderRightWidth: 1,
  },
  border_Left: {
    borderStyle: 'solid',
    borderLeftColor: 'var(--gray-500)', // Replaced with actual color code
    borderLeftWidth: 1,
  },
  font_20: {
    fontFamily: 'var(--font-poppins)', // Replaced with font family name
    fontSize: 20,
    color: '#000000',
    fontWeight: 500,
  },
  font_18: {
    fontFamily: 'var(--font-poppins)',
    fontSize: 18,
    color: '#000000',
    fontWeight: 600,
  },
  font_15: {
    fontFamily: 'var(--font-poppins)',
    fontSize: 15,
    color: '#000000',
    fontWeight: 400,
  },
  font_48: {
    fontFamily: 'var(--font-poppins)',
    fontSize: 48,
    color: '#000000',
    fontWeight: 600,
  },
  // Added red-bordered checkbox style
  checkbox: {
    width: 22,
    height: 22,
    border: '1px solid red', // Red border
    marginRight: 8,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: '10px',
  },
});

export default styles;
