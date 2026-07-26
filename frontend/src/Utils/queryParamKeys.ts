// These are the query param keys that will be used in the URL on the customers/Take Order page
export const customerParamsGeneralKeys = ["name", "number", "search"];
// The search Params related to billing and shipping contact are in the form of
// billing_contact__{key} and shipping_contact__{key}
// on the customer page we don't store the prefixes (billing_contact__ and shipping_contact__) to make the URL a little shorter
// These keys help us convert the search params from key=value to billing_contact__{key}=value
// and shipping_contact__{key}=value when sending them to the backend
export const customerParamsContactKeys = [
  "email",
  "first_name",
  "last_name",
  "phone",
  "street1",
  "street2",
  "city",
  "state",
  "zip"
];
// Orders related Query Param Keys
export const orderParamsGeneralKeys = [
  "number",
  "sku",
  "ordered__from",
  "ordered__to",
  "payment_status",
  "shipment_status"
];
// Customer related Query Params in Order search
export const orderCompanyParamKeys = ["company__name", "company__number"];
// Billing and shipping related keys
export const orderBillingShippingParamKeys = ["email", "city", "state", "zip", "street1"];
// Products related Query Param Keys
export const productParamsGeneralKeys = [
  "sku",
  "name",
  "supplier",
  "description",
  "tax_class",
  "tags",
  "category"
];

// Brands related Query Param Keys
export const brandParamsGeneralKeys = ["name", "email", "organization"];

// Vendors related Query Param Keys
export const vendorsParamsGeneralKeys = [
  "name",
  "contact_name",
  "city",
  "post_code",
  "region",
  "country",
  "contact_phone",
  "fax",
  "email",
  "webpage",
  "currency"
];

// Warehouses related Query Param Keys
export const warehouseParamsGeneralKeys = [
  "vendorName",
  "city",
  "post_code",
  "region",
  "country"
];

// Purchase related Query Param Keys
export const purchaseOrderParamsGeneralKeys = [
  "reference_number",
  "status",
  "supplier_reference",
  "location",
  "expected_date",
  "order_date"
];
