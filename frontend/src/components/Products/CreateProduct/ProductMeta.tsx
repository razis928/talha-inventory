import * as React from "react";
import { Typography } from "@material-ui/core";
import Grid from "@mui/material/Grid";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import TextInput from "Components/Form/TextInput";
import Switch from "Components/Switch";
import Select from "Components/Form/Select";
import { FormikProps } from "formik";
import { ProductData } from "Interfaces/Products";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    label: {
      marginTop: theme.spacing(5)
    },
    label1: {
      marginTop: theme.spacing(2)
    },
    switchLabel: {
      padding: theme.spacing(5),
      paddingLeft: 0,
      paddingRight: 0
    },
    switchDiv: {
      marginLeft: "auto",
      width: "fit-content",
      paddingRight: theme.spacing(5)
    },
    switchSection: {
      borderBottom: `2px solid ${theme.palette.gray[700]}`
    },
    pricingSection: {
      borderBottom: `2px solid ${theme.palette.gray[700]}`,
      paddingBottom: theme.spacing(5)
    },
    description: {
      marginTop: theme.spacing(2)
    },
    selectLabel: {
      marginTop: theme.spacing(3),
      display: "flex",
      alignItems: "center",
      marginBottom: "8px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
    },
    tHead: { borderCollapse: "collapse" },
    tableHeader: {
      background: theme.palette.gray[1000],
      borderRadius: "6px 6px 0px 0px",
      height: "52px",
      color: theme.palette.gray[500],
      fontSize: "12px"
    },
    iconCell: {
      display: "flex",
      justifyContent: "right"
    },
    tableCell: {
      padding: "17px",
      // width: "150px",
      textAlign: "left"
    }
  })
);
interface IProps {
  data: Partial<ProductData>;
  formik: FormikProps<Partial<ProductData>>;
}

const ProductMeta: React.FC<IProps> = props => {
  const classes = useStyles();

  return (
    <div>
      <Grid container>
        <Grid item lg={12} md={12} sm={12} xs={12}>
          <Typography variant="subtitle1" className={classes.label}>
            SEO Slug
          </Typography>
          <TextInput
            value={props.data.seo_slug || ""}
            name="seo_slug"
            onChange={props.formik.handleChange}
            type="text"
            placeholder="some-example-seo-slug-here"
            error={props.formik.touched.seo_slug && Boolean(props.formik.errors.seo_slug)}
            helperText={props.formik.touched.seo_slug && props.formik.errors.seo_slug}
          />
        </Grid>
      </Grid>
      <br />
      <hr />
      {/* Is Downloadable */}
      {/* <div className={classes.switchSection}>
        <Grid container alignItems="center">
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <div className={classes.switchLabel}>
              <Typography variant="h6">Is Downloadable</Typography>
              <Typography variant="body2" className={classes.description}>
                Short description explaining Is_Downloadable
              </Typography>
            </div>
          </Grid>
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <div className={classes.switchDiv}>
              <Switch
                checked={props.data?.is_downloadable}
                onChange={e =>
                  props.formik.setFieldValue("is_downloadable", e.target.checked, true)
                }
              />
            </div>
          </Grid>
        </Grid>
      </div> */}
      {/* Is Downloadable */}
      {/* is Saas */}
      {/* <div className={classes.switchSection}>
        <Grid container alignItems="center">
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <div className={classes.switchLabel}>
              <Typography variant="h6">Is SaaS</Typography>
              <Typography variant="body2" className={classes.description}>
                Short description explaining Is_SaaS
              </Typography>
            </div>
          </Grid>
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <div className={classes.switchDiv}>
              <Switch
                checked={props.data?.is_saas}
                onChange={e =>
                  props.formik.setFieldValue("is_saas", e.target.checked, true)
                }
              />
            </div>
          </Grid>
        </Grid>
      </div> */}
      {/* is Saas */}
      {/* Pricing */}
      <div className={classes.pricingSection}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <Typography variant="h6" className={classes.label1}>
              Pricing
            </Typography>
          </Grid>
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <Typography variant="subtitle1" className={classes.label1}>
              Retail Price ($)
            </Typography>
            <TextInput
              placeholder="$0.00"
              value={props.data.retail_price || 0}
              name="retail_price"
              onChange={props.formik.handleChange}
              type="number"
              error={
                props.formik.touched.retail_price &&
                Boolean(props.formik.errors.retail_price)
              }
              helperText={
                props.formik.touched.retail_price && props.formik.errors.retail_price
              }
            />
          </Grid>
          <Grid item lg={6} md={6} sm={12} xs={12}>
            <Typography variant="subtitle1" className={classes.label1}>
              Shipping Price ($)
            </Typography>
            <TextInput
              value={props.data.shipping_rate || 0}
              name="shipping_rate"
              onChange={props.formik.handleChange}
              type="number"
              placeholder="shippingPrice"
            />
          </Grid>
          {props.children}
        </Grid>
      </div>
      {/* Pricing */}
      {/* Tax Exemption */}
      <Grid container alignItems="center">
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <div className={classes.switchLabel}>
            <Typography variant="h6">Tax Exemption</Typography>
            <Typography variant="body2" className={classes.description}>
              Short description explaining Tax Exemption
            </Typography>
          </div>
        </Grid>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <div className={classes.switchDiv}>
            <Switch
              checked={props.data?.is_tax_exempt || false}
              onChange={e =>
                props.formik.setFieldValue("is_tax_exempt", e.target.checked, true)
              }
            />
          </div>
        </Grid>
      </Grid>
      {/* Tax Exemption */}
      {/* Tax Class and Tax Status */}
      <Grid container alignItems="center" spacing={2}>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <div className={classes.selectLabel}>
            <Typography variant="subtitle1">Tax Class</Typography>
          </div>
          <Select
            name="taxClass"
            options={[]}
            placeholder="Select Tax Class"
            disabled={true}
          />
        </Grid>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <div className={classes.selectLabel}>
            <Typography variant="subtitle1">Tax Status</Typography>
          </div>
          <Select
            name="taxStatuses"
            options={[]}
            placeholder="Select Tax Satus"
            disabled={true}
          />
        </Grid>
      </Grid>
      {/* Tax Class and Tax Status */}
    </div>
  );
};

export default ProductMeta;
