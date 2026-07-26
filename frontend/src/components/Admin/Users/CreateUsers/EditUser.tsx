import * as React from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { NavBar } from "Components/Navbar";
import Button from "Components/Button";
import MuiIcon from "../../../icons/MuiIcons";
import AddUserInfo from "./AddUsersInfo";
import EditUserRole from "./EditUserRole";
import AddImage from "./AddImage";
import { useFormik } from "formik";
import { UserData } from "Interfaces/User";
import * as yup from "yup";

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

const initialFormState: Partial<UserData> = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  password: "",
  mobile_phone: "",
  office_phone: "",
  type: undefined,
  is_active: true,
  profilePic: ""
};

const validationSchema = yup.object({
  first_name: yup.string().required("User's first name is required"),
  middle_name: yup.string(),
  last_name: yup.string().required("User's Last name is required"),
  email: yup.string().email().required("User email is required"),
  password: yup
    .string()
    .min(8, "Password must consist of 6 or more characters")
    .max(20, "Password must consist of 20 or less characters"),
  mobile_phone: yup.string(),
  office_phone: yup.string(),
  isActive: yup.boolean(),
  profilePic: yup.string()
});

interface Props {
  userId: string;
}

const EditUser: React.FC<Props> = ({ userId }) => {
  const navigate = useNavigate();
  const classes = useStyles();

  const formik = useFormik({
    initialValues: initialFormState,
    validationSchema: validationSchema,
    onSubmit: values => {
      // do something
    }
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <NavBar pageTitle="Edit User">
          <div className={classes.headerButtons}>
            <Button text="Cancel" type="secondary" />
            &nbsp;
            <Button
              text="Save User"
              variant="contained"
              loading={false}
              submit="submit"
            />
          </div>
        </NavBar>
        <div style={{ padding: 30 }}>
          <Grid container justifyContent="space-between">
            {/* Back Icon */}
            <Grid container>
              <div
                className={classes.customerBackDiv}
                onClick={() => navigate("/admin/users")}
              >
                <p>
                  <MuiIcon icon="backArrow" fontSize="small" />
                </p>{" "}
                &nbsp;
                <p>Users</p>
              </div>
            </Grid>
          </Grid>
          {/* Back Icon */}
          <Grid container spacing={2}>
            {/* Info Section */}
            <Grid item lg={8} md={8} sm={12} xs={12}>
              <AddUserInfo data={formik.values} formik={formik} />
              <EditUserRole />
            </Grid>
            <Grid item lg={4} md={4} sm={12} xs={12}>
              <AddImage />
            </Grid>
            {/* Info Section */}
          </Grid>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
