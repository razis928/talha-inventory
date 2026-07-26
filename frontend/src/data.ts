/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem, PurchaseOrder, Vendor, TimelineActivity } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Gandolla Premium',
    sku: 'GAN-D-001',
    category: 'Ink',
    location: 'East Wing, Rack A2',
    stockLevel: 450,
    maxStock: 600,
    unitPrice: 320,
  },
  {
    id: 'inv-2',
    name: 'Flex 340 G',
    sku: 'FLX-340-G',
    category: 'Glue',
    location: 'North Storage, Bin 12',
    stockLevel: 12,
    maxStock: 48,
    unitPrice: 85,
  },
  {
    id: 'inv-3',
    name: 'Cligate Ultra',
    sku: 'CLG-ULT-44',
    category: 'Cligate',
    location: 'Central Hub, Zone D',
    stockLevel: 0,
    maxStock: 100,
    unitPrice: 140,
  },
  {
    id: 'inv-4',
    name: 'Dory Varnish',
    sku: 'DRY-VAR-09',
    category: 'Dory',
    location: 'East Wing, Rack B1',
    stockLevel: 1200,
    maxStock: 1200,
    unitPrice: 190,
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2023-0892',
    vendorName: 'SteelNet Manufacturing',
    vendorLogoCode: 'SN',
    vendorCategory: 'Tier 1 Supplier',
    totalAmount: 12450.00,
    deliveryDate: '2023-10-24',
    status: 'Pending',
  },
  {
    id: 'po-2',
    poNumber: 'PO-2023-0891',
    vendorName: 'TechPolymer Solutions',
    vendorLogoCode: 'TP',
    vendorCategory: 'Electronics Vendor',
    totalAmount: 4820.00,
    deliveryDate: '2023-10-22',
    status: 'Approved',
  },
  {
    id: 'po-3',
    poNumber: 'PO-2023-0890',
    vendorName: 'Apex Gears & Co.',
    vendorLogoCode: 'AG',
    vendorCategory: 'Parts Manufacturer',
    totalAmount: 28900.00,
    deliveryDate: '2023-10-18',
    status: 'Received',
  },
  {
    id: 'po-4',
    poNumber: 'PO-2023-0889',
    vendorName: 'Industrial Logistics Ltd',
    vendorLogoCode: 'IL',
    vendorCategory: 'Shipping Partner',
    totalAmount: 1200.00,
    deliveryDate: '2023-10-15',
    status: 'Received',
  },
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v-1',
    name: 'Starlight Chemicals',
    code: 'SC',
    leadTime: '2.4 Days',
    qualityScore: 4.9,
    onTimeDelivery: 98.5,
    totalValue: 142500,
    status: 'PREFERRED',
  },
  {
    id: 'v-2',
    name: 'Bulk Pack Solutions',
    code: 'BP',
    leadTime: '5.1 Days',
    qualityScore: 4.2,
    onTimeDelivery: 91.2,
    totalValue: 89200,
    status: 'STANDARD',
  },
  {
    id: 'v-3',
    name: 'MetalTech Corp',
    code: 'MT',
    leadTime: '9.8 Days',
    qualityScore: 3.1,
    onTimeDelivery: 76.4,
    totalValue: 34100,
    status: 'UNDER REVIEW',
  },
];

export const INITIAL_TIMELINE: TimelineActivity[] = [
  {
    id: 'act-1',
    type: 'success',
    title: 'PO-2023-0891 Approved',
    description: 'Approved by Sarah Miller (Operations Dir)',
    timestamp: '2 hours ago',
  },
  {
    id: 'act-2',
    type: 'info',
    title: 'Goods Received: PO-2023-0889',
    description: 'Warehouse A recorded partial delivery',
    timestamp: '5 hours ago',
  },
  {
    id: 'act-3',
    type: 'warning',
    title: 'PO-2023-0895 Price Mismatch',
    description: 'Discrepancy found in unit price from SteelNet Manufacturing',
    timestamp: '8 hours ago',
  },
];

export const APP_CATEGORIES = ['Ink', 'Glue', 'Cligate', 'Dory', 'Packaging', 'Metal'];
export const APP_WAREHOUSES = ['East Wing', 'North Storage', 'Central Hub', 'West Zone'];
