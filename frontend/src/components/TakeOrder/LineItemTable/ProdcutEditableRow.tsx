import * as React from "react";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { Avatar } from "@mui/material";
import TextInput from "../../Form/TextInput";
import Button from "../../Button";
import MuiIcon from "../../icons/MuiIcons";
import { OrderData, OrderProduct } from "Interfaces/Order";
import { useDeleteOrderProduct, useEditOrderProduct } from "Hooks/useOrders";
import DatePicker from "../../Form/Date";
import get from "lodash/get";
import { useVoidStickySubscription } from "Hooks/useSubscriptions";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tb: {
      border: "1px solid red"
    },
    row: {
      borderBottom: `0.5px solid ${theme.palette.gray[300]}`,
      "&:hover": {
        background: " #FFFFFF",
        boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.06)"
      }
    },
    dBlock: {
      display: "block"
    },
    tableCell: {
      width: "150px",
      textAlign: "center"
    },
    productName: {
      minWidth: "200px",
      lineHeight: "18px",
      color: theme.palette.primary.main
    },
    iconCell: {
      display: "flex"
    },
    productNameSku: {
      maxWidth: "200px",
      lineHeight: "18px",
      color: theme.palette.primary.main,
      display: "flex",
      alignItems: "center"
    },
    tableCellSku: {
      padding: "17px",
      width: "200px",
      textAlign: "left"
    },
    inputSelect: {
      minWidth: "150px"
    },
    flexAlign: {
      display: "flex",
      alignItems: "center",
      border: `1px solid ${theme.palette.green.success}`,
      color: theme.palette.green.success,
      background: theme.palette.green.successBg,
      minWidth: "120px",
      maxHeight: "50px",
      borderRadius: "6px",
      padding: "10px"
    },
    shipText: {
      margin: "0px"
    },
    shipIcon: {
      marginRight: "10px"
    }
  })
);

interface OrderProductState {
  quantity: number;
  unit_price: number;
  shipping_cost: number;
  tax_rate: number;
  ship_date?: string;
  product_id: string;
}

interface ProductTableProps {
  readonly data: OrderProduct;
  order: OrderData;
}

