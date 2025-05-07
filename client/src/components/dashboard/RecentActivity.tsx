import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Recent Customers
interface Customer {
  id: number;
  name: string;
  email: string;
  addedOn: string;
  avatar?: string;
}

interface RecentCustomersProps {
  customers: Customer[];
  isLoading?: boolean;
}

export function RecentCustomers({ customers, isLoading = false }: RecentCustomersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Customers</CardTitle>
        <a href="/customers" className="text-primary text-sm hover:underline">View All</a>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center py-2 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="ml-3 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={customer.avatar} />
                  <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                  <p className="text-xs text-gray-500">Added on {formatDate(customer.addedOn)}</p>
                </div>
                <button className="ml-auto text-gray-400 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Recent Invoices
interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function RecentInvoices({ invoices, isLoading = false }: RecentInvoicesProps) {
  const getStatusStyles = (status: string) => {
    switch(status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Invoices</CardTitle>
        <a href="/invoices" className="text-primary text-sm hover:underline">View All</a>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center py-2 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="ml-3 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="ml-auto h-5 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center py-2 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(invoice.amount)} • Due {formatDate(invoice.dueDate)}</p>
                </div>
                <Badge className={cn("ml-auto", getStatusStyles(invoice.status))}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Area-wise Consumption
interface AreaConsumption {
  zone: string;
  consumption: number;
  percentage: number;
  color: string;
}

interface AreaConsumptionProps {
  data: AreaConsumption[];
  isLoading?: boolean;
}

export function AreaConsumption({ data, isLoading = false }: AreaConsumptionProps) {
  // Total consumption
  const totalConsumption = data.reduce((sum, item) => sum + item.consumption, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Area-wise Consumption</CardTitle>
        <a href="/reports" className="text-primary text-sm hover:underline">View Report</a>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="pt-4">
            {/* Doughnut chart (simplified) */}
            <div className="relative mx-auto w-40 h-40 mb-6">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="rotate-[-90deg]">
                {data.map((item, i) => {
                  // Calculate the slice
                  const prevSliceEnd = data
                    .slice(0, i)
                    .reduce((sum, d) => sum + d.percentage, 0);
                  const sliceStart = prevSliceEnd;
                  const sliceEnd = sliceStart + item.percentage;
                  
                  // Convert to radians
                  const startAngle = (sliceStart / 100) * (2 * Math.PI);
                  const endAngle = (sliceEnd / 100) * (2 * Math.PI);
                  
                  // Calculate path
                  const x1 = 21 + 15 * Math.cos(startAngle);
                  const y1 = 21 + 15 * Math.sin(startAngle);
                  const x2 = 21 + 15 * Math.cos(endAngle);
                  const y2 = 21 + 15 * Math.sin(endAngle);
                  
                  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
                  
                  const pathData = [
                    `M 21 21`,
                    `L ${x1} ${y1}`,
                    `A 15 15 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(" ");
                  
                  return (
                    <path
                      key={i}
                      d={pathData}
                      fill={item.color}
                    />
                  );
                })}
                <circle cx="21" cy="21" r="10" fill="white" />
              </svg>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {data.map((item, i) => (
                <div key={i} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {item.zone} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">Total Consumption</p>
              <p className="text-lg font-medium text-gray-800">
                {formatNumber(totalConsumption)} L
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-IN').format(number);
}
