import * as React from "react";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import * as yup from "yup";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import { useModal } from "Hooks/useModal";
// components
import Chip from "@mui/material/Chip";
import Button from "Components/Button";
import Prompt from "Components/Prompt";
import TextInput from "Components/Form/TextInput";
import MuiIcon from "Components/icons/MuiIcons";
import EmailInvoice from "./EmailInvoice";
import Select, { Option } from "../../Form/Select";
import { OrderData } from "Interfaces/Order";
import { CompanyData } from "Interfaces/Company";
import { useEditOrder } from "Hooks/useOrders";
import DatePicker from "../../Form/Date";
import { useSendEmailInvoice, useGetInvoices, useTrashOrder } from "Hooks/useOrders";
import { getAccessToken } from "Hooks/api";
import { useRestoreOrder } from "Hooks/useOrders";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontSize: "21px",
      fontWeight: "bold"
    },
    label: {
      marginBottom: "0px",
      marginTop: "0px",
      fontWeight: "bold",
      fontSize: "12px"
    },
    selectLabel: {
      display: "block",
      marginBottom: "8px",
      marginTop: "0px",
      fontWeight: "bold",
      fontSize: "12px"
    },
    btnSection: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center"
    }
  })
);

interface Props {
  order: OrderData;
  customer: CompanyData;
}

const options: Option[] = [
  {
    label: "Telephone",
    value: "phone"
  },
  {
    label: "Website",
    value: "website"
  },
  {
    label: "Postal Mail Order",
    value: "mail"
  }
];

