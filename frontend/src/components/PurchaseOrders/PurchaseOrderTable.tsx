import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import DataTable from "Components/DataTable/Table";
// import Button from "Components/Button";
// import MuiIcon from "Components/icons/MuiIcons";
// import { useModal } from "Hooks/useModal";
import { useNavigate } from "react-router-dom";

interface ColumnsProps {
  readonly name: string;
  readonly selector?: (row: string) => string | React.ReactNode | undefined;
  readonly sortable?: boolean;
  readonly cell?: (row: string) => JSX.Element;
  readonly width?: string;
}
interface Props {
  isLoading: boolean;
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
const PurchaseOrderTable: React.FC<Props> = ({ isLoading }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const columns: ColumnsProps[] = [
    {
      name: "PO#",
      selector: row => `${"PO#"}`,
      cell: row => (
        <p
          onClick={() => navigate("/purchase-orders/create")}
          className={classes.redField}
        >
          PO Number
        </p>
      ),
      sortable: true
    },
    {
      name: "Status",
      selector: row => `${"status"}`,
      cell: row => <p>Pending</p>,
      sortable: true
    },
    {
      name: "Supplier Ref",
      selector: row => `${"supplier ref"}`,
      cell: row => <p>Sample Data</p>,
      sortable: true
    },
    {
      name: "Date",
      selector: row => `${"date"}`,
      cell: row => <p>03 Mar 2023</p>,
      sortable: true
    },
    {
      name: "Supplier",
      selector: row => `${"supplier"}`,
      cell: row => <p>Sample Data</p>,
      sortable: true
    },
    {
      name: "Location",
      selector: row => `${"location"}`,
      cell: row => <p>Sample Data</p>,
      sortable: true
    },
    {
      name: "Lines",
      selector: row => `${"lines"}`,
      cell: row => <p>Sample Data</p>,
      sortable: true
    },
    {
      name: "Total",
      selector: row => `${"total"}`,
      cell: row => <p>Sample Data</p>,
      sortable: true
    }
  ];
  return (
    <div>
      <Grid container justifyContent="space-between">
        <Grid item xs={12} lg={4}>
          <span>0 results </span>
          <span className={classes.redField}>({0} selected)</span>
        </Grid>
        {/* <div className={classes.flex}>
          <Button text="New PO" icon={<MuiIcon color="action" fontSize="small" icon="add" />} type="secondary" />
        </div> */}
      </Grid>
      <br />
      <DataTable
        selectableRows={true}
        columns={columns}
        data={[""]}
        showPagination
        loading={isLoading}
        pagination={undefined}
        onPageChange={() => {}}
        onRowChange={() => {}}
        onRowSelection={() => {}}
        onRowClicked={({ id }) => {}}
      />
    </div>
  );
};
export default PurchaseOrderTable;
