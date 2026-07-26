import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import Switch from "Components/Switch";
import { UserTableData } from "Interfaces/TableInterfaces";
import { UserData, UserResponse } from "Interfaces/User";
import DataTable from "Components/DataTable/Table";
import Button from "Components/Button";
import MuiIcon from "Components/icons/MuiIcons";
import ResetPassModal from "./ResetPassModal";
import { useModal } from "Hooks/useModal";
import { QueryPagination } from "Interfaces/QueryFilters";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import { get } from "lodash";
import Prompt from "Components/Prompt";

interface ColumnsProps {
  readonly name: string;
  readonly selector?: (row: UserData) => string | React.ReactNode | undefined;
  readonly sortable?: boolean;
  readonly cell?: (row: UserTableData) => JSX.Element;
  readonly width?: string;
}

interface Props {
  users?: UserResponse;
  isLoading: boolean;
  handlePagination(values: Partial<QueryPagination>): void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    redField: {
      marginBottom: "5px",
      color: theme.palette.primary.main,
      fontWeight: "bold"
    },
    selectButton: {
      marginTop: "10px"
    },
    greyField: {
      color: theme.palette.text.secondary
    },
    flex: {
      display: "flex",
      alignItems: "center"
    },

    passwordItem: {
      display: "flex",
      alignItems: "center",
      marginTop: "-6px"
    },
    iconAvatar: {
      marginLeft: "7px",
      width: "22px",
      height: "22px",
      marginTop: "5px"
    },
    editButton: {
      marginTop: "10px",
      color: theme.palette.text.secondary
    }
  })
);
const UserTable: React.FC<Props> = ({ isLoading, users, handlePagination }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [checked, setChecked] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<{
    id: string;
    is_trash: boolean;
  }>();
  const [selectedRows, setSelectedRows] = React.useState<UserData[]>([]);
  const [showWarning, setShowWarning] = React.useState(false);

  const columns: ColumnsProps[] = [
    {
      name: "",
      cell: row => <img height="50" width="50" src={row?.profilePic} alt="" />,
      sortable: true,
      width: "80px"
    },
    {
      name: "Full Name",
      selector: row => `${row?.first_name}`,
      cell: row => (
        <p className={classes.redField}>
          {row?.first_name} {row?.middle_name} {row?.last_name}
        </p>
      ),
      sortable: true
    },
    {
      name: "Email",
      selector: row => `${row?.email}`,
      sortable: true
    },
    {
      name: "Password",
      selector: row => `${row.password}`,
      width: "150px",

      cell: row => (
        <div className={classes.passwordItem}>
          <p className={classes.redField}>{row?.password || "--"}</p>&nbsp;&nbsp;
          <span onClick={() => handleModalOpen()}>
            <MuiIcon fontSize="small" icon="edit" className={classes.editButton} />
          </span>
        </div>
      ),
      sortable: true
    },
    {
      name: "Mobile Number",
      selector: row => `${row.mobile_phone}`,
      cell: row => <p className={classes.greyField}>{row?.mobile_phone || "--"}</p>,
      sortable: true
    },
    {
      name: "Last Login",
      selector: row => `${row.last_login}`,
      cell: row => (
        <p className={classes.greyField}>
          {row.last_login ? convertDate(new Date(row.last_login)) : "--"}
        </p>
      ),
      sortable: true
    },
    {
      name: "Active",
      selector: row => `${row.is_active}`,
      cell: row => <Switch checked={row.is_active} disabled />,
      sortable: true
    },
    {
      name: "",
      selector: row => {
        return (
          <>
            <IconButton
              aria-label={`edit customer ${get(row, "number", "")}`}
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={() => {
                navigate(`/admin/user/${get(row, "id", "")}`);
              }}
            >
              {!row.is_trash && <EditIcon />}
            </IconButton>
            <IconButton
              aria-label={`${
                userToDelete?.is_trash ? "Restore" : "Delete"
              } customer ${get(row, "number", "")}`}
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={() => {
                setUserToDelete({
                  id: row.id,
                  is_trash: !!row.is_trash
                });
                // setShowWarning(true);
              }}
            >
              {row.is_trash ? <RestoreIcon /> : <DeleteIcon color="error" />}
            </IconButton>
          </>
        );
      }
    }
  ];

  const pagination = {
    page: (users?.page || 1).toString(),
    rowsPerPage: (users?.count || 10).toString(),
    pages: (users?.pages || 1).toString(),
    total: (users?.total || 0).toString()
  };

  const handlePageChange = (p: number) => {
    handlePagination({ page: `${p}` });
  };

  const handleRowChange = (c: number) => {
    handlePagination({ count: `${c}` });
  };

  const handleRowSelect = (data: { selectedRows: UserData[] }) => {
    setSelectedRows(data.selectedRows);
  };

  const convertDate = (date: Date): string => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({
    onSave: () => null
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleRowClick = (id: string) => {
    navigate(`/admin/user/edit/${id}`);
  };

  return (
    <div>
      <Prompt
        openModal={showWarning}
        title={`${userToDelete?.is_trash ? "Restore" : "Trash"} Customer`}
        promptMsg={`This will ${userToDelete?.is_trash ? "restore" : "trash"} the user.`}
        onProceed={
          // async
          () => {
            // userToDelete?.is_trash
            //   ? await restoreCustomer({ customerId: get(userToDelete, "id") })
            //   : await trashCustomer({ customerId: get(userToDelete, "id") });
            setShowWarning(false);
          }
        }
        onCancel={() => setShowWarning(false)}
      />
      <ResetPassModal
        title=""
        noHeader={true}
        saveText="Send Reset Link"
        handleCloseModal={handleModalClose}
        handleSaveChanges={handleSave}
        openModal={modalOpen}
        checkBox={{ text: "Update Email", value: checked, handleChange: handleChange }}
      />
      {Boolean(users?.results?.length) && (
        <Grid container justifyContent="space-between">
          <Grid item xs={12} lg={4}>
            <span>{users?.results?.length || 0} results </span>
            <span className={classes.redField}>({selectedRows?.length} selected)</span>
          </Grid>
          <div className={classes.flex}>
            <Button
              text="Bulk Delete"
              icon={<MuiIcon icon="delete" />}
              type="secondary"
              disabled
            />
          </div>
        </Grid>
      )}
      <br />
      <DataTable
        selectableRows={true}
        columns={columns}
        data={users?.results}
        showPagination
        loading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowChange={handleRowChange}
        onRowSelection={handleRowSelect}
        onRowClicked={({ id }) => handleRowClick(id)}
      />
    </div>
  );
};

export default UserTable;
