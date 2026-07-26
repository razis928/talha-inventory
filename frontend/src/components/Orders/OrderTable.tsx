import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import { OrderResponse, OrderData } from "Interfaces/Order";
import DataTable from "../DataTable/Table";
import Button from "../Button";
import MuiIcon from "../icons/MuiIcons";
import * as yup from "yup";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import IconButton from "@material-ui/core/IconButton";
import PrintModal from "./PrintModal";
import { useModal } from "Hooks/useModal";
import EmailInvoice from "../TakeOrder/OrderDetails/EmailInvoice";
import { useFormik } from "formik";
import { useSendEmailInvoice, useTrashOrder, useRestoreOrder } from "Hooks/useOrders";
import Prompt from "Components/Prompt";
import get from "lodash/get";
import AddBulkShipmentModal from "Components/Modals/AddBulkShipment";

interface Props {
  isLoading: boolean;
  orders: OrderResponse | undefined;
}

interface ColumnsProps {
  readonly name: string;
  readonly sortable?: boolean;
  readonly maxWidth?: number;
  readonly cell?: (row: OrderData) => JSX.Element;
  readonly selector?: (row: OrderData) => string | React.ReactNode;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    redField: {
      color: theme.palette.primary.main
    },
    selectButton: {
      marginTop: "10px"
    },
    successChip: {
      background: theme.palette.gray[1400],
      border: `0.5px solid ${theme.palette.gray[1500]}`,
      padding: "2px",
      color: theme.palette.gray[1500],
      borderRadius: "6px",
      minWidth: "95px",
      fontSize: 12
    },
    warnChip: {
      borderRadius: "6px",
      minWidth: "95px",
      background: "#FFF8E3",
      border: "0.5px solid #D9A81A",
      padding: "2px",
      color: "#D9A81A",
      fontSize: 12
    },
    dangerChip: {
      minWidth: "95px",
      background: "#FFF2F4",
      border: `0.5px solid ${theme.palette.primary.main}`,
      padding: "2px",
      color: theme.palette.primary.main,
      borderRadius: "6px",
      fontSize: 12
    }
  })
);

