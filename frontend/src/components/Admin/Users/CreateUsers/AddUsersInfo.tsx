import * as React from "react";
import { Typography } from "@material-ui/core";
import Grid from "@mui/material/Grid";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import CheckBox from "../../../CheckBox";
import TextInput from "../../../Form/TextInput";
import { FormikProps } from "formik";
import MaskingInput from "Components/Form/MaskingInput";
import { UserData } from "Interfaces/User";
// import { createFormReducer } from "../../../../Reducers/formReducer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    headerButtons: {
      display: "flex",
      justifyContent: "flex-end"
    },
    customerBackDiv: {
      display: "flex"
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

interface Props {
  formik: FormikProps<Partial<UserData>>;
  data: Partial<UserData>;
}

const AddUserInfo: React.FC<Props> = ({ data, formik }) => {
  const classes = useStyles();

  const handleNumberChange = (name: string, value: string) => {
    formik.setFieldValue(name, value, true);
  };

  return (
    <div>
      {/* Header Section */}
      <Grid container alignItems="center">
        <Grid item lg={8} md={8} sm={12} xs={12}>
          <Typography variant="h6">Basic Information</Typography>
        </Grid>
        <Grid item lg={4} md={4} sm={12} xs={12}>
          <div className={classes.markActiveDiv}>
            <p>
              <CheckBox
                checked={Boolean(data.is_active)}
                handleChange={formik.handleChange}
              />
            </p>{" "}
            &nbsp;
            <Typography variant="body2">Mark as Not-Active</Typography>
          </div>
        </Grid>
      </Grid>
      {/* Header Section */}
      <Grid container alignItems="center" spacing={2}>
        <Grid item lg={4} md={4} sm={12} xs={12}>
          <Typography variant="subtitle1">First Name</Typography>

          <TextInput
            onChange={formik.handleChange}
            value={data.first_name}
            name="first_name"
            type="text"
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
          />
        </Grid>
        <Grid item lg={4} md={4} sm={12} xs={12}>
          <Typography variant="subtitle1">Middle Name</Typography>

          <TextInput
            onChange={formik.handleChange}
            value={data.middle_name}
            name="middle_name"
            type="text"
            error={formik.touched.middle_name && Boolean(formik.errors.middle_name)}
            helperText={formik.touched.middle_name && formik.errors.middle_name}
          />
        </Grid>
        <Grid item lg={4} md={4} sm={12} xs={12}>
          <Typography variant="subtitle1">Last Name</Typography>

          <TextInput
            onChange={formik.handleChange}
            value={data.last_name}
            name="last_name"
            type="text"
            error={formik.touched.last_name && Boolean(formik.errors.last_name)}
            helperText={formik.touched.last_name && formik.errors.last_name}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Typography variant="subtitle1">Email</Typography>

          <TextInput
            onChange={formik.handleChange}
            value={data.email}
            name="email"
            type="email"
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Typography variant="subtitle1">Password</Typography>

          <TextInput
            onChange={formik.handleChange}
            value={data.password}
            name="password"
            type="password"
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Typography variant="subtitle1">Mobile Phone Number</Typography>
          <MaskingInput
            type="text"
            showMask={true}
            maskType="phone"
            name="mobile_phone"
            placeholder="+x (xxx) xxx-xxxx"
            onChange={handleNumberChange}
            value={formik.values.mobile_phone}
            error={formik.touched.mobile_phone && Boolean(formik.errors.mobile_phone)}
            helperText={formik.touched.mobile_phone && formik.errors.mobile_phone}
          />
        </Grid>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Typography variant="subtitle1">Office Phone Number</Typography>

          {/* <TextInput
            onChange={formik.handleChange}
            value={data.office_phone}
            name="office_phone"
            type="text"
            error={formik.touched.office_phone && Boolean(formik.errors.office_phone)}
            helperText={formik.touched.office_phone && formik.errors.office_phone}
          /> */}
          <MaskingInput
            type="text"
            showMask={true}
            maskType="phone"
            name="office_phone"
            placeholder="+x (xxx) xxx-xxxx"
            onChange={handleNumberChange}
            value={formik.values.office_phone}
            error={formik.touched.office_phone && Boolean(formik.errors.office_phone)}
            helperText={formik.touched.office_phone && formik.errors.office_phone}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Typography variant="subtitle1">Fax</Typography>

          <TextInput
            onChange={formik.handleChange}
            value={""}
            name="fax"
            type="number"
            disabled
          />
        </Grid>
      </Grid>

      <br />
      <br />
      <hr />
    </div>
  );
};

export default AddUserInfo;
