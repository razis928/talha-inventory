import * as React from "react";
// import { useLocation, useSearchParams } from "react-router-dom";
import { makeStyles, Theme, createStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import Button from "../../Button";
import TextInput from "../../Form/TextInput";
import DatePicker from "../../Form/Date";
import useMediaQuery from "@mui/material/useMediaQuery";
import Select from "Components/Form/Select";
import Radio from "@material-ui/core/Radio";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      justifyContent: "space-between",
      display: "flex"
    },
    heading: {
      fontSize: "21px"
    },
    DateTextField: {
      paddingLeft: "3px"
    },
    searchCustomerBody: {
      widht: "100%",
      background: theme.palette.gray[100],
      borderRadius: "6px",
      marginTop: "20px",
      padding: "25px"
    },
    searchHeading: {
      fontSize: "14px"
    },
    formBody: {
      marginTop: "20px"
    },
    flexAlign: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    smallText: {
      fontSize: "12px"
    },
    label: {
      color: theme.palette.gray[500],
      fontSize: "12px"
    },
    w100: {
      width: "100%"
    },
    labelDiv: {
      minWidth: "130px"
    },
    selectDiv: {
      width: "100%"
    },
    flexContainer: {
      display: "flex",
      alignItems: "center"
    },
    checkboxContainerSmall: {
      display: "flex",
      flexDirection: "column"
    },
    checkedType: {
      borderRadius: "6px",
      border: `2px solid ${theme.palette.primary.main}`,
      marginRight: "5px",
      padding: "0px 13px",
      marginBottom: 4
    },
    unCheckedType: {
      borderRadius: "6px",
      border: `2px solid ${theme.palette.gray[300]}`,
      marginRight: "5px",
      padding: "0px 13px",
      color: theme.palette.gray[400],
      marginBottom: 4
    },
    pointer: {
      cursor: "pointer"
    },
    radioButton: {
      padding: "7px"
    }
  })
);
interface Props {
  readonly header?: boolean;
}

interface Option {
  value: string;
  label: string;
}
const purchaseOrderLocation: Array<Option> = [
  { label: "All Locations", value: "" },
  { label: "Default", value: "default" }
];
const invoicingCurrency: Array<Option> = [
  { label: "AUD", value: "aud" },
  { label: "CAD", value: "cad" },
  { label: "CNY", value: "cny" },
  { label: "EUR", value: "eur" },
  { label: "GBP", value: "gbp" },
  { label: "MXN", value: "mxn" },
  { label: "USD", value: "usd" }
];
const supplier: Array<Option> = [{ label: "Default", value: "default" }];
const unitCostAmounts: Array<Option> = [
  { label: "Tax Exclusive", value: "tax-exclusive" },
  { label: "Tax Inclusive", value: "tax-inclusive" },
  { label: "No Tax", value: "no-tax" }
];

const PurchaseOrderEditForm: React.FC<Props> = () => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const [showFilters, setShowFilters] = React.useState<boolean>(true);

  return (
    <div>
      <div className={classes.searchCustomerBody}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid xs={6} item>
            <h5 className={classes.searchHeading}>Purchase Order Edit - PO3003233411</h5>
          </Grid>
          <Grid xs={6} container item justifyContent="flex-end">
            <div className={classes.flexContainer}>
              <Button
                disabled={!showFilters}
                text="Reset"
                type="secondary"
                style={{ margin: "2px" }}
                onClick={() => {}}
              />
              <Button
                onClick={() => setShowFilters(!showFilters)}
                text={showFilters ? "Hide" : "Show"}
                style={{ margin: "2px" }}
                type="secondary"
              />
            </div>
          </Grid>
        </Grid>

        {showFilters && (
          <Grid container spacing={1} className={classes.formBody} alignItems="center">
            <Grid lg={3} sm={4} md={4} xs={12} item mb={1}>
              <Typography component="p" display="block" className={`${classes.label}`}>
                Status
              </Typography>
            </Grid>
            <Grid lg={4.5} xs={6} sm={4} md={4}>
              <div
                className={`${classes.pointer} ${classes.checkedType}`}
                aria-label="pending"
                onClick={() => {}}
              >
                <Radio
                  size="small"
                  onClick={() => {}}
                  className={classes.radioButton}
                  value={true}
                  checked
                  name="pending"
                  inputProps={{ "aria-label": "purchase order type pending" }}
                />
                Pending
              </div>
            </Grid>
            <Grid lg={4.5} xs={6} sm={4} md={4}>
              <div
                className={`${classes.pointer} ${classes.unCheckedType}`}
                aria-label="open"
                onClick={() => {}}
              >
                <Radio
                  size="small"
                  onClick={() => {}}
                  className={classes.radioButton}
                  value={true}
                  name="open"
                  inputProps={{ "aria-label": "purchase order type open" }}
                />
                To Open
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "reference" }}
                name="reference"
                margin="dense"
                variant="outlined"
                type="text"
                label="Reference"
                value="PO3003233411"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <DatePicker
                inputAriaLabel="date"
                onChange={() => {}}
                value={null}
                label="Date"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <DatePicker
                inputAriaLabel="expected"
                onChange={() => {}}
                value={null}
                label="Expected"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "supplier ref" }}
                name="supplier reference"
                margin="dense"
                variant="outlined"
                type="text"
                label="Supplier Ref"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>Location:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select
                    ariaLabel="purchase order location"
                    options={purchaseOrderLocation}
                    name="polocation"
                  />{" "}
                </div>
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>Supplier:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select ariaLabel="supplier" options={supplier} name="supplier" />{" "}
                </div>
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>Invoicing Currency:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select
                    ariaLabel="invoicing currency"
                    options={invoicingCurrency}
                    name="invoicingcurrency"
                  />{" "}
                </div>
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>Unit Cost Amounts:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select
                    ariaLabel="unit cost amounts"
                    options={unitCostAmounts}
                    name="unitcostamounts:"
                  />{" "}
                </div>
              </div>
            </Grid>
          </Grid>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderEditForm;
