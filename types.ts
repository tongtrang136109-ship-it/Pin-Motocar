// Fix: Replaced incorrect file content with all necessary type definitions for the application.

export interface User {
  id: string;
  name: string;
  loginPhone: string;
  password: string; // Note: In a real app, this should be a hash
  email?: string;
  status: 'active' | 'inactive';
  departmentIds: string[];
  creationDate: string;
  address?: string;
}

export type PermissionLevel = 'all' | 'restricted' | 'none';

export interface ModulePermission {
    level: PermissionLevel;
    details?: { [key: string]: boolean };
}

export interface Permissions {
    [moduleKey: string]: ModulePermission | boolean; // boolean for simple toggles
}

export interface Department {
    id: string;
    name: string;
    description: string;
    permissions: Permissions;
}


export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    branches: { id: string; name: string }[];
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  stock: { [branchId: string]: number };
  price: number; // Purchase price
  sellingPrice: number;
  category?: string;
  description?: string;
  warrantyPeriod?: string;
  expiryDate?: string;
}

export interface WorkOrderPart {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  price: number; // Selling price at the time of service
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface WorkOrder {
  id: string;
  creationDate: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  licensePlate: string;
  issueDescription: string;
  technicianName: string;
  status: 'Tiếp nhận' | 'Đang sửa' | 'Đã sửa xong' | 'Trả máy';
  total: number;
  branchId: string;
  laborCost: number;
  partsUsed?: WorkOrderPart[];
  quotationItems?: QuotationItem[];
  notes?: string;
  processingType?: string;
  customerQuote?: number;
  discount?: number;
  mileage?: number;
  paymentStatus?: 'paid' | 'unpaid';
  paymentMethod?: 'cash' | 'bank';
  paymentDate?: string;
  cashTransactionId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  loyaltyPoints: number;
}

export interface InventoryTransaction {
    id: string;
    type: 'Nhập kho' | 'Xuất kho';
    partId: string;
    partName: string;
    quantity: number;
    date: string;
    notes: string;
    unitPrice?: number;
    totalPrice: number;
    branchId: string;
    saleId?: string;
    transferId?: string;
    discount?: number;
    customerId?: string;
    customerName?: string;
    userId?: string;
    userName?: string;
}

export interface CartItem {
  partId: string;
  partName: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  stock: number; // Available stock at time of adding to cart
  discount?: number;
  warrantyPeriod?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
}

export interface PaymentSource {
    id: string;
    name: string;
    balance: { [branchId: string]: number };
    isDefault?: boolean;
}

export interface CashTransaction {
    id: string;
    type: 'income' | 'expense';
    date: string;
    amount: number;
    contact: {
        id: string;
        name: string;
    };
    notes: string;
    paymentSourceId: string;
    branchId: string;
    saleId?: string;
    workOrderId?: string;
}

export interface ReceiptItem {
    partId: string;
    partName: string;
    sku: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    warrantyPeriod?: string;
}

export type ContactType = 'Khách hàng' | 'Nhà cung cấp' | 'Đối tác sửa chữa' | 'Đối tác tài chính';

export interface Contact {
    id: string;
    name: string;
    phone?: string;
    type: ContactType[];
}

export interface FixedAsset {
  id: string;
  name: string;
  purchaseDate: string;
  purchasePrice: number;
  description?: string;
  usefulLife?: number; // in years
  salvageValue?: number;
  branchId: string;
}

export interface CapitalInvestment {
  id: string;
  date: string;
  amount: number;
  description: string;
  source: 'Vốn chủ sở hữu' | 'Vay ngân hàng';
  interestRate?: number; // in percent
  branchId: string;
}

// --- PINCORP App Types ---

export interface PinMaterial {
  id: string;
  name: string;
  sku: string;
  unit: 'cái' | 'mét' | 'kg' | 'lít' | 'cuộn';
  purchasePrice: number;
  stock: number; // Single stock number, no branches for now
  supplier?: string;
  description?: string;
}

export interface PinBomMaterial {
  materialId: string;
  quantity: number;
}

export interface PinBOM {
  id: string;
  productName: string;
  productSku: string;
  materials: PinBomMaterial[];
  notes?: string;
  estimatedCost?: number; // Calculated field, not stored
}

export interface AdditionalCost {
  description: string;
  amount: number;
}

export interface ProductionOrder {
  id: string;
  creationDate: string;
  bomId: string;
  productName: string;
  quantityProduced: number;
  status: 'Đang chờ' | 'Đang sản xuất' | 'Hoàn thành' | 'Đã hủy';
  materialsCost: number;
  additionalCosts: AdditionalCost[];
  totalCost: number;
  notes?: string;
  userName?: string;
}

export interface PinProduct {
  id: string; // Corresponds to bomId or productSku
  name: string;
  sku: string;
  stock: number;
  costPrice: number; // Giá vốn
  sellingPrice: number; // Giá bán
}

export interface PinCartItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number; // Snapshot of cost at time of sale
  stock: number; // available stock
  discount?: number;
}

export interface PinCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

export interface PinSale {
  id: string;
  date: string;
  items: PinCartItem[];
  subtotal: number;
  discount: number;
  total: number;
  customer: {
    id?: string;
    name: string;
    phone?: string;
    address?: string;
  };
  paymentMethod: 'cash' | 'bank';
  userId: string;
  userName: string;
}