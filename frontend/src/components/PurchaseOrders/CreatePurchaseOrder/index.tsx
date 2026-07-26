import * as React from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
// import * as yup from "yup";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { NavBar } from "../../Navbar";
import Button from "../../Button";
import MuiIcon from "../../icons/MuiIcons";
// import { Form } from "formik";
import PurchaseOrderEditForm from "./PurchaseOrderEditForm";
import PurchaseOrderEditTable from "./PurchaseOrderEditTable";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headerButtons: {
      display: "flex",
      justifyContent: "flex-end"
    },
    customerBackDiv: {
      display: "flex",
      color: theme.palette.gray[400],
      cursor: "pointer"
    },
    markActiveDiv: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    iconLabel: {
      display: "flex",
      alignItems: "center"
    },
    TypeSection: {
      display: "flex",
      alignItems: "center",
      marginLeft: theme.spacing(6),
      [theme.breakpoints.down("md")]: {
        marginLeft: 0
      }
    },
    checkedType: {
      borderRadius: "6px",
      border: `2px solid ${theme.palette.primary.main}`,
      marginRight: "5px"
    },
    unCheckedType: {
      borderRadius: "6px",
      border: `2px solid ${theme.palette.gray[300]}`,
      marginRight: "5px",
      color: theme.palette.gray[400]
    },

    infoIcon: {
      margin: "8px",
      color: theme.palette.gray[400]
    }
  })
);
const CreatePurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const classes = useStyles();

  return (
    <div>
      <NavBar pageTitle="Create Purchase Order">
        <div className={classes.headerButtons}>
          <Button text="Cancel" type="secondary" />
          &nbsp;
          <Button text="Save" variant="contained" submit="submit" />
        </div>
      </NavBar>
      <div style={{ padding: 30 }}>
        <Grid container justifyContent="space-between">
          {/* Back Icon */}
          <Grid container>
            <div
              className={classes.customerBackDiv}
              onClick={() => navigate("/purchase-orders")}
            >
              <p>
                <MuiIcon icon="backArrow" fontSize="small" />
              </p>{" "}
              &nbsp;
              <p>Purchase Order</p>
            </div>
          </Grid>
        </Grid>
        {/* Back Icon */}
        <Grid container spacing={2}>
          {/* Info Section */}
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <PurchaseOrderEditForm />
            <br />
            <PurchaseOrderEditTable isLoading={false} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;
