import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  if (!date) return "-";
  
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd MMM yyyy");
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return "₹0.00";
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
}

export function formatNumber(num: number | string, decimals: number = 0): string {
  const numValue = typeof num === "string" ? parseFloat(num) : num;
  
  if (isNaN(numValue)) return "0";
  
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
}

export function generateCustomerId(): string {
  const prefix = "CUS";
  const year = new Date().getFullYear().toString().slice(2);
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}${randomNum}`;
}

export function generateMeterId(): string {
  const prefix = "WM";
  const year = new Date().getFullYear().toString().slice(2);
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}${randomNum}`;
}

export function generateInvoiceNumber(): string {
  const prefix = "INV";
  const year = new Date().getFullYear().toString();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}${month}-${randomNum}`;
}

export function calculateConsumption(currentReading: number, previousReading: number): number {
  return Math.max(0, currentReading - previousReading);
}

export function calculateInvoiceAmount(
  consumption: number,
  waterChargeRate: number,
  maintenanceCharge: number,
  gstPercentage: number,
  otherCharges: number = 0
): {
  waterCharges: number;
  maintenanceCharges: number;
  gstAmount: number;
  totalAmount: number;
} {
  const waterCharges = consumption * waterChargeRate;
  const subtotal = waterCharges + maintenanceCharge + otherCharges;
  const gstAmount = (subtotal * gstPercentage) / 100;
  const totalAmount = subtotal + gstAmount;
  
  return {
    waterCharges,
    maintenanceCharges: maintenanceCharge,
    gstAmount,
    totalAmount
  };
}

export function getDueDateFromIssueDate(issueDate: Date, daysToAdd: number = 15): Date {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  return dueDate;
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800"
  };
  
  return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}