const ProdcutEditableRow: React.FC<ProductTableProps> = ({ data, order }) => {
  const classes = useStyles();
  const { mutate: VoidSubscription, isLoading: isLoadingVoidSubscription } =
    useVoidStickySubscription(data.id, order.id);
  const [state, setState] = React.useState<Partial<OrderProductState>>({
    quantity: data.quantity || 1,
    unit_price: data.unit_price || 0,
    shipping_cost: data.shipping_cost || 0,
    tax_rate: data.tax_rate || 0,
    ship_date: data.ship_date || "",
    product_id: ""
  });

  const { mutate, isLoading } = useEditOrderProduct(order?.id, state?.product_id);
  const { mutate: deleteProduct, isLoading: deleteIsLoading } = useDeleteOrderProduct(
    order?.id || ""
  );

  const handleDeleteLineItems = (id: string) => {
    if (data.sku === "SW" || data.sku === "GP" || data.sku === "ENT") {
      VoidSubscription();
    } else {
      deleteProduct({ product_id: id });
    }
  };

  const handleChangeQuantity = (quantity: string) => {
    if (quantity ? Number(quantity) >= 0 : !quantity) {
      setState({ ...state, quantity: Number.parseInt(quantity) });
    }
  };
  const handleChangeShippingDate = (date: Date | null) => {
    if (date) setState({ ...state, ship_date: date.toISOString() });
  };

  const handleChangePrice = (value: string, field: string) => {
    if (
      (field === "unit_price" || field === "shipping_cost") &&
      (value ? Number(value) >= 0 : !value)
    ) {
      setState({ ...state, [field]: Number.parseFloat(value) });
    }

    if (
      field === "tax_rate" &&
      (value ? Number(value) >= 0 && Number(value) < 100 : !value)
    ) {
      setState({ ...state, [field]: Number.parseFloat(value) });
    }
  };

  const handleDoneEditing = () => {
    const objectToSend: Partial<Record<keyof OrderProductState, string | number>> = {};
    (Object.keys(state) as Array<keyof OrderProductState>).forEach(key => {
      const value = state[key];
      const prevValue = data[key];

      if (value !== null && value !== undefined && prevValue !== value) {
        if (Number(value) >= 0 && (key === "unit_price" || key === "shipping_cost")) {
          objectToSend[key] = state[key];
        } else if (value && key !== "product_id") {
          if (key === "ship_date") {
            objectToSend[key] = new Date(state[key] as string).toISOString();
          } else {
            objectToSend[key] = state[key];
          }
        }
      }
    });

    mutate(objectToSend as Partial<OrderProduct>);
    setState({});
  };

  return state?.product_id === data?.id ? (
    <tbody>
      <tr>
        <td className={classes.tableCellSku}>
          <div className={classes.productNameSku}>
            <Avatar
              style={{ marginRight: 8 }}
              variant="square"
              alt={`${get(data, "product.name")}`}
              src={get(data, "product.image", "")}
            />
            <p>
              <span className={classes.dBlock}>&nbsp; {data?.product?.sku}</span>
              <span className={classes.dBlock}>
                <strong>Directions:</strong>{" "}
              </span>
            </p>
            {/* &nbsp; {data?.product?.sku} */}
          </div>
        </td>
        <td className={classes.tableCell}>
          <div className={classes.productName}>{data?.product?.name}</div>
        </td>
        <td>
          <TextInput
            name="product_quantity"
            margin="dense"
            type="number"
            value={state?.quantity || 0}
            variant="outlined"
            onChange={e => handleChangeQuantity(e.target.value)}
            style={{ width: "80%", margin: "auto" }}
          />
        </td>
        <td className={classes.tableCell}>
          <TextInput
            name="retail_price"
            margin="dense"
            type="number"
            value={state.unit_price || 0}
            variant="outlined"
            onChange={e => handleChangePrice(e.target.value, "unit_price")}
            style={{ width: "80%", margin: "auto" }}
          />
        </td>
        <td className={classes.tableCell}>
          <TextInput
            name="shipping_rate"
            margin="dense"
            type="number"
            value={state?.shipping_cost || 0}
            variant="outlined"
            onChange={e => handleChangePrice(e.target.value, "shipping_cost")}
            style={{ width: "80%", margin: "auto" }}
          />
        </td>
        <td className={classes.tableCell}>{data?.product?.is_saas ? "Yes" : "No"}</td>
        <td className={classes.tableCell}>
          {data?.product?.is_tax_exempt ? "Yes" : "No"}
        </td>
        <td className={classes.tableCell}>
          <TextInput
            name="tax_rate"
            margin="dense"
            type="number"
            value={state?.tax_rate || 0}
            variant="outlined"
            onChange={e => handleChangePrice(e.target.value, "tax_rate")}
            style={{ width: "80%", margin: "auto" }}
          />
        </td>
        <td className={classes.tableCell}>
          <DatePicker
            onChange={handleChangeShippingDate}
            disabled
            value={state.ship_date ? new Date(state.ship_date) : null}
            label=""
          />
        </td>
        <td className={classes.tableCell}>${(data?.total_cost || 0).toFixed(2)}</td>
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
        <td className={classes.tableCellSku}>
          <div className={classes.productNameSku}>
            <Avatar
              style={{ marginRight: 8 }}
              variant="square"
              alt={get(data, "product.name", "Product Image")}
              src={get(data, "product.image", "")}
            />
            <p>
              <span className={classes.dBlock}>&nbsp; {data?.product?.sku}</span>
              <span
                className={classes.dBlock}
                style={{
                  color: "#121212"
                }}
              >
                {" "}
                &nbsp; <strong>Directions:</strong>{" "}
              </span>
            </p>
            {/* {data?.product?.sku} */}
          </div>
        </td>
        <td className={classes.tableCell}>
          <div className={classes.productName}>{data?.product?.name}</div>
        </td>
        <td className={classes.tableCell}>{data?.quantity || "--"}</td>
        <td className={classes.tableCell}>${(data?.unit_price || 0).toFixed(2)}</td>
        <td className={classes.tableCell}>${(data?.shipping_cost || 0).toFixed(2)}</td>
        <td className={classes.tableCell}>{data?.product?.is_saas ? "Yes" : "No"}</td>
        <td className={classes.tableCell}>
          {data?.product?.is_tax_exempt ? "Yes" : "No"}
        </td>
        <td className={classes.tableCell}>{(data?.tax_rate || 0).toFixed(2)}%</td>
        <td className={classes.tableCell}>
          {data?.ship_date ? new Date(data?.ship_date).toLocaleDateString() : "--"}
        </td>
        <td className={classes.tableCell}>${(data?.total_cost || 0).toFixed(2)}</td>
        <td className={classes.tableCell}>
          <div className={classes.iconCell}>
            <Button
              loading={isLoading}
              icon={<MuiIcon fontSize="small" icon="edit" />}
              onlyIcon={true}
              onClick={() =>
                setState({
                  quantity: data.quantity || 1,
                  unit_price: data.unit_price || 0,
                  ship_date: data.ship_date || "",
                  shipping_cost: data.shipping_cost || 0,
                  product_id: data.id
                })
              }
              type="secondary"
              variant="outlined"
              disabled={order.is_trash || deleteIsLoading}
              size="small"
            />
            &nbsp;&nbsp;
            <Button
              loading={deleteIsLoading || isLoadingVoidSubscription}
              size="small"
              icon={<MuiIcon fontSize="small" icon="delete" />}
              onlyIcon={true}
              onClick={() => handleDeleteLineItems(data?.id || "")}
              type="secondary"
              variant="outlined"
              disabled={order.is_trash || isLoading}
            />
          </div>
        </td>
      </tr>
    </tbody>
  );
};

export default ProdcutEditableRow;
