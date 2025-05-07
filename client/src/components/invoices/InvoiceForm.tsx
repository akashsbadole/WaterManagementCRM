import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { defaultInvoice } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { 
  formatCurrency, 
  calculateInvoiceAmount, 
  generateInvoiceNumber,
  getDueDateFromIssueDate
} from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// Form schema
const formSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  customerId: z.string().min(1, "Customer is required"),
  meterId: z.string().min(1, "Meter is required"),
  billingPeriodStart: z.string().min(1, "Billing period start is required"),
  billingPeriodEnd: z.string().min(1, "Billing period end is required"),
  consumption: z.string().min(1, "Consumption is required"),
  waterCharges: z.string(),
  maintenanceCharges: z.string(),
  gstPercentage: z.string(),
  gstAmount: z.string(),
  otherCharges: z.string().optional(),
  totalAmount: z.string(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  applyGST: z.boolean(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  customerId?: string;
  meterId?: string;
}

export function InvoiceForm({
  open,
  onOpenChange,
  onSuccess,
  customerId,
  meterId,
}: InvoiceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Get customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    enabled: open,
  });

  // Initialize form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultInvoice,
      invoiceNumber: generateInvoiceNumber(),
      customerId: customerId || "",
      meterId: meterId || "",
      applyGST: true,
    },
  });

  // Pre-populate customer and meter if provided
  useEffect(() => {
    if (customerId) {
      form.setValue("customerId", customerId);
    }
    if (meterId) {
      form.setValue("meterId", meterId);
    }
  }, [customerId, meterId, form]);

  // Get meters for the selected customer
  const selectedCustomerId = form.watch("customerId");
  
  const { data: meters } = useQuery({
    queryKey: [`/api/customers/${selectedCustomerId}/meters`],
    queryFn: async () => {
      const response = await fetch(`/api/customers/${selectedCustomerId}/meters`);
      if (!response.ok) {
        throw new Error('Failed to fetch meters');
      }
      return response.json();
    },
    enabled: open && !!selectedCustomerId,
  });

  // Set due date when issue date changes
  const issueDate = form.watch("issueDate");
  
  useEffect(() => {
    if (issueDate) {
      const dueDate = getDueDateFromIssueDate(new Date(issueDate));
      form.setValue("dueDate", dueDate.toISOString().split('T')[0]);
    }
  }, [issueDate, form]);

  // Calculate totals when relevant fields change
  const consumption = form.watch("consumption");
  const waterChargeRate = form.watch("waterCharges");
  const maintenanceCharges = form.watch("maintenanceCharges");
  const gstPercentage = form.watch("gstPercentage");
  const otherCharges = form.watch("otherCharges");
  const applyGST = form.watch("applyGST");
  
  useEffect(() => {
    const consumptionValue = parseFloat(consumption || "0");
    const waterRateValue = parseFloat(waterChargeRate || "0");
    const maintenanceValue = parseFloat(maintenanceCharges || "150");
    const gstPercentageValue = applyGST ? parseFloat(gstPercentage || "18") : 0;
    const otherChargesValue = parseFloat(otherCharges || "0");
    
    if (!isNaN(consumptionValue) && !isNaN(waterRateValue)) {
      const waterChargesAmount = consumptionValue * waterRateValue;
      form.setValue("waterCharges", waterChargesAmount.toString());
      
      const { gstAmount, totalAmount } = calculateInvoiceAmount(
        consumptionValue,
        waterRateValue,
        maintenanceValue,
        gstPercentageValue,
        otherChargesValue
      );
      
      form.setValue("gstAmount", gstAmount.toString());
      form.setValue("totalAmount", totalAmount.toString());
    }
  }, [consumption, waterChargeRate, maintenanceCharges, gstPercentage, otherCharges, applyGST, form]);

  // Form submission handler
  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        ...data,
        gstPercentage: applyGST ? data.gstPercentage : "0",
      };
      
      await apiRequest("POST", "/api/invoices", invoiceData);
      
      toast({
        title: "Invoice generated",
        description: "The invoice has been generated successfully.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for water consumption
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled || !!customerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer: any) => (
                          <SelectItem key={customer.customerId} value={customer.customerId}>
                            {customer.firstName} {customer.lastName} ({customer.customerId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="meterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Meter</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled || !selectedCustomerId || !!meterId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meter" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meters?.map((meter: any) => (
                          <SelectItem key={meter.meterId} value={meter.meterId}>
                            {meter.meterId} ({meter.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingPeriodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period Start</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="billingPeriodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period End</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="consumption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Consumption (kL)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-md font-medium">Charges</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="waterCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Rate (₹/kL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" value="10.5" onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maintenanceCharges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance Charges (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormField
                    control={form.control}
                    name="applyGST"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Apply GST</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="gstPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} disabled={!form.watch("applyGST")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="otherCharges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Charges (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value || "0"} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between p-4 bg-gray-50 rounded-md mt-6">
              <div>
                <h4 className="text-lg font-medium">Total Amount</h4>
                <p className="text-sm text-gray-500">
                  {form.watch("applyGST") && `Including ${form.watch("gstPercentage")}% GST`}
                </p>
              </div>
              <div className="text-xl font-semibold">
                {formatCurrency(parseFloat(form.watch("totalAmount") || "0"))}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  "Generate Invoice"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
