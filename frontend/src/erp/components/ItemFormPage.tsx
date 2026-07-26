import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ScreenFrame from './ScreenFrame';
import { InventoryFormData, InventoryItem } from '../types';

interface ItemFormPageProps {
  mode: 'add' | 'edit';
  item?: InventoryItem;
  categories: string[];
  units: string[];
  onBack: () => void;
  onSave: (data: InventoryFormData) => void | Promise<void>;
}

const EMPTY_FORM: InventoryFormData = {
  name: '',
  sku: '',
  type: 'Raw',
  category: 'Ink',
  costPrice: 0,
  sellingPrice: 0,
  stockLevel: 0,
  minStock: 0,
  gsm: 0,
  size: 0,
  unit: 'KG',
};

export default function ItemFormPage({
  mode,
  item,
  categories,
  units,
  onBack,
  onSave,
}: ItemFormPageProps) {
  const initial: InventoryFormData = item
    ? {
        name: item.name,
        sku: item.sku,
        type: item.type,
        category: item.category === '—' ? 'Finished Products' : item.category,
        costPrice: item.costPrice || item.sellingPrice || 0,
        sellingPrice: item.costPrice || item.sellingPrice || 0,
        stockLevel: item.stockLevel,
        minStock: item.minStock,
        gsm: item.gsm,
        size: item.size,
        unit: item.unit,
      }
    : EMPTY_FORM;

  const [itemType, setItemType] = useState<'Raw' | 'Finished'>(initial.type);
  const isFinished = itemType === 'Finished';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get('type') as 'Raw' | 'Finished';
    const itemPrice = Number(fd.get('itemPrice')) || 0;
    // Stock is managed via receiving / consumption — never set from this form
    const stockLevel = mode === 'edit' ? initial.stockLevel : 0;

    if (type === 'Finished') {
      void onSave({
        name: fd.get('name') as string,
        sku: fd.get('sku') as string,
        type,
        category: 'Finished Products',
        costPrice: itemPrice,
        sellingPrice: itemPrice,
        stockLevel,
        minStock: initial.minStock,
        gsm: 0,
        size: 0,
        unit: fd.get('unit') as string,
      });
      return;
    }

    void onSave({
      name: fd.get('name') as string,
      sku: fd.get('sku') as string,
      type,
      category: fd.get('category') as string,
      costPrice: itemPrice,
      sellingPrice: itemPrice,
      stockLevel,
      minStock: Number(fd.get('minStock')) || 0,
      gsm: Number(fd.get('gsm')) || 0,
      size: Number(fd.get('size')) || 0,
      unit: fd.get('unit') as string,
    });
  };

  const title = mode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item';

  return (
    <ScreenFrame
      title={title}
      toolbar={
        <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
          <ArrowLeft size={14} />
          Back
        </button>
      }
      formPanel={
        <form id="inventory-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Item Name" name="name" defaultValue={initial.name} required />
            <Field label="Item Code (SKU)" name="sku" defaultValue={initial.sku} required />
            <div className="erp-field-row">
              <label className="erp-field-label">Type</label>
              <select
                name="type"
                value={itemType}
                onChange={(e) => setItemType(e.target.value as 'Raw' | 'Finished')}
                className="erp-classic-select w-full"
              >
                <option value="Raw">Raw</option>
                <option value="Finished">Finished</option>
              </select>
            </div>
            <SelectField label="UOM" name="unit" defaultValue={initial.unit} options={units} />
            <Field label="Item Price" name="itemPrice" type="number" defaultValue={initial.costPrice} step="0.01" />

            {!isFinished && (
              <>
                <SelectField label="Category" name="category" defaultValue={initial.category} options={categories} />
                <Field label="Demand Qty (Min Stock)" name="minStock" type="number" defaultValue={initial.minStock} highlight />
                <Field label="GSM" name="gsm" type="number" defaultValue={initial.gsm} step="0.01" highlight />
                <Field label="Size" name="size" type="number" defaultValue={initial.size} step="0.01" highlight />
              </>
            )}
          </div>
        </form>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="erp-btn-ghost">Cancel</button>
          <button type="submit" form="inventory-form" className="erp-btn-primary erp-btn-save">Save</button>
        </div>
      }
    />
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
  step,
  highlight,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  required?: boolean;
  step?: string;
  highlight?: boolean;
}) {
  return (
    <div className="erp-field-row">
      <label className="erp-field-label">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        className={`erp-input w-full ${highlight ? 'erp-cell-highlight' : ''}`}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <div className="erp-field-row">
      <label className="erp-field-label">{label}</label>
      <select name={name} defaultValue={defaultValue} className="erp-classic-select w-full">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
