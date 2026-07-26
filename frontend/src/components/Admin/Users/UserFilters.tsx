import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "Components/Button";
import TextInput from "Components/Form/TextInput";
import CheckBox from "Components/CheckBox";
import { createFormReducer } from "Reducers/formReducer";
import DatePicker from "Components/Form/Date";
import { UserPageFilters } from "Interfaces/QueryFilters";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      justifyContent: "space-between",
      display: "flex"
    },
    heading: {
      fontSize: "21px"
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
    headerButton: {
      display: "flex",
      justifyContent: "flex-end"
    },
    flex: {
      display: "flex",
      alignItems: "center"
    },
    createBtn: {
      textAlign: "right"
    }
  })
);
interface Props {
  readonly header?: boolean;
  handleUserFilters(filters: Partial<UserPageFilters>): void;
  onSearch?(): unknown;
}

interface FormState {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  mobileNumber: string;
  officePhone: string;
  passwords: string;
  lastLoginFrom: string;
  lastLoginTo: string;
  type: string;
  organization: string;
  brands: string;
  stafRole: string;
  search: string;
  is_active: string;
}
const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  middleName: "",
  email: "",
  mobileNumber: "",
  officePhone: "",
  passwords: "",
  lastLoginFrom: "",
  lastLoginTo: "",
  type: "",
  organization: "",
  brands: "",
  stafRole: "",
  search: "",
  is_active: "1"
};

const formReducer = createFormReducer<FormState>(initialFormState);
const UsersFilters: React.FC<Props> = ({ header, handleUserFilters, onSearch }) => {
  const classes = useStyles();
  // const navigate = useNavigate();

  const [showFilters, setShowFilters] = React.useState<boolean>(true);
  const [checked, setChecked] = React.useState<boolean>(true);
  const [dateValue, setDateValue] = React.useState<Date | null>(null);

  const [formData, dispatch] = React.useReducer(formReducer, initialFormState);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: "HANDLE_INPUT_TEXT",
      field: e.target.name,
      payload: e.target.value
    });
  };

  const handleDateChange = (date: Date | null) => {
    setDateValue(date);
  };

  const handleReset = () => {
    onSearch?.();
    dispatch({ type: "RESET" });
  };

  React.useEffect(() => {
    const filters: Partial<UserPageFilters> = {};
    if (formData.firstName) {
      filters.first_name = formData.firstName;
    }
    if (formData.email) {
      filters.email = formData.email;
    }
    if (formData.middleName) {
      filters.middle_name = formData.middleName;
    }
    if (formData.lastName) {
      filters.last_name = formData.lastName;
    }
    if (formData.search) {
      filters.search = formData.search;
    }
    if (checked) {
      filters.is_active = `${Number(checked)}`;
    }

    handleUserFilters(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.firstName,
    formData.email,
    formData.middleName,
    formData.lastName,
    formData.search,
    checked
  ]);

  return (
    <div>
      <div className={classes.searchCustomerBody}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item lg={3} xs={6}>
            <h5 className={classes.searchHeading}>Search</h5>
          </Grid>
          <Grid item lg={4} xs={6}>
            <div className={classes.headerButton}>
              <Button
                disabled={!showFilters}
                text="Reset"
                type="secondary"
                onClick={handleReset}
              />
              &nbsp;
              <Button
                onClick={() => setShowFilters(!showFilters)}
                text={showFilters ? "Hide" : "Show"}
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
            justifyContent="flex-start"
          >
            <Grid lg={4} xs={12} item>
              <TextInput
                name="firstName"
                value={formData.firstName}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="First Name"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="lastName"
                value={formData.lastName}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Last Name"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="middleName"
                value={formData.middleName}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Middle Name"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="email"
                value={formData.email}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="email"
                label="Email"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="number"
                label="Mobile Number"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="officePhone"
                value={formData.officePhone}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="numebr"
                label="Office Phone"
                disabled
              />
            </Grid>

            <Grid lg={4} xs={12} item>
              <TextInput
                name="passwords"
                value={formData.passwords}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="number"
                label="Passwords"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <DatePicker
                onChange={handleDateChange}
                value={dateValue}
                label="Last Login From"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <DatePicker
                onChange={handleDateChange}
                value={dateValue}
                label="Last Login To"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="type"
                value={formData.type}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Type"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="organization"
                value={formData.organization}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Organization"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="brands"
                value={formData.brands}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Brands"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="stafRole"
                value={formData.stafRole}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Staff Role"
                disabled
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <TextInput
                name="search"
                value={formData.search}
                onChange={handleTextChange}
                margin="dense"
                variant="outlined"
                type="text"
                label="Search"
              />
            </Grid>
            <Grid lg={4} xs={12} item>
              <div className={classes.flex}>
                <CheckBox
                  checked={checked}
                  handleChange={handleChange}
                  name="is_active"
                  style={{ paddingLeft: "0" }}
                />{" "}
                <Typography variant="body2">Show Active Users only </Typography>
              </div>
            </Grid>
          </Grid>
        )}
      </div>
    </div>
  );
};

export default UsersFilters;