const OrderTable: React.FC<Props> = ({ orders, isLoading }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWarning, setShowWarning] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderData>();
  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({
    onSave: () => null
  });
  const bulkShipmentModal = useModal({
    onSave: () => null
  });
  const [selectedRow, setSelectedRows] = React.useState<OrderData[]>([]);
  const { mutate: sendEmailInvoice } = useSendEmailInvoice(selectedRow[0]?.id, "send");
  const { mutateAsync: trashOrder } = useTrashOrder();
  const { mutateAsync: restoreOrder } = useRestoreOrder();

  const pagination = {
    page: (orders?.page || 1).toString(),
    rowsPerPage: (orders?.count || 100).toString(),
    pages: (orders?.pages || 1).toString(),
    total: (orders?.total || 0).toString()
  };

  const handleChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    // If the value of a query param is empty string, delete it from URL
    value ? newParams.set(key, value) : newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleRowSelection = ({
    selectedRows
  }: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: OrderData[];
  }) => {
    setSelectedRows(selectedRows);
  };

  const handlePageChange = (p: number) => {
    handleChange("page", `${p}`);
  };
  const handleRowChange = (c: number) => {
    handleChange("count", `${c}`);
  };

  const columns: ColumnsProps[] = [
    {
      name: "Order No.",
      selector: row => row.number,
      cell: row => (
        <p className={classes.redField} onClick={() => handleRowClick(row?.id)}>
          {get(row, "number", "")}
        </p>
      ),
      sortable: true,
      maxWidth: 100
    },
    {
      name: "Order Date",
      selector: row => row.created,
      cell: row => (
        <p onClick={() => handleRowClick(row?.id)}>
          {new Date(get(row, "ordered")).toLocaleDateString()}
        </p>
      ),
      sortable: true
    },
    {
      name: "Customer Number",
      selector: row => row.company.number,
      cell: row => (
        <p onClick={() => handleRowClick(row?.id)} className={classes.redField}>
          {get(row, "company.number")}
        </p>
      ),
      sortable: true
    },
    {
      name: "Customer Name",
      selector: row => row.company.name,
      cell: row => (
        <p onClick={() => handleRowClick(row?.id)} className={classes.redField}>
          {get(row, "company.name")}
        </p>
      ),
      sortable: true
    },
    {
      name: "Total price",
      selector: row => `$${(row?.total_amount || 0).toFixed(2)}`,
      sortable: true,
      maxWidth: 100
    },
    {
      name: "Bill To",
      selector: row => row.company.billing_contact.title,
      cell: row => (
        <p onClick={() => handleRowClick(row?.id)} className={classes.redField}>
          {`${get(row, "company.billing_contact.user.first_name")} ${get(
            row,
            "company.billing_contact.user.last_name"
          )}`}
        </p>
      ),
      sortable: true
    },
    {
      name: "Ship To",
      selector: row => row.company.shipping_contact.title,
      cell: row => (
        <p onClick={() => handleRowClick(row?.id)} className={classes.redField}>
          {`${get(row, "company.shipping_contact.user.first_name")} ${get(
            row,
            "company.shipping_contact.user.last_name"
          )}`}
        </p>
      ),
      sortable: true
    },

    {
      name: "Payment Status",
      selector: row => `${row?.payment_status}`,
      cell: row => (
        <div
          onClick={() => handleRowClick(row?.id)}
          className={
            row?.payment_status === "not_paid"
              ? classes.dangerChip
              : row.payment_status === "paid"
              ? classes.successChip
              : classes.warnChip
          }
        >
          {get(row, "payment_status", "").split("_").join(" ").toUpperCase()}
        </div>
      ),
      sortable: true
    },
    {
      name: "Shipment Status",
      selector: row => `${row?.shipping_status}`,
      cell: row => (
        <div
          onClick={() => handleRowClick(row?.id)}
          className={
            row?.shipping_status === "not_shipped"
              ? classes.dangerChip
              : row.shipping_status === "partially_shipped"
              ? classes.warnChip
              : classes.successChip
          }
        >
          {get(row, "shipping_status", "").split("_").join(" ").toUpperCase()}
        </div>
      ),
      sortable: true
    },
    {
      name: "",
      maxWidth: 100,
      selector: row => {
        return (
          <IconButton
            aria-label={`${row?.is_trash ? "Restore" : "Delete"} order ${get(
              row,
              "number",
              ""
            )}`}
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={() => {
              setSelectedOrder(row);
              setShowWarning(true);
            }}
          >
            {row?.is_trash ? (
              <RestoreIcon color="success" />
            ) : (
              <DeleteIcon color="error" />
            )}
          </IconButton>
        );
      }
    }
  ];

  const handleRowClick = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const validationSchema = yup.object({
    email_from: yup.string().email("Enter a valid email").required("Email is required"),
    email_subject: yup.string().required("Required"),
    email_body: yup.string().required("Required")
  });

  const formik = useFormik({
    initialValues: {
      email_from: "",
      email_subject: "",
      email_body: "",
      email_to: [],
      email_cc: [],
      email_bcc: []
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      sendEmailInvoice(values);
      handleSave();
    }
  });

  const sendInvoice = () => {
    handleModalOpen();
  };

  const pageNumberInUrl = Number.parseInt(searchParams.get("page") || "1");

  React.useEffect(() => {
    if (orders?.pages && orders.pages < pageNumberInUrl) {
      const params = new URLSearchParams(searchParams);
      params.set("page", `${orders.pages}`);
      setSearchParams(params);
    }
  }, [orders?.pages, pageNumberInUrl, searchParams, setSearchParams]);

  return (
    <div>
      <Prompt
        openModal={showWarning}
        title="Delete Order"
        promptMsg={`This will ${
          selectedOrder?.is_trash ? "restore" : "trash"
        } the order number ${selectedOrder?.number}.`}
        onProceed={async () => {
          if (selectedOrder) {
            selectedOrder.is_trash
              ? await restoreOrder({ orderId: selectedOrder.id })
              : await trashOrder({ orderId: selectedOrder.id });
          }
          setShowWarning(false);
        }}
        onCancel={() => setShowWarning(false)}
      />
      <PrintModal
        saveText="Confirm Print"
        title="Print"
        handleSaveChanges={handleSave}
        handleCloseModal={handleModalClose}
        openModal={modalOpen}
      />
      <AddBulkShipmentModal
        saveText="Add Shipment"
        title="Add Bulk Shipment"
        handleSaveChanges={bulkShipmentModal.handleSave}
        handleCloseModal={bulkShipmentModal.handleModalClose}
        openModal={bulkShipmentModal.modalOpen}
      />
      <Grid container justifyContent="space-between">
        <Grid item xs={12} lg={4}></Grid>
        <Grid item xs={12} lg={6}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <EmailInvoice
              handleCloseModal={handleModalClose}
              handleSaveChanges={() => formik.handleSubmit()}
              openModal={modalOpen}
              saveText="Confirm Send"
              title="Email Invoice"
              formik={formik}
            />
            &nbsp;
            <Button
              icon={<MuiIcon color="action" fontSize="small" icon="add" />}
              text="Bulk Shipment"
              type="secondary"
              onClick={bulkShipmentModal.handleModalOpen}
            />
            &nbsp;
            <Button
              icon={<MuiIcon color="action" fontSize="small" icon="send" />}
              text="Send Invoices"
              type="secondary"
              disabled
              onClick={sendInvoice}
            />
            &nbsp;
            <Button
              icon={<MuiIcon color="action" fontSize="small" icon="download" />}
              text="Download Invoices"
              onClick={handleModalOpen}
              type="secondary"
              disabled
            />
            &nbsp;
            <Button
              icon={<MuiIcon color="action" fontSize="small" icon="delete" />}
              text="Trash"
              type="secondary"
              disabled
            />
          </div>
        </Grid>
      </Grid>
      <br />
      <DataTable
        tableStyles={{
          width: "calc(100vw - 320px)"
        }}
        selectableRows={true}
        columns={columns}
        data={orders?.results}
        showPagination
        loading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowChange={handleRowChange}
        onRowSelection={handleRowSelection}
        onRowClicked={({ id }) => handleRowClick(id)}
      />
    </div>
  );
};

export default OrderTable;
