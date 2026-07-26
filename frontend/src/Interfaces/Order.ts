import { Address, CompanyData } from "./Company";
import { ProductData } from "./Products";

export interface OrderProduct {
  is_fully_shipped: boolean;
  ship_date?: string;
  tax_rate?: number;
  sub_total_tax?: number;
  total_cost: number;
  taxes?: number;
  id: string;
  quantity: number;
  shipped_quantity: number;
  product_id: string;
  was_returned?: boolean;
  unit_price: number;
  shipping_cost?: number;
  sub_total?: number;
  order_product_return: OrderProductReturn[];
  sku?: string;
  product?: ProductData;
  was_refunded?: boolean;
}

export type OrderProductReturn = {
  brand_id: string;
  company_id: string;
  created: string;
  ordered_product_id: string;
  product_id: string;
  return_shipment: OrderProductReturnShipment;
  shipping_class_id: string;
  user_id: string;
};

export type OrderNote = {
  type: string;
  updated?: string;
  created: string;
  id: string;
  text: string;
};

export interface PaymentData {
  type: string;
  recurring: boolean;
  receipt: string;
  non_recurring: boolean;
  pending_refund: number;
  created: string;
  total: number;
  is_refunded: boolean;
  id: string;
  status: string;
  updated: string;
  payment_provider: string;
  order_id: string;
  user: {
    created: string;
    date_joined: string;
    email: string;
    first_name: string;
    id: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_login: string;
    last_name: string;
    middle_name: string;
    mobile_phone: string;
    office_phone: string;
    type: string;
    updated: string;
    username: string;
  };
}

export type OrderCategory = "order" | "standing" | "quote";
export interface OrderData {
  id: string;
  company_id: string;
  company: CompanyData;
  category: OrderCategory;
  brand_id: string;
  created: string;
  contact_id: string;
  ship_date?: string;
  currency: string;
  discount_tax: null;
  customer_ip_addr: null;
  prices_include_tax: null;
  updated: string;
  cart_tax: null;
  has_custom_tax_rate: boolean;
  custom_tax_percentage: number;
  sales_tax: number;
  shipping_cost: number;
  discount_total: null;
  status: string;
  total_amount: number;
  customer_user_agent: null;
  is_trash: boolean;
  number: string;
  order_refunds: OrderRefund[];
  products?: OrderProduct[];
  product_shippings: OrderProductShipping[];
  notes?: OrderNote[];
  due_amount: number;
  recurring_payment: number;
  non_recurring_payment: number;
  sub_total: number;
  paid_amount?: number;
  source: string;
  is_custom_shipping: boolean;
  ordered: string;
  payments: PaymentData[];
  is_standing_order: boolean;
  payment_status?: string;
  return_amount: number;
  shipping_status?: string;
  billing_address: Address;
  shipping_address: Address;
}

export interface OrderShipmentResponse {
  results: OrderProductShipping[];
  readonly page?: number;
  readonly count?: number;
  readonly total?: number;
  readonly pages?: number;
}
export interface OrderResponse {
  readonly results: Array<OrderData>;
  readonly page?: number;
  readonly count?: number;
  readonly total?: number;
  readonly pages?: number;
}

export interface OrderProductShipping {
  id: string;
  created: string;
  updated?: string;
  ship_date?: string;
  carrier?: string;
  tracking?: string;
  weight?: number;
  shipping_type?: string;
  ordered_product_id: string;
  total?: number;
  total_tax?: number;
  quantity: number;
}

export interface OrderProductReturnShipmentResponse {
  results: OrderProductReturnShipment[];
  readonly page?: number;
  readonly count?: number;
  readonly total?: number;
  readonly pages?: number;
}

export interface OrderProductReturnShipment {
  description: string;
  dimension_length: number;
  weight: number;
  carrier: string;
  delivery_speed: number;
  dimension_width: number;
  dimension_height: number;
  cost: number;
  quantity: number;
}

export interface OrderRefundResponse {
  results: OrderRefund[];
  readonly page?: number;
  readonly count?: number;
  readonly total?: number;
  readonly pages?: number;
}

export interface OrderRefund {
  user_id: string;
  brand_id: string;
  company_id: string;
  created?: string;
  order_id: string;
  product_id?: string;
  order_payment_id?: string;
  ordered_product_id?: string;
  payment_provider: string;
  total: number;
  total_tax?: number;
  total_shipping?: number;
  quantity?: number;
  sku?: string;
  external_id?: string;
  reason?: string;
  receipt?: string;
  status?: string;
}
export interface BulkShipment {
  sku_list: Array<string>;
  start_date: string;
  end_date: string;
  ship_date: string;
}
