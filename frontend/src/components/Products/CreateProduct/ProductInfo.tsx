import * as React from "react";
import { FormikProps } from "formik";
import { useAddProductImage } from "Hooks/useProducts";
import { ProductData } from "../../../Interfaces/Products";
import { Typography } from "@material-ui/core";
import Grid from "@mui/material/Grid";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import MuiIcon from "../../icons/MuiIcons";
import TextInput from "../../Form/TextInput";
import AddImage from "./AddImage";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flexDiv: {
      display: "flex",
      alignItems: "center"
    },
    flex: {
      display: "flex"
    },
    selectLabel: {
      display: "flex",
      alignItems: "center",
      marginBottom: "8px"
    },
    label: {
      fontSize: "14px",
      color: theme.palette.gray[600]
    }
  })
);

interface IProps {
  data: Partial<ProductData>;
  formik: FormikProps<Partial<ProductData>>;
  setProductImage: React.Dispatch<React.SetStateAction<string>>;
}
interface FileState {
  readonly name: string;
  readonly description: string;
  readonly is_cover?: boolean;
  readonly image: File | null;
}
const ProductInfo: React.FC<IProps> = props => {
  const classes = useStyles();
  const { mutateAsync: uploadImage } = useAddProductImage(props?.data?.id || "");

  const handleSetImage = (data: FileState) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = new FormData();
    formData.append("file", data.image);
    formData.append("is_cover", data?.is_cover);
    if (props?.data?.id) {
      uploadImage(formData).then(data => {
        props.setProductImage(data?.url);
      });
    }
  };
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item lg={8} md={8} sm={12} xs={12}>
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="subtitle1">Product Number</Typography>

              <TextInput
                value={props.data.sku || ""}
                name="sku"
                onChange={props.formik.handleChange}
                type="text"
                error={props.formik.touched.sku && Boolean(props.formik.errors.sku)}
                helperText={props.formik.touched.sku && props.formik.errors.sku}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <div className={classes.selectLabel}>
                <Typography variant="subtitle1"> Product Name</Typography>
                &nbsp;&nbsp;
                <MuiIcon icon="info" fontSize="small" color="disabled" />
              </div>
              <TextInput
                value={props.data.name || ""}
                name="name"
                onChange={props.formik.handleChange}
                type="text"
                error={props.formik.touched.name && Boolean(props.formik.errors.name)}
                helperText={props.formik.touched.name && props.formik.errors.name}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography variant="subtitle1">Description</Typography>

              <TextInput
                value={props.data.description || ""}
                name="description"
                onChange={props.formik.handleChange}
                type="number"
                isMultiline={true}
                minRows={6}
                maxRows={6}
                placeholder="Some Descriptive Text here"
                error={
                  props.formik.touched.description &&
                  Boolean(props.formik.errors.description)
                }
                helperText={
                  props.formik.touched.description && props.formik.errors.description
                }
              />
            </Grid>
          </Grid>
          {props.children}
        </Grid>
        <Grid item lg={4} md={4} sm={12} xs={12}>
          <AddImage formik={props.formik} handleSetImage={handleSetImage} />
        </Grid>
      </Grid>
    </div>
  );
};

export default ProductInfo;
