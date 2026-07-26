import * as React from "react";
import Grid from "@mui/material/Grid";
import Chip from "@material-ui/core/Chip";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import DataTable from "../DataTable/Table";
import Button from "../Button";
import MuiIcon from "../icons/MuiIcons";
import AddShipmentModal from "../Modals/AddShipments";
import { useModal } from "Hooks/useModal";
import { EmptyData } from "../icons/EmptyData";
import { Avatar } from "@mui/material";
import get from "lodash/get";
import { OrderData } from "Interfaces/Order";

interface Shipped {
  image?: string;
  sku: string;
  name: string;
  quantityOrdered: number;
  quantityShipped: number;
  shippingCost: number;
  date: string;
  status: "Shipped" | "Not Shipped" | "Partially Shipped";
}

interface ColumnsProps {
  readonly name: string;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly selector: (row: Shipped) => string | React.ReactNode | undefined;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chip: {
      marginTop: "6px",
      border: `1px solid ${theme.palette.green.success}`,
      color: theme.palette.green.success,
      background: theme.palette.green.successBg
    },
    imgDiv: {
      display: "flex",
      textAlign: "center",
      color: "red"
    },
    productNameSku: {
      maxWidth: "200px",
      lineHeight: "18px",
      color: theme.palette.primary.main,
      display: "flex",
      alignItems: "center"
    }
  })
);

interface Props {
  order: OrderData;
}
const ShipmentHistory: React.FC<Props> = ({ order }) => {
  const classes = useStyles();
  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({
    onSave: () => null
  });

  const shippedProducts = React.useMemo(() => {
    if (order?.product_shippings?.length > 0 && order?.products?.length) {
      const filteredProducts: Shipped[] = order.product_shippings.map(shipment => {
        const orderProduct = order?.products?.find(
          o => shipment.ordered_product_id === o.id
        );
        return {
          image: orderProduct?.product?.image,
          sku: orderProduct?.sku || "",
          name: orderProduct?.product?.name || "",
          shippingCost: orderProduct?.shipping_cost || 0,
          quantityOrdered: orderProduct?.quantity || 0,
          quantityShipped: shipment.quantity,
          date: shipment.ship_date
            ? new Date(shipment.ship_date).toLocaleDateString()
            : "",
          status:
            shipment.quantity === orderProduct?.quantity &&
            shipment.ship_date &&
            new Date(shipment.ship_date) < new Date()
              ? "Shipped"
              : shipment.quantity < (orderProduct?.quantity || 1) &&
                shipment.ship_date &&
                new Date(shipment.ship_date) < new Date()
              ? "Partially Shipped"
              : "Not Shipped"
        };
      });

      return filteredProducts;
    }
    return [];
  }, [order?.product_shippings, order?.products]);

  const columns: ColumnsProps[] = [
    {
      name: "Product Number",
      selector: row => (
        <div className={classes.productNameSku}>
          <Avatar
            style={{ marginRight: 8 }}
            variant="square"
            alt={`${get(row, "name")}`}
            src={get(row, "image", "")}
          />
          &nbsp; {row.sku}
        </div>
      )
    },
    {
      name: "Product Name",
      selector: row => <p className={classes.productNameSku}>{row.name || "--"}</p>
    },
    {
      name: "Qty Ordered",
      selector: row => `${row.quantityOrdered}`
    },
    {
      name: "Shipped",
      selector: row => row.quantityShipped
    },
    {
      name: "Shipping Cost",
      selector: row => `$${row.shippingCost.toFixed(2)}`
    },
    {
      name: "Date",
      selector: row => row.date
    },
    {
      name: "Status",
      selector: row => <Chip className={classes.chip} label={row.status} />
    }
  ];

  return (
    <div id="shipments">
      <h2>Shipment History</h2>
      <AddShipmentModal
        saveText="Update Shipments"
        title={`${order?.product_shippings?.length > 0 ? "Edit" : "Add"} Shipments`}
        handleSaveChanges={handleSave}
        handleCloseModal={handleModalClose}
        openModal={modalOpen}
        order={order}
      />
      {shippedProducts.length ? (
        <DataTable
          tableStyles={{
            width: "calc(100vw - 320px)"
          }}
          columns={columns}
          data={shippedProducts}
        />
      ) : (
        <div style={{ width: "40%", marginLeft: "40%" }}>
          <EmptyData height={100} />
          <p>No shipments added yet</p>
        </div>
      )}
      <br />
      <Grid container>
        <Grid lg={2} xs={6} item>
          <Button
            text={`${order?.product_shippings?.length ? "Edit" : "Add"} Shipments`}
            type="secondary"
            icon={<MuiIcon icon="add" />}
            onClick={() => handleModalOpen()}
            disabled={!order.products?.length || order.is_trash}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default ShipmentHistory;
