import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ModalInterface } from "Interfaces/ModalInterface";
import ModalPopUp from "Components/ModalPopup";
import { OrderData, OrderProduct, OrderProductShipping } from "Interfaces/Order";
import DatePicker from "Components/Form/Date";
import { Avatar } from "@mui/material";
import get from "lodash/get";
import Button from "Components/Button";
import { useAddOrderShipment, useEditOrderProductShipping } from "Hooks/useOrders";
import TextInput from "Components/Form/TextInput";
import MuiIcon from "Components/icons/MuiIcons";

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
    iconCell: {
      display: "flex"
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
    productNameSku: {
      maxWidth: "200px",
      lineHeight: "18px",
      color: theme.palette.primary.main,
      display: "flex",
      alignItems: "center"
    },
    tableCellSku: {
      maxWidth: "200px",
      minWidth: "100px",
      display: "flex",
      padding: "17px",
      textAlign: "center",
      alignItems: "center"
    },
    row: {
      borderBottom: `0.5px solid ${theme.palette.gray[300]}`,
      "&:hover": {
        background: " #FFFFFF",
        boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.06)"
      }
    },
    truncate: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      width: "100px",
      textOverflow: "ellipsis"
    }
  })
);

const AddShipments: React.FC<ModalInterface & { order: OrderData }> = props => {
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
                <th className={classes.tableCell}>Product Number</th>
                <th className={classes.tableCell}>Product Name</th>
                <th className={classes.tableCell}>Qty Ordered</th>
                <th className={classes.tableCell}>Shipped </th>
                <th className={classes.tableCell}>Date</th>
                <th className={classes.tableCell}></th>
              </tr>
            </thead>
            {order?.products?.map((item, index) => (
              <ShipmentEditableRow key={index} data={item} order={order} />
            ))}
          </table>
        )}
      </ModalPopUp>
    </div>
  );
};

export default AddShipments;

interface OrderProductState {
  quantity?: number;
  ship_date?: string;
  ordered_product_id: string;
}

interface ProductTableProps {
  readonly data: OrderProduct;
  order: OrderData;
}

const ShipmentEditableRow: React.FC<ProductTableProps> = ({ data, order }) => {
  const classes = useStyles();
  const [state, setState] = React.useState<Partial<OrderProductState>>({
    quantity: data.quantity || 0,
    ship_date: data.ship_date || "",
    ordered_product_id: data.product_id
  });

  const { mutate: addShipment, isLoading } = useAddOrderShipment(order?.id || "");
  const { mutate: editShipment, isLoading: isLoadingEditShipping } =
    useEditOrderProductShipping(order?.id || "");

  const handleDoneEditing = () => {
    const objectToSend: Partial<Record<keyof OrderProductState, string | number>> = {};
    (Object.keys(state) as Array<keyof OrderProductState>).forEach(key => {
      const value = state[key];
      if (Number(value) >= 0 && key === "quantity") {
        objectToSend[key] = state[key];
      }
      if (key === "ship_date") {
        objectToSend[key] = state[key]
          ? new Date(state[key] as string).toISOString()
          : new Date().toISOString();
      } else {
        objectToSend[key] = state[key];
      }
    });

    const alreadyInShipments = order?.product_shippings.find(
      shipping => shipping.ordered_product_id === data.id
    );
    if (alreadyInShipments) {
      editShipment({
        ordered_product_id: data.id,
        quantity: state.quantity,
        ship_date: state.ship_date,
        shipmentId: alreadyInShipments.id
      });
    } else {
      addShipment(objectToSend as Omit<OrderProductShipping, "id" | "created">);
    }
    setState({});
  };

  return state?.ordered_product_id === data?.id ? (
    <tbody>
      <tr>
        <td className={classes.tableCell}>
          <div className={classes.productNameSku}>
            <Avatar
              style={{ marginRight: 8 }}
              variant="square"
              alt={`${get(data, "product.name")}`}
              src={get(data, "product.image", "")}
            />
            &nbsp; {data?.product?.sku}
          </div>
        </td>
        <td className={classes.tableCell}>
          <div className={`${classes.truncate} ${classes.productName}`}>
            {data?.product?.name}
          </div>
        </td>
        <td className={classes.tableCell}>{data?.quantity}</td>
        <td className={classes.tableCell}>
          <TextInput
            name="shipped_quantity"
            margin="dense"
            type="number"
            value={state.quantity}
            variant="outlined"
            onChange={e => {
              const quantity = parseInt(e.target.value);
              if (Number(quantity) >= 0 && Number(data.quantity) >= quantity) {
                setState({ ...state, quantity: quantity });
              }
            }}
            style={{ width: "80%", margin: "auto" }}
          />
        </td>
        <td className={classes.tableCell}>
          <DatePicker
            onChange={(e: Date | null) => {
              if (e) setState({ ...state, ship_date: e.toISOString() });
            }}
            value={state.ship_date ? new Date(state.ship_date) : new Date()}
            label=""
          />
        </td>
        <td className={classes.tableCell}>
          <div className={classes.iconCell}>
            <Button
              icon={<MuiIcon fontSize="small" icon="check" />}
              onlyIcon={true}
              type="secondary"
              variant="outlined"
              onClick={handleDoneEditing}
              size="small"
            />{" "}
            &nbsp;&nbsp;
            <Button
              size="small"
              icon={<MuiIcon icon="cancel" />}
              onlyIcon={true}
              onClick={() => {
                setState({});
              }}
              type="secondary"
              variant="outlined"
            />{" "}
          </div>
        </td>
      </tr>
    </tbody>
  ) : (
    <tbody>
      <tr className={classes.row}>
        <td className={classes.tableCell}>
          <div className={classes.productNameSku}>
            <Avatar
              style={{ marginRight: 8 }}
              variant="square"
              alt={`${get(data, "product.name")}`}
              src={get(data, "product.image", "")}
            />
            &nbsp; {data?.product?.sku}
          </div>
        </td>
        <td className={classes.tableCell}>
          <div className={classes.productName}>{data?.product?.name}</div>
        </td>
        <td className={classes.tableCell}>{data?.quantity}</td>
        <td className={classes.tableCell}>{data?.shipped_quantity || 0}</td>
        <td className={classes.tableCell}>
          {data?.ship_date ? new Date(data?.ship_date).toLocaleDateString() : "--"}
        </td>
        <td className={classes.tableCell}>
          <div className={classes.iconCell}>
            <Button
              loading={isLoading || isLoadingEditShipping}
              icon={<MuiIcon fontSize="small" icon="edit" />}
              onlyIcon={true}
              onClick={() =>
                setState({
                  ordered_product_id: data.id,
                  quantity: data.shipped_quantity || 0,
                  ship_date: data.ship_date || ""
                })
              }
              type="secondary"
              variant="outlined"
              disabled={order.is_trash}
              size="small"
            />
          </div>
        </td>
      </tr>
    </tbody>
  );
};
