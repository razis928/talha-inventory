import * as React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { Typography, Radio } from "@material-ui/core";
import Grid from "@mui/material/Grid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    flex: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(1)
    },

    checkedType: {
      borderRadius: "6px",
      border: `2px solid ${theme.palette.primary.main}`,
      marginBottom: theme.spacing(2)
    },
    unCheckedType: {
      borderRadius: "6px",
      border: `2px solid ${theme.palette.gray[300]}`,
      marginBottom: theme.spacing(2),

      color: theme.palette.gray[400]
    },

    headingSection: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2)
    },
    assignBtn: {
      margin: theme.spacing(2),
      marginLeft: theme.spacing(3)
    }
  })
);
const roles = [
  {
    title: "Brand Admin",
    description: "can manage orders across all brands of multiple assigned organizations"
  },
  {
    title: "Brand Employee",
    description:
      "can take and manage orders for all brands of a single assigned organization"
  }
];

const EditUserRole: React.FC = () => {
  const classes = useStyles();
  const [selectedUserRole, setSelectedUserRole] = React.useState("Brand Employee");
  const handleChangeType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedUserRole(event.target.value);
  };

  return (
    <div>
      <div className={classes.headingSection}>
        <Typography variant="h6">User Role</Typography>
      </div>
      <div className={classes.headingSection}>
        <Typography variant="body1">User Type</Typography>
      </div>

      <Grid container spacing={1}>
        {roles?.map(role => (
          <Grid
            key={role.title}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            item
            className={
              selectedUserRole === role.title
                ? classes.checkedType
                : classes.unCheckedType
            }
          >
            <div className={classes.flex}>
              <Radio
                checked={selectedUserRole === role.title}
                onChange={handleChangeType}
                value={role.title}
              />
              <div>
                <Typography variant="body1">{role.title}</Typography>
                <Typography variant="body2">{role.description}</Typography>
              </div>
            </div>
            {/* {selectedUserRole === "Organization Employee" &&
            role.title === "Organization Employee" ? (
              <div>
                <hr />
                <div className={classes.assignBtn}>
                  <Button text="Assign Organizations" type="secondary" />
                </div>
              </div>
            ) : (
              ""
            )} */}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default EditUserRole;
