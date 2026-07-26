import { VendorInput } from '../api/vendors';
import { CustomerInput } from '../api/customers';

export function toVendorInput(data: Record<string, unknown>): VendorInput {
  return {
    name: String(data.name ?? '').trim(),
    phone: String(data.phone ?? ''),
    email: String(data.email ?? ''),
    city: String(data.city ?? ''),
    address: String(data.address ?? ''),
  };
}

export function toCustomerInput(data: Record<string, unknown>): CustomerInput {
  return {
    name: String(data.name ?? '').trim(),
    phone: String(data.phone ?? ''),
    email: String(data.email ?? ''),
    city: String(data.city ?? ''),
    address: String(data.address ?? ''),
  };
}
