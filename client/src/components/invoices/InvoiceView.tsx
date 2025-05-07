import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Download, Send, Printer } from "lucide-react";

interface Invoice {
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
  billingPeriodStart: string;
  billingPeriodEnd: string;
  gstPercentage: string;
  otherCharges: string;
}

interface InvoiceViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  customerName: string;
}

export function InvoiceView({
  open,
  onOpenChange,
  invoice,
  customerName,
}: InvoiceViewProps) {
  const { toast } = useToast();

  // Calculate subtotal without GST
  const subtotal = 
    parseFloat(invoice.waterCharges) + 
    parseFloat(invoice.maintenanceCharges) + 
    parseFloat(invoice.otherCharges || "0");

  // Handle download invoice
  const handleDownload = () => {
    toast({
      title: "Download started",
      description: `Invoice #${invoice.invoiceNumber} is being downloaded as PDF.`,
    });
  };

  // Handle send invoice
  const handleSend = () => {
    toast({
      title: "Invoice sent",
      description: `Invoice #${invoice.invoiceNumber} has been sent to the customer.`,
    });
  };

  // Handle print invoice
  const handlePrint = () => {
    toast({
      title: "Printing invoice",
      description: `Preparing invoice #${invoice.invoiceNumber} for printing.`,
    });
    // In a real implementation, we would use window.print() here
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <div className="bg-white p-6 rounded-lg">
          {/* Invoice Header */}
          <div className="flex justify-between pb-8 border-b border-gray-200">
            <div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                  <path d="M12 2L4.2 6.6v10.8L12 22l7.8-4.6V6.6z"></path>
                  <path d="M12 22v-6.4"></path>
                  <path d="M12 12.6v-4"></path>
                  <path d="M12 2v3.2"></path>
                </svg>
                <h1 className="text-xl font-bold text-primary">AquaCRM</h1>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>123 Water Street</p>
                <p>Aqua City, AC 12345</p>
                <p>Phone: (123) 456-7890</p>
                <p>Email: billing@aquacrm.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <div className="mt-2 text-sm">
                <p><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Issue Date:</strong> {formatDate(invoice.issueDate)}</p>
                <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {invoice.status.toUpperCase()}
                </span></p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-gray-600 font-semibold mb-2">Bill To:</h3>
              <p className="font-semibold">{customerName}</p>
              <p className="text-sm text-gray-600">Customer ID: {invoice.customerId}</p>
              <p className="text-sm text-gray-600">Meter ID: {invoice.meterId}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-semibold mb-2">Billing Period:</h3>
              <p className="text-sm">From: {formatDate(invoice.billingPeriodStart)}</p>
              <p className="text-sm">To: {formatDate(invoice.billingPeriodEnd)}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="mt-8">
            <h3 className="text-gray-600 font-semibold mb-4">Invoice Details:</h3>
            <div className="border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-800">Water Consumption</div>
                      <div className="text-gray-600">{invoice.consumption} kL</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(parseFloat(invoice.waterCharges))}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-800">Maintenance Charges</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(parseFloat(invoice.maintenanceCharges))}
                    </td>
                  </tr>
                  {parseFloat(invoice.otherCharges || "0") > 0 && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-800">Other Charges</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatCurrency(parseFloat(invoice.otherCharges))}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">Subtotal</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      GST ({invoice.gstPercentage}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(parseFloat(invoice.gstAmount))}
                    </td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-right text-gray-900">
                      {formatCurrency(parseFloat(invoice.totalAmount))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mt-8">
            <h3 className="text-gray-600 font-semibold mb-2">Payment Terms:</h3>
            <p className="text-sm text-gray-600">
              Please pay the invoice amount by the due date. Late payments may incur additional charges.
            </p>
          </div>

          {/* Thank You Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">Thank you for your business!</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {invoice.status !== 'paid' && (
              <Button variant="default">
                Mark as Paid
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
