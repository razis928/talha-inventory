import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '40px',
    maxWidth: '1400px',
    margin: 'auto',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#03045E',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    // lineHeight: '35px',
  },
  assetsRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#03045E0D',
    marginTop: '3px',
  },
  assetsRow1: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '3px',
  },
  assetsRowWithBorder: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#03045E0D',
    // borderBottom: '1px solid #03045E',
    flexDirection: 'row',
    marginTop: '3px',
  },
  assetsRowWithBorder2: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#03045E0D',
    flexDirection: 'row',
    marginTop: '3px',
  },
  assetsRowWithBorder3: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#03045E0D',
    flexDirection: 'row',
    marginTop: '3px',
    borderBottom: '1px solid black',
  },
  assetsRowWithBorder9: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: '#03045E0D',
    flexDirection: 'row',
  },
  assetsRowEmpty: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3px',
    padding: '2px 10px 2px 10px',
  },
  assetsTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3px',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderBottom: '1px solid #03045E',
    flexDirection: 'row',
  },
  assetsTotal3: {
    display: 'flex',

    paddingTop: '7px',
    flexDirection: 'row',
  },
  assetsTotal1: {
    marginTop: '2px',
    borderBottom: '1px solid #03045E',
  },
  assetsText: {
    fontSize: '13px',
    fontWeight: 400,
    color: '#000000',
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '15px',
    width: '100%',
  },
  assetsText23: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#000000',
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '15px',
    width: '100%',
    position: 'relative',
    left: 40,
  },

  assetsValueContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: '202px',
  },
  assetsValueContainer1: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  assetsValueText: {
    fontSize: '17px',
    color: '#000000',
    paddingRight: '20px',
  },
  assetsValueText6: {
    fontSize: '17px',
    color: '#000000',
    width: '100%',
    position: 'relative',
    right: '80px',
  },
  assetsValueText4: {
    fontSize: '17px',
    color: '#000000',
    paddingRight: '50px',
  },
  assetsValueText1: {
    fontSize: '17px',
    color: '#000000',
  },
  liabilitiesHeading: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#000000',
    paddingTop: '20px',
    position: 'relative',
    top: '1px',
  },
  equityHeading: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#000000',
    position: 'relative',
    top: '2px',
  },
});

export default styles;
