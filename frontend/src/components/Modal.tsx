/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { X, Check } from 'lucide-react';
import { InventoryItem, PurchaseOrder, POStatus } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'add_item' | 'edit_item' | 'add_po' | 'edit_po';
  itemToEdit?: InventoryItem | null;
  poToEdit?: PurchaseOrder | null;
  onSaveItem: (item: Partial<InventoryItem>) => void;
  onSavePO: (po: Partial<PurchaseOrder>) => void;
}

export default function Modal({
  isOpen,
  onClose,
  type,
  itemToEdit,
  poToEdit,
  onSaveItem,
  onSavePO,
}: ModalProps) {
  // Inventory Form State
  const [itemName, setItemName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Ink');
  const [location, setLocation] = useState('East Wing, Rack A2');
  const [stockLevel, setStockLevel] = useState<number>(100);
  const [maxStock, setMaxStock] = useState<number>(500);
  const [unitPrice, setUnitPrice] = useState<number>(150);

  // Purchase Order Form State
  const [poNumber, setPoNumber] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorLogoCode, setVendorLogoCode] = useState('SN');
  const [vendorCategory, setVendorCategory] = useState('Tier 1 Supplier');
  const [totalAmount, setTotalAmount] = useState<number>(5000);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [poStatus, setPoStatus] = useState<POStatus>('Pending');

  // Sync edit values
  useEffect(() => {
    if (type === 'edit_item' && itemToEdit) {
      setItemName(itemToEdit.name);
      setSku(itemToEdit.sku);
      setCategory(itemToEdit.category);
      setLocation(itemToEdit.location);
      setStockLevel(itemToEdit.stockLevel);
      setMaxStock(itemToEdit.maxStock);
      setUnitPrice(itemToEdit.unitPrice);
    } else if (type === 'add_item') {
      setItemName('');
      setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
      setCategory('Ink');
      setLocation('East Wing, Rack A2');
      setStockLevel(100);
      setMaxStock(500);
      setUnitPrice(120);
    } else if (type === 'edit_po' && poToEdit) {
      setPoNumber(poToEdit.poNumber);
      setVendorName(poToEdit.vendorName);
      setVendorLogoCode(poToEdit.vendorLogoCode);
      setVendorCategory(poToEdit.vendorCategory);
      setTotalAmount(poToEdit.totalAmount);
      setDeliveryDate(poToEdit.deliveryDate);
      setPoStatus(poToEdit.status);
    } else if (type === 'add_po') {
      const year = new Date().getFullYear();
      setPoNumber(`PO-${year}-${Math.floor(800 + Math.random() * 200)}`);
      setVendorName('');
      setVendorLogoCode('SN');
      setVendorCategory('Tier 1 Supplier');
      setTotalAmount(5000);
      setDeliveryDate(new Date().toISOString().split('T')[0]);
      setPoStatus('Pending');
    }
  }, [type, itemToEdit, poToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (type === 'add_item' || type === 'edit_item') {
      if (!itemName.trim() || !sku.trim()) {
        alert('Please fill out all required fields.');
        return;
      }
      onSaveItem({
        id: itemToEdit?.id,
        name: itemName,
        sku,
        category,
        location,
        stockLevel: Number(stockLevel) || 0,
        maxStock: Number(maxStock) || 100,
        unitPrice: Number(unitPrice) || 0,
      });
    } else {
      if (!vendorName.trim() || !poNumber.trim()) {
        alert('Please specify the vendor and purchase order identification.');
        return;
      }
      onSavePO({
        id: poToEdit?.id,
        poNumber,
        vendorName,
        vendorLogoCode,
        vendorCategory,
        totalAmount: Number(totalAmount) || 0,
        deliveryDate,
        status: poStatus,
      });
    }
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'add_item':
        return 'Register New Warehouse Product';
      case 'edit_item':
        return 'Edit Product Reference';
      case 'add_po':
        return 'Draft Purchase Requisition (PO)';
      case 'edit_po':
        return 'Modify Purchase Order Details';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {(type === 'add_item' || type === 'edit_item') ? (
            <>
              {/* ITEM FORM FIELDS */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Gandolla Premium"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#645efb]/20 focus:border-[#645efb] text-sm text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="Ink">Ink</option>
                    <option value="Glue">Glue</option>
                    <option value="Cligate">Cligate</option>
                    <option value="Dory">Dory</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Metal">Metal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Warehouse Storage Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                >
                  <option value="East Wing, Rack A2">East Wing, Rack A2</option>
                  <option value="East Wing, Rack B1">East Wing, Rack B1</option>
                  <option value="North Storage, Bin 12">North Storage, Bin 12</option>
                  <option value="Central Hub, Zone D">Central Hub, Zone D</option>
                  <option value="West Zone, Shelf C">West Zone, Shelf C</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Stock level *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockLevel}
                    onChange={(e) => setStockLevel(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-[#0b1c30] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Threshold Max *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxStock}
                    onChange={(e) => setMaxStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-[#0b1c30] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Unit Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* PO FORM FIELDS */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">PO Reference # *</label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Vendor/Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. SteelNet Manufacturing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#645efb]/20 focus:border-[#645efb] text-sm text-[#0b1c30] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vendor Abbrev / Brand Logo Code</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. SN"
                    value={vendorLogoCode}
                    onChange={(e) => setVendorLogoCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vendor Segment Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Tier 1 Supplier"
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Total Procurement Value ($) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fulfillment Target Date *</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Initiation Status</label>
                <select
                  value={poStatus}
                  onChange={(e) => setPoStatus(e.target.value as POStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700 outline-none"
                >
                  <option value="Pending">Pending (Requires Review)</option>
                  <option value="Approved">Approved (Ready for dispatch)</option>
                  <option value="Received">Received (Inbound recorded)</option>
                </select>
              </div>
            </>
          )}

          {/* Footer Save Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors select-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00236f] hover:bg-[#645efb] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all select-none cursor-pointer"
            >
              <Check size={14} />
              <span>Confirm &amp; Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
