export interface Show {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: number;
  date_modified: number;
  date_modified_gmt: number;
  type: string;
  status: string;
  featured: string;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: number;
  regular_price: number;
  sale_price: number;
  date_on_sale_from: null;
  date_on_sale_from_gmt: null;
  date_on_sale_to: null;
  date_on_sale_to_gmt: null;
  on_sale: true;
  purchasable: true;
  total_sales: number;
  virtual: false;
  downloadable: false;
  downloads: [];
  download_limit: number;
  download_expiry: number;
  external_url: "";
  button_text: "";
  tax_status: string;
  tax_class: "";
  manage_stock: false;
  stock_quantity: null;
  backorders: "no";
  backorders_allowed: false;
  backordered: false;
  low_stock_amount: null;
  sold_individually: false;
  weight: "";
  dimensions: Dimensions;
  shipping_required: true;
  shipping_taxable: true;
  shipping_class: "";
  shipping_class_id: number;
  reviews_allowed: true;
  average_rating: number;
  rating_count: 0;
  upsell_ids: [];
  cross_sell_ids: [];
  parent_id: 0;
  purchase_note: "";
  categories: ShowCategory[];
  tags: ShowTag[];
  meta_data: ShowMetaData[];
}

export interface Dimensions {
  length: "";
  width: "";
  height: "";
}

export interface ShowCategory {
  id: number;
  name: string;
  slug: string;
}
export interface ShowTag {
  id: number;
  name: string;
  slug: string;
}
export interface ShowMetaData {
  id: number;
  key: string;
  value: string;
}
