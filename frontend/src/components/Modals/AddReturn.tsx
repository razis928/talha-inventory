import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ModalInterface } from "Interfaces/ModalInterface";
import ModalPopUp from "Components/ModalPopup";
import { Avatar } from "@mui/material";
import get from "lodash/get";
import { OrderData, OrderProduct } from "Interfaces/Order";
import TextInput from "Components/Form/TextInput";
import Button from "Components/Button";
import MuiIcon from "Components/icons/MuiIcons";
import { useAddOrderReturn } from "Hooks/useOrders";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      marginTop: "6px"
    },
    imgDiv: {
      display: "flex",
      textAlign: "center",
      color: "red",
      padding: "2px"
    },
    productName: {
      whiteSpace: "normal",
      color: theme.palette.primary.main
    },
    container: {
      borderTop: `1px solid ${theme.palette.gray[700]}`,
      padding: "10px 0px 10px 0px"
    },
    subConatiner: {
      border: `1px solid ${theme.palette.gray[700]}`,
      background: theme.palette.gray[100],
      padding: "10px 0px 10px 0px",
      display: "flex",
      borderRadius: "6px"
    },
    paidAmountDiv: {
      padding: "5px",
      width: "50%"
    },
    paidAmount: {
      color: theme.palette.gray[600],
      fontWeight: "bold",
      marginLeft: "10px"
    },
    refundAmountDiv: {
      padding: "5px",
      width: "50%"
    },
    refundAmount: {
      fontWeight: "bold",
      color: theme.palette.primary.main,
      marginLeft: "10px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
    },
    tHead: { borderCollapse: "collapse" },
    tableBody: {
      // overflowX: "auto"
    },
    tableHeader: {
      background: theme.palette.gray[1000],
      borderRadius: "6px 6px 0px 0px",
      height: "52px",
      color: theme.palette.gray[500],
      fontSize: "12px"
    },
    tableCell: {
      padding: "17px",
      // width: "150px",
      textAlign: "center"
    },

    tableCellSku: {
      maxWidth: "200px",
      minWidth: "100px"
    },
    row: {
      borderBottom: `0.5px solid ${theme.palette.gray[300]}`,
      "&:hover": {
        background: " #FFFFFF",
        boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.06)"
      }
    },
    iconCell: {
      display: "flex"
    }
  })
);

const AddReturnModal: React.FC<ModalInterface & { order: OrderData }> = props => {
  const classes = useStyles();
  const { order } = props;

  return (
    <div>
      <ModalPopUp
        maxWidth="md"
        modalTitle={props.title}
        openModal={props.openModal}
        handleCloseModal={props.handleCloseModal}
      >
        {order.products && order.products.length > 0 && (
          <table className={classes.table}>
            <thead className={classes.tHead}>
              <tr className={classes.tableHeader}>
                <th className={classes.tableCell}></th>
                <th className={classes.tableCell}>Product Number</th>
                <th className={classes.tableCell}>Product Name</th>
                <th className={classes.tableCell}>Qty Ordered</th>
                <th className={classes.tableCell}>Returned </th>
                <th className={classes.tableCell}>Current Qty</th>
                <th className={classes.tableCell}>Return</th>
                <th className={classes.tableCell}></th>
              </tr>
            </thead>
            {order?.products?.map((item, index) => (
              <ReturnEditableRow key={index} data={item} order={order} />
            ))}
          </table>
        )}
        <div className={classes.container}>
          <div className={classes.subConatiner}>
            <div className={classes.paidAmountDiv}>
              <span className={classes.paidAmount}>
                Paid Amount ${(order.paid_amount || 0).toFixed(2)}
              </span>
            </div>
            <div className={classes.refundAmountDiv}>
              <span className={classes.refundAmount}>
                Amount To Refund $
                {order.return_amount ? order.return_amount.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
        </div>
      </ModalPopUp>
    </div>
  );
};

export default AddReturnModal;

interface ProductReturnState {
  quantity: number;
  id: string;
}

interface ProductTableProps {
  readonly data: OrderProduct;
  order: OrderData;
}

const ReturnEditableRow: React.FC<ProductTableProps> = ({ data, order }) => {
  const classes = useStyles();
  const { mutate: addReturn, isLoading } = useAddOrderReturn(order?.id || "");
  const initialState = { quantity: 0, id: data.id || "" };
  const [state, setState] = React.useState<Partial<ProductReturnState>>(initialState);
  const handleDoneEditing = () => {
    addReturn({ product_id: state.id || "", quantity: state.quantity || 0 });
    setState(initialState);
  };
  const returnedQty =
    data?.order_product_return?.reduce(
      (totalsum, product) => product.return_shipment.quantity + totalsum,
      0
    ) || 0;
  return (
    <tbody>
      <tr>
        <td className={classes.tableCellSku}>
          <Avatar
            style={{ margin: "auto" }}
            variant="square"
            alt={`${get(data, "product.name")}`}
            src={get(data, "product.image", "")}
          />
        </td>
        <td className={classes.tableCell}>
          <div className={classes.productName}>{data?.product?.sku}</div>
        </td>
        <td className={classes.tableCell}>
          <div className={classes.productName}>{data?.product?.name}</div>
        </td>
        <td className={classes.tableCell}>{data?.quantity}</td>
        <td className={classes.tableCell}>{returnedQty}</td>
        <td className={classes.tableCell}>{(data?.quantity || 0) - returnedQty}</td>
        <>
          <td className={classes.tableCell}>
            <TextInput
              disabled={isLoading}
              name="shipped_quantity"
              margin="dense"
              type="number"
              value={state.quantity}
              variant="outlined"
              onChange={e => {
                const quantity = parseInt(e.target.value);
                if (
                  Number(quantity) >= 0 &&
                  Number((data?.quantity || 0) - returnedQty) >= quantity
                ) {
                  setState({ ...state, quantity: quantity });
                }
              }}
              style={{ width: "80%", margin: "auto" }}
            />
          </td>

          <td className={classes.tableCell}>
            <div className={classes.iconCell}>
              <Button
                loading={isLoading}
                icon={<MuiIcon fontSize="small" icon="check" />}
                onlyIcon={true}
                type="secondary"
                variant="outlined"
                onClick={handleDoneEditing}
                size="small"
                disabled={!data.is_fully_shipped}
              />
            </div>
          </td>
        </>
      </tr>
    </tbody>
  );
};
