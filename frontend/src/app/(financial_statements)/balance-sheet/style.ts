import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: '50px 70px 70px 70px',
    maxWidth: '950px',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    marginTop: '30px',
    fontFamily: 'Encode Sans', // Apply the font
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#03045E',
    fontFamily: 'Encode Sans', // Apply the font
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '35px',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(3, 4, 94, 0.05)',
    marginTop: '3px',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsRowWithBorder: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(3, 4, 94, 0.05)',
    marginTop: '3px',
    borderBottom: '1px solid #03045E',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsRowEmpty: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3px',
    padding: '2px 10px 2px 10px',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3px',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderBottom: '1px solid #03045E',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsText: {
    fontSize: '17px',
    fontWeight: 400,
    color: '#000000',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: '15px',
    paddingRight: '15px',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsValueContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '30%',
    alignItems: 'center',
    fontFamily: 'Encode Sans', // Apply the font
  },
  assetsValueText: {
    fontSize: '17px',
    color: '#000000',
    paddingRight: '10px',
    fontFamily: 'Encode Sans', // Apply the font
  },
  liabilitiesHeading: {
    paddingTop: '20px',
    fontSize: '19px',
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Encode Sans', // Apply the font
  },
  equityHeading: {
    paddingTop: '20px',
    paddingBottom: '20px',
    fontSize: '19px',
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Encode Sans', // Apply the font
  },
});

export default styles;
