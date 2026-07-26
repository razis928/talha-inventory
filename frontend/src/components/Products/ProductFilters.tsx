import * as React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Grid from "@mui/material/Grid";
import CheckBox from "Components/CheckBox";
import Button from "Components/Button";
import TextInput from "Components/Form/TextInput";
import { useLocation, useSearchParams } from "react-router-dom";
import { productParamsGeneralKeys } from "Utils/queryParamKeys";

const queryParamsKeys = [...productParamsGeneralKeys];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      padding: "20px 20px 0px 20px"
    },
    heading: {
      fontSize: "21px"
    },
    container: {
      widht: "100%",
      background: theme.palette.gray[100],
      borderRadius: "6px",
      marginTop: "20px"
    },
    searchHeading: {
      fontSize: "14px"
    },
    formBody: {
      padding: "0px 20px"
    },
    headerButton: {
      display: "flex",
      justifyContent: "flex-end"
    },
    checkboxes: {
      padding: "0px 10px"
    },
    checkboxText: {
      fontSize: "12px",
      color: theme.palette.text.secondary
    }
  })
);
interface Props {
  hasHeader?: boolean;
}

const checkFilters = [
  { name: "stock_products", label: "Show In Stock Products Only" },
  { name: "discontinued_products", label: "Show Discontinued Products" },
  { name: "saas_products", label: "Show SaaS Products Only" },
  { name: "sold_as_subscription", label: "Show Products Sold as Subscription" }
] as const;

const ProductFilters: React.FC<Props> = ({ hasHeader = true }) => {
  const classes = useStyles();
  const { pathname } = useLocation();
  const [showFilters, setShowFilters] = React.useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Event handlers
  // This function stores the input values inside query parameters
  const handleChange = ({ key, value }: { key: string; value: string }) => {
    const newParams = new URLSearchParams(searchParams);
    value ? newParams.set(key, value) : newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: key, value } = event.currentTarget;
    handleChange({ key, value });
  };

  React.useEffect(() => {
    const initialParams = new URLSearchParams(searchParams);
    // If it's the trash page, also add is_trash to the query params
    ["/trash", "/trash/"].includes(pathname)
      ? initialParams.set("is_trash", "1")
      : initialParams.delete("is_trash");
    setSearchParams(initialParams);
    //eslint-disable-next-line
  }, [pathname]);

  const header = hasHeader && (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      className={classes.header}
    >
      <Grid item lg={3} xs={6}>
        <h5 className={classes.searchHeading}>Search</h5>
      </Grid>
      <Grid item lg={4} xs={6}>
        <div className={classes.headerButton}>
          <Button
            disabled={!showFilters}
            text="Reset"
            type="secondary"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              queryParamsKeys.forEach(key => params.delete(key));
              setSearchParams(params);
            }}
          />
          &nbsp;
          <Button
            onClick={() => setShowFilters(!showFilters)}
            text={showFilters ? "Hide" : "Show"}
            type="secondary"
          />
        </div>
      </Grid>
    </Grid>
  );

  return (
    <>
      <div className={classes.container}>
        {header}
        {showFilters && (
          <>
            <Grid
              container
              spacing={1}
              direction="row"
              justifyContent="space-between"
              className={classes.formBody}
            >
              <Grid lg={4} xs={12} item>
                <TextInput
                  name="sku"
                  value={searchParams.get("sku") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Product Number"
                />
              </Grid>
              <Grid lg={4} xs={12} item>
                <TextInput
                  name="name"
                  value={searchParams.get("name") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Product Name"
                />
              </Grid>
              <Grid lg={4} xs={12} item>
                <TextInput
                  name="supplier"
                  value={searchParams.get("supplier") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Supplier"
                  disabled
                />
              </Grid>
              <Grid lg={8} xs={12} item>
                <TextInput
                  name="description"
                  value={searchParams.get("description") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Long Description"
                  disabled
                />
              </Grid>
              <Grid lg={4} xs={12} item>
                <TextInput
                  name="tax_class"
                  value={searchParams.get("tax_class") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Tax Class"
                  disabled
                />
              </Grid>
              <Grid lg={8} xs={12} item>
                <TextInput
                  name="tags"
                  value={searchParams.get("tags") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Tags"
                  disabled
                />
              </Grid>
              <Grid lg={4} xs={12} item>
                <TextInput
                  name="category"
                  value={searchParams.get("category") || ""}
                  onChange={handleTextChange}
                  margin="dense"
                  variant="outlined"
                  type="text"
                  label="Category"
                  disabled
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={1}
              direction="row"
              justifyContent="space-between"
              className={classes.checkboxes}
            >
              {checkFilters.map(({ name, label }, index) => (
                <Grid lg={3} xs={12} item key={`${name}-${index}`}>
                  <CheckBox
                    name={name}
                    disabled
                    checked={!!searchParams.get(name)}
                    handleChange={e => {
                      handleChange({
                        key: e.target.name,
                        value: e.target.checked ? "1" : ""
                      });
                    }}
                  />
                  <span className={classes.checkboxText}>{label}</span>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </div>
    </>
  );
};

export default ProductFilters;
