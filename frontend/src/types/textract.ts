export interface ExtractedLineItems {
  PRODUCT_CODE?: string;
  ITEM?: string;
  QUANTITY?: string;
  UNIT_PRICE?: string;
  PRICE?: string;
}

export interface ExtractedKeys {
  INVOICE_RECEIPT_DATE: string;
  INVOICE_RECEIPT_ID: string;
  TAX_PAYER_ID: string;
  CUSTOMER_NUMBER: string;
  ACCOUNT_NUMBER: string;
  VENDOR_NAME: string;
  RECEIVER_NAME: string;
  VENDOR_ADDRESS: string;
  RECEIVER_ADDRESS: string;
  ORDER_DATE: string;
  DUE_DATE: string;
  DELIVERY_DATE: string;
  PO_NUMBER: string;
  PAYMENT_TERMS: string;
  TOTAL: string;
  AMOUNT_DUE: string;
  AMOUNT_PAID: string;
  SUBTOTAL: string;
  TAX: string;
  SERVICE_CHARGE: string;
  DISCOUNT: string;
  STATE: string;
  CITY: string;
  ZIP_CODE: string;
  COUNTRY: string;
  RECEIVER_PHONE: string;
  VENDOR_PHONE: string;
  LINE_ITEMS: ExtractedLineItems[];
}
