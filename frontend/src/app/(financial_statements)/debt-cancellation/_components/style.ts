import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 660,
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 77,
    paddingBottom: 77,
  },
  section: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'hsla(var(--black-opacity))',
    width: '75%',
    display: 'flex',
  },
  border_Style: {
    borderStyle: 'solid',
    borderColor: 'hsla(var(--black-opacity))',
  },
  text: {
    fontFamily: 'var(--font-poppins)',
    fontSize: 14,
    color: '#000000',
    fontWeight: 400,
  },
  text_highlight: {
    fontFamily: 'var(--font-poppins)',
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
    borderBottomColor: 'hsla(var(--black-opacity))',
    borderBottomWidth: 1,
  },
  border_Right: {
    borderStyle: 'solid',
    borderRightColor: 'hsla(var(--black-opacity))',
    borderRightWidth: 1,
  },
  border_Left: {
    borderStyle: 'solid',
    borderLeftColor: 'hsla(var(--black-opacity))',
    borderLeftWidth: 1,
  },
  font_20: {
    fontFamily: 'var(--font-poppins)',
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
});
export default styles;
