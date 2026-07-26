import * as React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { makeStyles, Theme, createStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import Button from "../Button";
import TextInput from "../Form/TextInput";
import DatePicker from "../Form/Date";
import CheckBox from "../CheckBox";
import useMediaQuery from "@mui/material/useMediaQuery";
import Select from "Components/Form/Select";
import { getAllStates } from "Utils/states";
import {
  orderBillingShippingParamKeys,
  orderParamsGeneralKeys,
  orderCompanyParamKeys
} from "Utils/queryParamKeys";

const QUERY_PARAM_KEYS = [
  ...orderBillingShippingParamKeys,
  ...orderParamsGeneralKeys,
  ...orderCompanyParamKeys
];

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

const paymentStatuses: Array<Option> = [
  { label: "All", value: "" },
  { label: "Not Paid", value: "not_paid" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" }
];
const shipmentStatuses: Array<Option> = [
  { label: "All", value: "" },
  { label: "Not Shipped", value: "not_shipped" },
  { label: "Partially Shipped", value: "partially_shipped" },
  { label: "Shipped", value: "shipped" }
];

const OrderFilters: React.FC<Props> = () => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const matches = useMediaQuery(theme.breakpoints.up("sm"));
  const { pathname } = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [showFilters, setShowFilters] = React.useState<boolean>(true);

  const handleChange = ({ key, value }: { key: string; value: string }) => {
    const newParams = new URLSearchParams(searchParams);
    value ? newParams.set(key, value) : newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleReset = () => {
    const newParams = new URLSearchParams(searchParams);
    QUERY_PARAM_KEYS.forEach(key => newParams.delete(key));
    setSearchParams(newParams);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (
      (name === "number" || name === "company__number") &&
      (value ? Number(value) >= 0 : !value)
    ) {
      handleChange({
        key: name,
        value: value.replace(/[^0-9]/g, "")
      });
    } else if (name !== "company__number" && name !== "number") {
      handleChange({
        key: name,
        value
      });
    }
  };
  const handleDateChange = (date: Date | string | null, name: string) => {
    handleChange({
      key: name,
      value: typeof date === "string" ? date : date?.toISOString() || ""
    });
  };
  const searchByBillTo = searchParams.get("search_by_bill_to");
  const searchByShipTo = searchParams.get("search_by_ship_to");

  const disableFields = React.useMemo(
    () => !(!!searchByBillTo || !!searchByShipTo),
    [searchByBillTo, searchByShipTo]
  );

  // Set the default values of search_by_ship_to and search_by_bill_to to true.
  React.useEffect(() => {
    const initialParams = new URLSearchParams(searchParams);
    initialParams.set("search_by_bill_to", "1");
    initialParams.set("search_by_ship_to", "1");
    // If it's the trash page, also add is_trash to the query params
    ["/trash", "/trash/"].includes(pathname)
      ? initialParams.set("is_trash", "1")
      : initialParams.delete("is_trash");
    setSearchParams(initialParams);
    //eslint-disable-next-line
  }, [pathname]);

  return (
    <div>
      <div className={classes.searchCustomerBody}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid xs={6} item>
            <h5 className={classes.searchHeading}>Search</h5>
          </Grid>
          <Grid xs={6} container item justifyContent="flex-end">
            <div className={classes.flexContainer}>
              <Button
                disabled={!showFilters}
                text="Reset"
                type="secondary"
                style={{ margin: "2px" }}
                onClick={handleReset}
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
          <Grid
            container
            direction="row"
            spacing={1}
            className={classes.formBody}
            alignItems="center"
          >
            <Grid lg={4} xs={12} item>
              <DatePicker
                inputAriaLabel="orders from"
                onChange={(date: Date | null) => handleDateChange(date, "ordered__from")}
                value={
                  searchParams.get("ordered__from")
                    ? new Date(searchParams.get("ordered__from") as string)
                    : null
                }
                label="Orders From"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <DatePicker
                inputAriaLabel="orders to"
                onChange={(date: Date | null) => handleDateChange(date, "ordered__to")}
                value={
                  searchParams.get("ordered__to")
                    ? new Date(searchParams.get("ordered__from") as string)
                    : null
                }
                label="Orders To"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "customer email" }}
                name="email"
                value={searchParams.get("email") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="email"
                label="Email"
                disabled={disableFields}
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "customer number" }}
                name="company__number"
                value={searchParams.get("company__number") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Customer Number "
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "company name" }}
                name="company__name"
                value={searchParams.get("company__name") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Company Name"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "product number" }}
                name="sku"
                value={searchParams.get("sku") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Product Number"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "order number" }}
                name="number"
                value={searchParams.get("number") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Order Number"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>Payment Status:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select
                    ariaLabel="payment status"
                    options={paymentStatuses}
                    name="payment_status"
                    value={paymentStatuses.find(
                      item => item.value === (searchParams.get("payment_status") || "")
                    )}
                    onChange={(value: { lable: string; value: string }) =>
                      handleChange({
                        key: "payment_status",
                        value: value.value
                      })
                    }
                  />{" "}
                </div>
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>Shipment Status:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select
                    ariaLabel="shipment status"
                    options={shipmentStatuses}
                    name="shipmentStatus"
                    value={shipmentStatuses.find(
                      item => item.value === (searchParams.get("shipment_status") || "")
                    )}
                    onChange={(value: { lable: string; value: string }) =>
                      handleChange({
                        key: "shipment_status",
                        value: value.value
                      })
                    }
                  />{" "}
                </div>
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "address1" }}
                name="street1"
                value={searchParams.get("street1") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Address1"
                disabled={disableFields}
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "city" }}
                name="city"
                value={searchParams.get("city") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="City"
                disabled={disableFields}
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={matches ? classes.flexAlign : ""}>
                <div className={classes.labelDiv}>
                  <p className={classes.label}>State:</p>
                </div>
                <div className={classes.selectDiv}>
                  <Select
                    ariaLabel="state"
                    disabled={disableFields}
                    name="state"
                    value={getAllStates().find(
                      item =>
                        item.value.toLowerCase() ===
                        (searchParams.get("state") || "")?.toLowerCase()
                    )}
                    options={getAllStates()}
                    onChange={(value: { lable: string; value: string }) =>
                      handleChange({
                        key: "state",
                        value: value.value
                      })
                    }
                  />{" "}
                </div>
              </div>
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                inputProps={{ "aria-label": "zipcode" }}
                name="zip"
                disabled={disableFields}
                value={searchParams.get("zip") || ""}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Zipcode"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <div
                className={
                  matches ? classes.flexContainer : classes.checkboxContainerSmall
                }
              >
                <div className={classes.flexContainer}>
                  <CheckBox
                    name="search_by_bill_to"
                    checked={!!searchParams.get("search_by_bill_to")}
                    handleChange={event => {
                      handleChange({
                        key: event.target.name,
                        value: event.target.checked ? "1" : ""
                      });
                    }}
                  />
                  <p className={classes.smallText}>Search by Bill To</p>
                </div>
                <div className={classes.flexContainer}>
                  <CheckBox
                    name="search_by_ship_to"
                    checked={!!searchParams.get("search_by_ship_to")}
                    handleChange={event =>
                      handleChange({
                        key: event.target.name,
                        value: event.target.checked ? "1" : ""
                      })
                    }
                  />
                  <p className={classes.smallText}>Search by Ship To</p>
                </div>
              </div>
            </Grid>
          </Grid>
        )}
      </div>
    </div>
  );
};

export default OrderFilters;
