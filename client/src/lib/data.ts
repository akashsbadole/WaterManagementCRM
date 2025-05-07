import { generateCustomerId, generateMeterId, generateInvoiceNumber } from "./utils";

export const zones = [
  "North Zone",
  "South Zone",
  "East Zone",
  "West Zone"
];

export const meterTypes = [
  "analog",
  "digital",
  "smart"
];

export const meterStatuses = [
  "active",
  "inactive", 
  "maintenance"
];

export const customerStatuses = [
  "active",
  "inactive",
  "pending"
];

export const invoiceStatuses = [
  "paid",
  "pending",
  "overdue"
];

export const paymentMethods = [
  "cash",
  "online",
  "cheque"
];

export const documentTypes = [
  "aadhaar",
  "address_proof",
  "other"
];

export const defaultCustomer = {
  customerId: generateCustomerId(),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zone: zones[0],
  status: "active",
  aadhaarNumber: ""
};

export const defaultWaterMeter = {
  meterId: generateMeterId(),
  customerId: "",
  type: "analog",
  location: "",
  installationDate: new Date().toISOString().split("T")[0],
  initialReading: "0",
  status: "active"
};

export const defaultMeterReading = {
  meterId: "",
  readingDate: new Date().toISOString().split("T")[0],
  reading: "0",
  consumption: "0",
  notes: ""
};

export const defaultInvoice = {
  invoiceNumber: generateInvoiceNumber(),
  customerId: "",
  meterId: "",
  billingPeriodStart: new Date(new Date().setDate(1)).toISOString().split("T")[0], // First day of current month
  billingPeriodEnd: new Date().toISOString().split("T")[0], // Today
  consumption: "0",
  waterCharges: "0",
  maintenanceCharges: "150",
  gstPercentage: "18",
  gstAmount: "0",
  otherCharges: "0",
  totalAmount: "0",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split("T")[0], // 15 days from today
  status: "pending"
};

export const defaultPayment = {
  invoiceNumber: "",
  customerId: "",
  amount: "0",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "cash",
  reference: "",
  notes: ""
};

export const defaultDocument = {
  customerId: "",
  documentType: "aadhaar",
  documentName: "",
  documentPath: "",
  uploadDate: new Date().toISOString().split("T")[0]
};

export const waterChargeRate = 10.5; // Rs per kL
export const defaultMaintenanceCharge = 150; // Rs per month
export const defaultGSTPercentage = 18; // 18%
