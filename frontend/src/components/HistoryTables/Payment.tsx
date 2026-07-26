import * as React from "react";
import Chip from "@material-ui/core/Chip";
import Grid from "@mui/material/Grid";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { PaymentHistoryTableData } from "../../Interfaces/TableInterfaces";
import DataTable from "../DataTable/Table";
import Button from "../Button";
import MuiIcon from "../icons/MuiIcons";
import PaymentModal from "../Payments/PaymentModal";
import { useModal } from "../../Hooks/useModal";
import { EmptyData } from "../icons/EmptyData";
import PaymentResponseModal from "./PaymentResponseModal";
import { OrderData } from "Interfaces/Order";
import { useAddOrderPayment } from "Hooks/usePayment";

interface ColumnsProps {
  readonly name: string;
  readonly sortable?: boolean;
  readonly selector: (
    row: PaymentHistoryTableData
  ) => string | React.ReactNode | undefined;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      marginTop: "6px",
      border: `1px solid ${theme.palette.green.success}`,
      color: theme.palette.green.success,
      background: theme.palette.green.successBg
    }
  })
);

interface Props {
  order: OrderData;
}

const Payment = ({ order }: Props) => {
  const classes = useStyles();
  const { status, mutate: addPayment } = useAddOrderPayment(order.id);
  const paymentResponseModal = useModal();
  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({});

  React.useEffect(() => {
    if (status === "success" || status === "error") {
      handleModalClose();
      paymentResponseModal.handleModalOpen();
    }
  }, [status]); // eslint-disable-line

  const columns: ColumnsProps[] = [
    {
      name: "Date",
      selector: row => new Date(row.created).toLocaleDateString()
    },
    {
      name: "Method",
      selector: row => row.type.split("_").join(" ").toUpperCase()
    },
    {
      name: "Transaction ID",
      selector: row => row.receipt.toUpperCase()
    },
    {
      name: "Paid",
      selector: row => `$${row.total.toFixed(2)}`
    },
    {
      name: "Refunded",
      selector: row => `${row.is_refunded ? "YES" : "NO"}`
    },
    {
      name: "Status",
      selector: row => <Chip className={classes.chip} label={row.status.toUpperCase()} />
    }
  ];

  return (
    <div id="payments">
      <PaymentModal
        title="Add Payment"
        saveText="Save"
        handleCloseModal={handleModalClose}
        handleSaveChanges={handleSave}
        openModal={modalOpen}
        order={order}
        addPayment={addPayment}
        paymentSuccess={status === "success"}
        saveBtnLoading={status === "loading"}
      />
      <PaymentResponseModal
        openModal={paymentResponseModal.modalOpen}
        handleCloseModal={paymentResponseModal.handleModalClose}
        handleSaveChanges={() => {
          paymentResponseModal.handleModalClose();
          if (status === "success") {
            handleModalOpen();
          } else {
            // Retry adding payment
            paymentResponseModal.handleModalClose();
            handleModalOpen();
          }
        }}
        type={status === "success" ? "success" : "fail"}
      />
      <h2>Payment History</h2>
      {order.payments?.length > 0 ? (
        <DataTable columns={columns} data={order.payments} />
      ) : (
        <div style={{ width: "40%", marginLeft: "40%" }}>
          <EmptyData height={100} />
          <p>No payments added yet</p>
        </div>
      )}
      <br />
      <Grid container>
        <Grid item lg={2} xs={6}>
          <Button
            onClick={handleModalOpen}
            text="Add Payment"
            type="secondary"
            icon={<MuiIcon icon="add" />}
            disabled={!order.products?.length || order.is_trash}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Payment;
