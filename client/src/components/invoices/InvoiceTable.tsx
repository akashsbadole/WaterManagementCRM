import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, formatCurrency, formatDate } from "@/lib/utils";
import { MoreHorizontal, Eye, Download, Send, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InvoiceView } from "./InvoiceView";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: string;
  meterId: string;
  consumption: string;
  waterCharges: string;
  maintenanceCharges: string;
  gstAmount: string;
  totalAmount: string;
  issueDate: string;
  dueDate: string;
  status: string;
}

export function InvoiceTable() {
  const { toast } = useToast();
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  
  const { data: invoicesData, isLoading: isLoadingInvoices, isError, refetch } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    }
  });

  // Get customer data
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
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
    if (!customersData || isLoadingCustomers) return "Loading...";
    const customer = customersData.find((c: any) => c.customerId === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  };

  // Handle view invoice
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  // Handle download invoice
  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Download started",
      description: `Invoice #${invoice.invoiceNumber} is being downloaded.`,
    });
  };

  // Handle send invoice
  const handleSendInvoice = (invoice: Invoice) => {
    toast({
      title: "Invoice sent",
      description: `Invoice #${invoice.invoiceNumber} has been sent to the customer.`,
    });
  };

  // Mark invoice as paid
  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await apiRequest("PUT", `/api/invoices/${invoice.id}`, {
        ...invoice,
        status: "paid"
      });
      
      toast({
        title: "Invoice updated",
        description: `Invoice #${invoice.invoiceNumber} has been marked as paid.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingInvoices || isLoadingCustomers;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex flex-col items-center justify-center my-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Error loading invoices</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was a problem fetching the invoice data.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const invoices: Invoice[] = invoicesData || [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Consumption</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No invoices found</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate a new invoice to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{getCustomerName(invoice.customerId)}</div>
                    <div className="text-sm text-muted-foreground">{invoice.customerId}</div>
                  </TableCell>
                  <TableCell>{invoice.consumption} kL</TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(parseFloat(invoice.totalAmount))}</div>
                    <div className="text-xs text-muted-foreground">Incl. GST</div>
                  </TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
                          <Send className="mr-2 h-4 w-4" />
                          <span>Send to Customer</span>
                        </DropdownMenuItem>
                        {invoice.status !== "paid" && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>Mark as Paid</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <InvoiceView
          open={showViewModal}
          onOpenChange={setShowViewModal}
          invoice={selectedInvoice}
          customerName={getCustomerName(selectedInvoice.customerId)}
        />
      )}
    </>
  );
}