const OrderDetails: React.FC<Props> = ({ order, customer }) => {
  const classes = useStyles();
  const { id: orderId } = useParams<"id">();
  const [orderSource, setOrderSource] = React.useState<Option>();
  const [showDeleteWarning, setShowDeleteWarning] = React.useState(false);
  const [showChangeSourceWarning, setShowChangeSourceWarning] = React.useState(false);
  const [isFileDownloading, setIsFileDownloading] = React.useState(false);
  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({});
  const { mutate: restoreOrder, isLoading: isLoadingRestoreOrder } = useRestoreOrder();
  const { mutate: sendEmailInvoice, isLoading: isLoadingSendEmailInvoice } =
    useSendEmailInvoice(order?.id || "");
  const { mutateAsync: trashOrder, isLoading: isLoadingTrashOrder } = useTrashOrder(
    order?.id || ""
  );
  const { mutateAsync: changeOrderSource, isLoading: isLoadingChangeOrderSource } =
    useEditOrder(order?.id || "");
  const { data: invoiceData } = useGetInvoices(orderId as string);
  const validationSchema = yup.object({
    email_subject: yup.string().required("Required"),
    email_body: yup.string().required("Required")
  });
  const formik = useFormik({
    initialValues: {
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

  const emailsList: string[] = [];

  React.useEffect(() => {
    if (order?.billing_address?.email) emailsList.push(order.billing_address.email);
    if (
      order?.shipping_address?.email &&
      !emailsList.includes(order.shipping_address.email)
    )
      emailsList.push(order.shipping_address.email);
    formik.setFieldValue("email_to", emailsList);
    const orderSrc = options.find(option => option.value === order.source);
    if (orderSrc) {
      setOrderSource(orderSrc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dependency needs formik that will run continuously
  }, [order]);

  const handleDateChange = (date: Date | null) => {
    /** */
  };

  const handlePrintInvoices = () => {
    invoiceData?.invoices?.forEach(async item => {
      setIsFileDownloading(true);

      const resp = await fetch(item.url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });

      if (resp.ok) {
        const pdf = await resp.blob();
        const url = URL.createObjectURL(pdf);
        const link = document.createElement("a");
        link.href = url;
        link.download = item.name;
        link.click();
        link.remove();
        setIsFileDownloading(false);
      }
    });
  };

  const promptMessage = order.is_trash
    ? "This will restore the order."
    : "This will mark the order as trashed.";

  return (
    <div>
      <Prompt
        promptMsg={promptMessage}
        title={order?.is_trash ? "Restore order" : "Trash order"}
        openModal={showDeleteWarning}
        onCancel={() => setShowDeleteWarning(false)}
        onProceed={async () => {
          setShowDeleteWarning(false);
          if (order?.is_trash) {
            restoreOrder({ orderId: order.id });
          } else {
            await trashOrder({ orderId: order?.id });
          }
        }}
      />

      <Prompt
        promptMsg="Changing the order source will impact the overall tax."
        title="Change Order Source"
        openModal={showChangeSourceWarning}
        onCancel={() => {
          setShowChangeSourceWarning(false);
          setOrderSource(options.find(f => f.value === order.source));
        }}
        onProceed={async () => {
          setShowChangeSourceWarning(false);
          changeOrderSource({ source: orderSource?.value, category: order.category });
        }}
      />

      <EmailInvoice
        handleCloseModal={handleModalClose}
        handleSaveChanges={() => formik.handleSubmit()}
        openModal={modalOpen}
        saveText="Confirm Send"
        title="Email Invoice"
        formik={formik}
        invoiceData={invoiceData}
      />
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item lg={6} md={12}>
          <h3 className={classes.title}>
            Order
            {order.is_trash ? (
              <Chip color="error" label="Trashed" style={{ marginLeft: 12 }} />
            ) : null}
          </h3>
        </Grid>
        <Grid item lg={6} md={12}>
          <div className={classes.btnSection}>
            <Button
              loading={isLoadingTrashOrder || isLoadingRestoreOrder}
              text={order.is_trash ? "Restore" : "Trash Order"}
              variant="outlined"
              icon={
                <MuiIcon icon={order?.is_trash ? "undo" : "delete"} fontSize="small" />
              }
              onClick={() => setShowDeleteWarning(true)}
            />
            &nbsp; &nbsp;
            <Button
              loading={isLoadingSendEmailInvoice}
              text="Email Invoice"
              variant="outlined"
              onClick={handleModalOpen}
              icon={<MuiIcon icon="email" fontSize="small" />}
              disabled={
                !order.products?.length ||
                (invoiceData && !invoiceData?.invoices?.length) ||
                order.is_trash
              }
            />
            &nbsp; &nbsp;
            <Button
              text="Print Invoice"
              variant="outlined"
              icon={<MuiIcon icon="print" fontSize="small" />}
              onClick={handlePrintInvoices}
              disabled={
                !order.products?.length || (invoiceData && !invoiceData?.invoices?.length)
              }
              loading={isFileDownloading}
            />
          </div>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item lg={3} xs={12}>
          <p className={classes.label}>Order Number</p>
          <Grid container alignItems="center" spacing={1}>
            <Grid item lg={12} xs={12}>
              <TextInput
                inputProps={{ "aria-label": "order number" }}
                variant="outlined"
                margin="dense"
                name="orderNumber"
                type="text"
                disabled={true}
                value={order?.number || ""}
              />
            </Grid>
            <Grid item xs={2} lg={3} style={{ display: "none" }}>
              <Button
                icon={<MuiIcon icon={"loop"} />}
                variant="outlined"
                type="secondary"
                size="small"
                onlyIcon={true}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item lg={3} xs={12}>
          <label htmlFor="orderSource" className={classes.selectLabel}>
            Order Source
          </label>
          <Select
            loading={isLoadingChangeOrderSource}
            ariaLabel="order source"
            options={options}
            name="orderSource"
            disabled={order.is_trash}
            defaultValue={options.find(option => option.value === order.source)}
            value={orderSource}
            onChange={value => {
              setOrderSource(value);
              setShowChangeSourceWarning(true);
            }}
          />
        </Grid>
        <Grid item lg={2} xs={12}>
          <p className={classes.label}>Customer Number</p>
          <TextInput
            inputProps={{ "aria-label": "customer number" }}
            variant="outlined"
            margin="dense"
            name="customerNumber"
            type="text"
            disabled
            value={customer?.number || ""}
          />
        </Grid>
        <Grid item lg={2} xs={12}>
          <p className={classes.label}>Order Date</p>
          <DatePicker
            inputAriaLabel="order date"
            onChange={handleDateChange}
            value={new Date(order.created)}
            pageName="TakeOrder"
            disabled
          />
        </Grid>
        <Grid item lg={2} xs={12}>
          <p className={classes.label}>Shipping Date</p>
          <DatePicker
            inputAriaLabel="shipping date"
            onChange={handleDateChange}
            value={order?.ship_date ? new Date(order.ship_date) : null}
            pageName="TakeOrder"
            disabled
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default OrderDetails;
