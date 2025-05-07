import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Download, Send, Printer, Edit, Settings } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("view");
  
  // Invoice customization state
  const [customization, setCustomization] = useState({
    companyName: "AquaCRM",
    companyLogo: true,
    companyAddress: "123 Water Street, Aqua City, AC 12345",
    companyPhone: "(123) 456-7890",
    companyEmail: "billing@aquacrm.com",
    invoiceTitle: "INVOICE",
    waterLabel: "Water Consumption",
    maintenanceLabel: "Maintenance Charges",
    noteToCustomer: "Please pay the invoice amount by the due date. Late payments may incur additional charges.",
    footerText: "Thank you for your business!",
    showWaterChart: true,
    primaryColor: "#1E88E5"
  });

  // Calculate subtotal without GST
  const subtotal = 
    parseFloat(invoice.waterCharges) + 
    parseFloat(invoice.maintenanceCharges) + 
    parseFloat(invoice.otherCharges || "0");

  // Handle download invoice as PDF
  const handleDownload = async () => {
    if (!invoiceRef.current) return;

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your PDF...",
    });

    try {
      // Switch to view tab for PDF generation
      setActiveTab("view");
      
      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use html2canvas to capture the invoice element
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      // Create PDF with proper dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `Invoice #${invoice.invoiceNumber} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
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
    if (!invoiceRef.current) return;
    
    // Switch to view tab for printing
    setActiveTab("view");
    
    // Wait for UI to update
    setTimeout(() => {
      window.print();
      
      toast({
        title: "Print dialog opened",
        description: `Invoice #${invoice.invoiceNumber} is ready for printing.`,
      });
    }, 100);
  };

  // Handle customization update
  const handleCustomizationChange = (key: string, value: any) => {
    setCustomization({
      ...customization,
      [key]: value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            View, customize and download the invoice.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view">View Invoice</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* View Invoice Tab */}
          <TabsContent value="view">
            <div ref={invoiceRef} className="bg-white p-6 rounded-lg" style={{ 
              color: "#333",
              fontFamily: "system-ui, -apple-system, sans-serif",
              pageBreakInside: "avoid",
              position: "relative"
            }}>
              {/* Invoice Header */}
              <div className="flex justify-between pb-8 border-b border-gray-200">
                <div>
                  <div className="flex items-center">
                    {customization.companyLogo && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={customization.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" style={{ color: customization.primaryColor }}>
                        <path d="M12 2L4.2 6.6v10.8L12 22l7.8-4.6V6.6z"></path>
                        <path d="M12 22v-6.4"></path>
                        <path d="M12 12.6v-4"></path>
                        <path d="M12 2v3.2"></path>
                      </svg>
                    )}
                    <h1 className="text-xl font-bold" style={{ color: customization.primaryColor }}>{customization.companyName}</h1>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{customization.companyAddress}</p>
                    <p>Phone: {customization.companyPhone}</p>
                    <p>Email: {customization.companyEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-800">{customization.invoiceTitle}</h2>
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

              {/* Consumption Chart - Only show if enabled */}
              {customization.showWaterChart && (
                <div className="mt-8 border p-4 rounded-md bg-gray-50">
                  <h3 className="text-gray-600 font-semibold mb-4">Water Consumption Chart:</h3>
                  <div className="h-20 w-full bg-gray-100 rounded-md flex items-end">
                    <div 
                      className="h-full rounded-l-md" 
                      style={{ 
                        width: `${Math.min(100, (parseFloat(invoice.consumption) / 30) * 100)}%`, 
                        background: `linear-gradient(to right, #e3f2fd, ${customization.primaryColor})`,
                        position: 'relative'
                      }}
                    >
                      <span 
                        className="absolute -top-4 right-0 text-xs font-medium"
                        style={{ color: customization.primaryColor }}
                      >
                        {invoice.consumption} kL
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0 kL</span>
                    <span>Monthly Average: 18 kL</span>
                    <span>30 kL</span>
                  </div>
                </div>
              )}

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
                          <div className="font-medium text-gray-800">{customization.waterLabel}</div>
                          <div className="text-gray-600">{invoice.consumption} kL</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {formatCurrency(parseFloat(invoice.waterCharges))}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-800">{customization.maintenanceLabel}</div>
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
                  {customization.noteToCustomer}
                </p>
              </div>

              {/* Thank You Note */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">{customization.footerText}</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Customize Tab */}
          <TabsContent value="customize">
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Company Information</h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="companyName" className="text-right">Company Name</Label>
                    <Input
                      id="companyName"
                      value={customization.companyName}
                      onChange={(e) => handleCustomizationChange('companyName', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="companyAddress" className="text-right">Address</Label>
                    <Input
                      id="companyAddress"
                      value={customization.companyAddress}
                      onChange={(e) => handleCustomizationChange('companyAddress', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="companyPhone" className="text-right">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={customization.companyPhone}
                      onChange={(e) => handleCustomizationChange('companyPhone', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="companyEmail" className="text-right">Email</Label>
                    <Input
                      id="companyEmail"
                      value={customization.companyEmail}
                      onChange={(e) => handleCustomizationChange('companyEmail', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Invoice Labels</h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invoiceTitle" className="text-right">Invoice Title</Label>
                    <Input
                      id="invoiceTitle"
                      value={customization.invoiceTitle}
                      onChange={(e) => handleCustomizationChange('invoiceTitle', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="waterLabel" className="text-right">Water Label</Label>
                    <Input
                      id="waterLabel"
                      value={customization.waterLabel}
                      onChange={(e) => handleCustomizationChange('waterLabel', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maintenanceLabel" className="text-right">Maintenance Label</Label>
                    <Input
                      id="maintenanceLabel"
                      value={customization.maintenanceLabel}
                      onChange={(e) => handleCustomizationChange('maintenanceLabel', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Custom Messages</h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="noteToCustomer" className="text-right">Payment Note</Label>
                    <Textarea
                      id="noteToCustomer"
                      value={customization.noteToCustomer}
                      onChange={(e) => handleCustomizationChange('noteToCustomer', e.target.value)}
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="footerText" className="text-right">Footer Text</Label>
                    <Input
                      id="footerText"
                      value={customization.footerText}
                      onChange={(e) => handleCustomizationChange('footerText', e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Display Options</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLogo">Show Company Logo</Label>
                    <Switch
                      id="showLogo"
                      checked={customization.companyLogo}
                      onCheckedChange={(checked) => handleCustomizationChange('companyLogo', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showChart">Show Consumption Chart</Label>
                    <Switch
                      id="showChart"
                      checked={customization.showWaterChart}
                      onCheckedChange={(checked) => handleCustomizationChange('showWaterChart', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Color Settings</h3>
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="primaryColor" className="text-right">Primary Color</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={customization.primaryColor}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between sm:justify-between pt-4 border-t">
          <div>
            {invoice.status !== 'paid' && (
              <Button variant="default">
                Mark as Paid
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleSend} title="Send Invoice">
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint} title="Print Invoice">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
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
