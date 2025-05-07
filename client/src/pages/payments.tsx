import React from "react";
import { PlusCircle, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, AlertCircle, Eye, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { paymentMethods } from "@/lib/data";

export default function Payments() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("all");

  // Fetch payment data
  const { data: payments, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: async () => {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      return response.json();
    }
  });

  // Fetch customers data for name lookup
  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    }
  });

  // Helper to get customer name
  const getCustomerName = (customerId: string) => {
    if (!customers || isLoadingCustomers) return "Loading...";
    const customer = customers.find((c: any) => c.customerId === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  };

  // Handle record payment
  const handleRecordPayment = () => {
    // In a real implementation, this would open a payment form modal
    alert("Record new payment...");
  };

  // Handle view payment
  const handleViewPayment = (payment: any) => {
    // In a real implementation, this would show payment details
    alert(`View payment details for payment ID: ${payment.id}`);
  };

  // Handle export
  const handleExport = () => {
    // In a real implementation, this would export payments data to CSV/Excel
    alert("Exporting payments data...");
  };

  // Get method label
  const getMethodLabel = (method: string) => {
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  const isLoadingData = isLoading || isLoadingCustomers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage and track customer payments for invoices.
          </p>
        </div>
        <Button onClick={handleRecordPayment}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select
                value={methodFilter}
                onValueChange={setMethodFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {getMethodLabel(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={dateFilter}
                  onValueChange={setDateFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Date" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              </div>
              <Button variant="outline" size="icon" onClick={handleExport} title="Export Payments">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingData ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                      <h3 className="text-lg font-medium">Error loading payments</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        There was a problem fetching the payment data.
                      </p>
                      <Button onClick={() => refetch()}>Try Again</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !payments || payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No payments found</h3>
                      <p className="text-sm text-muted-foreground">
                        Record a new payment to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{getCustomerName(payment.customerId)}</div>
                      <div className="text-sm text-muted-foreground">{payment.customerId}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(parseFloat(payment.amount))}</TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getMethodLabel(payment.paymentMethod)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.reference || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPayment(payment)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Receipt className="mr-2 h-4 w-4" />
                            <span>Receipt</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
