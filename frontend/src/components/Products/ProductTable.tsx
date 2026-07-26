import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import Switch from "Components/Switch";
import { ProductsResponse, ProductData } from "Interfaces/Products";
import DataTable from "Components/DataTable/Table";
import Button from "Components/Button";
import IconButton from "@material-ui/core/IconButton";
import ProductInStockModal from "./ProductStockModal";
import { useModal } from "Hooks/useModal";
import ConfrimationModal from "./ConfirmationModal";
import get from "lodash/get";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import Prompt from "Components/Prompt";
import { useAddDiscountCSV, useRestoreProduct, useTrashProduct } from "Hooks/useProducts";
import MuiIcon from "Components/icons/MuiIcons";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ColumnsProps {
  readonly name: string;
  readonly selector?: (row: ProductData) => string | React.ReactNode | undefined;
  readonly sortable?: boolean;
  readonly cell?: (row: ProductData) => JSX.Element;
  readonly width?: string;
}

interface Props {
  products: ProductsResponse | undefined;
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
    }
  })
);

const ProductTable: React.FC<Props> = ({ products, isLoading }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({
    onSave: () => null
  });
  const confirmationModal = useModal();
  const [selectedProduct, setSelectedProduct] = React.useState<ProductData | undefined>();
  const [selectedRows, setSelectedRows] = React.useState<ProductData[]>([]);
  const [productToDelete, setProductToDelete] = React.useState<{
    id: string;
    sku: string;
    is_trash: boolean;
  }>();
  const [showWarning, setShowWarning] = React.useState(false);
  const { mutateAsync: trashProduct } = useTrashProduct();
  const { mutateAsync: restoreProduct } = useRestoreProduct();
  const inputFile = React.useRef<HTMLInputElement>(null);
  const { mutate: addDiscountCSV, isLoading: addDiscountCSVIsLoading } =
    useAddDiscountCSV();

  const pagination = {
    page: (products?.page || 1).toString(),
    rowsPerPage: (products?.count || 100).toString(),
    pages: (products?.pages || 1).toString(),
    total: (products?.total || 0).toString()
  };

  const handleChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    // If the value of a query param is empty string, delete it from URL
    value ? newParams.set(key, value) : newParams.delete(key);
    setSearchParams(newParams);
  };

  const handlePageChange = (p: number) => {
    handleChange("page", `${p}`);
  };
  const handleRowChange = (c: number) => {
    handleChange("count", `${c}`);
  };

  const handleRowClicked = (id: string) => {
    navigate(`/products/edit/${id}`);
  };

  const handleRowSelection = ({
    selectedRows
  }: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: ProductData[];
  }) => {
    setSelectedRows(selectedRows);
  };

  const columns: ColumnsProps[] = [
    {
      name: "Product Number",
      selector: row => `${row?.id}`,
      cell: row => <p className={classes.redField}>{row?.sku}</p>,
      sortable: true
    },
    {
      name: "Product Name",
      selector: row => `${get(row, "name", "")}`,
      sortable: true
    },

    {
      name: "Status",
      selector: row => row?.status,
      cell: row => (
        <p className={classes.greyField}>
          {get(row, "status", "")?.split("_").join(" ").toUpperCase()}
        </p>
      ),
      sortable: true
    },
    {
      name: "Price",
      selector: row => row?.retail_price,
      cell: row => (
        <p className={classes.greyField}>${(row?.retail_price || 0).toFixed(2)}</p>
      ),
      sortable: true
    },
    {
      name: "Active",
      selector: row => row?.status,
      cell: row => (
        <Switch
          checked={row.status === "in_stock"}
          onChange={() => {
            setSelectedProduct(row);
            confirmationModal.handleModalOpen();
          }}
          disabled
        />
      ),
      sortable: true
    },
    {
      name: "",
      selector: row => {
        return (
          <IconButton
            aria-label={`Delete product ${get(row, "sku", "")}`}
            aria-controls="long-menu"
            aria-haspopup="true"
            onClick={() => {
              setProductToDelete({ id: row.id, sku: row.sku, is_trash: row.is_trash });
              setShowWarning(true);
            }}
          >
            {row.is_trash ? <RestoreIcon /> : <DeleteIcon color="error" />}
          </IconButton>
        );
      }
    }
  ];

  return (
    <div>
      <Prompt
        openModal={showWarning}
        title="Delete Product"
        promptMsg={`This will trash the product number ${productToDelete?.sku}.`}
        onProceed={async () => {
          productToDelete?.is_trash
            ? await restoreProduct({ productId: get(productToDelete, "id") })
            : await trashProduct({ productId: get(productToDelete, "id") });
          setShowWarning(false);
        }}
        onCancel={() => setShowWarning(false)}
      />
      <ProductInStockModal
        saveText="Confirm"
        handleSaveChanges={handleSave}
        handleCloseModal={handleModalClose}
        openModal={modalOpen}
      />
      <ConfrimationModal
        saveText="Confirm"
        handleCloseModal={confirmationModal.handleModalClose}
        handleSaveChanges={confirmationModal.handleSave}
        openModal={confirmationModal.modalOpen}
        confirmationMessage={`Are you sure you want to ${
          selectedProduct?.status ? "activate" : "deactivate"
        }`}
      />

      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item sm={12} lg={6}>
          {Boolean(selectedRows.length) && (
            <div className={classes.flex}>
              <span className={classes.redField}>({selectedRows.length} selected)</span>
            </div>
          )}
        </Grid>
        <Grid item sm={12} lg={6} justifyContent="right">
          <div className={classes.flex} style={{ justifyContent: "right" }}>
            {Boolean(selectedRows.length) && (
              <>
                <Button
                  text="Bulk Mark In-Stock"
                  type="secondary"
                  onClick={handleModalOpen}
                  disabled={true}
                />
                &nbsp;&nbsp;
                <Button text="Bulk Discontinued" type="secondary" />
              </>
            )}
            <input
              type="file"
              accept=".csv"
              ref={inputFile}
              style={{ display: "none" }}
              onChange={e => {
                const files = e.target.files;
                if (files) {
                  addDiscountCSV(files[0]);
                  e.target.value = "";
                }
              }}
            />
            &nbsp;&nbsp;
            <Button
              text="Upload CSV"
              type="secondary"
              icon={<MuiIcon icon="add" />}
              onClick={() => {
                if (inputFile.current) inputFile.current.click();
              }}
              loading={addDiscountCSVIsLoading}
            />
          </div>
        </Grid>
      </Grid>
      <br />
      <DataTable
        selectableRows={true}
        columns={columns}
        data={products?.results}
        showPagination
        loading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowChange={handleRowChange}
        onRowSelection={handleRowSelection}
        onRowClicked={({ id }) => {
          handleRowClicked(id);
        }}
      />
    </div>
  );
};

export default ProductTable;
