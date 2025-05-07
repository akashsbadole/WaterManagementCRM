import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { defaultMeterReading } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { calculateConsumption } from "@/lib/utils";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Form schema
const formSchema = z.object({
  meterId: z.string().min(1, "Meter ID is required"),
  readingDate: z.string().min(1, "Reading date is required"),
  reading: z.string().min(1, "Current reading is required"),
  consumption: z.string(),
  notes: z.string().optional(),
  generateInvoice: z.boolean().optional(),
});

type ReadingFormValues = z.infer<typeof formSchema>;

interface ReadingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meterId: string;
  onSuccess: () => void;
}

export function ReadingForm({
  open,
  onOpenChange,
  meterId,
  onSuccess,
}: ReadingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [previousReading, setPreviousReading] = React.useState<number>(0);

  // Get previous readings for the meter
  const { data: readings, isLoading } = useQuery({
    queryKey: [`/api/meters/${meterId}/readings`],
    queryFn: async () => {
      const response = await fetch(`/api/meters/${meterId}/readings`);
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      return response.json();
    },
    enabled: open && !!meterId,
  });

  // Initialize form
  const form = useForm<ReadingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultMeterReading,
      meterId,
      generateInvoice: false,
    },
  });

  // Update form when meterId changes
  useEffect(() => {
    form.setValue("meterId", meterId);
  }, [meterId, form]);

  // Find the latest reading for consumption calculation
  useEffect(() => {
    if (readings && readings.length > 0) {
      // Sort readings by date (descending)
      const sortedReadings = [...readings].sort((a, b) => {
        return new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime();
      });
      
      if (sortedReadings.length > 0) {
        const latestReadingValue = parseFloat(sortedReadings[0].reading);
        setPreviousReading(latestReadingValue);
      }
    }
  }, [readings]);

  // Calculate consumption when reading changes
  const watchedReading = form.watch("reading");
  
  useEffect(() => {
    if (watchedReading && !isNaN(parseFloat(watchedReading))) {
      const currentReading = parseFloat(watchedReading);
      const consumption = calculateConsumption(currentReading, previousReading);
      form.setValue("consumption", consumption.toString());
    }
  }, [watchedReading, previousReading, form]);

  // Form submission handler
  const onSubmit = async (data: ReadingFormValues) => {
    setIsSubmitting(true);
    try {
      // Submit reading
      await apiRequest("POST", "/api/readings", data);
      
      // Generate invoice if requested
      if (data.generateInvoice) {
        // Get customer data
        const meterResponse = await fetch(`/api/meters/${meterId}`);
        if (!meterResponse.ok) {
          throw new Error('Failed to fetch meter data');
        }
        const meterData = await meterResponse.json();
        
        // Format dates
        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        // Due date (15 days from today)
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 15);
        
        // Calculate invoice amounts
        const waterChargeRate = 10.5; // Rs per kL
        const maintenanceCharges = 150;
        const gstPercentage = 18;
        const consumption = parseFloat(data.consumption);
        
        const waterCharges = consumption * waterChargeRate;
        const subtotal = waterCharges + maintenanceCharges;
        const gstAmount = (subtotal * gstPercentage) / 100;
        const totalAmount = subtotal + gstAmount;
        
        // Generate invoice number
        const invoiceNumber = `INV-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        const invoiceData = {
          invoiceNumber,
          customerId: meterData.customerId,
          meterId: meterId,
          billingPeriodStart: lastMonth.toISOString().split('T')[0],
          billingPeriodEnd: today.toISOString().split('T')[0],
          consumption: data.consumption,
          waterCharges: waterCharges.toString(),
          maintenanceCharges: maintenanceCharges.toString(),
          gstPercentage: gstPercentage.toString(),
          gstAmount: gstAmount.toString(),
          otherCharges: "0",
          totalAmount: totalAmount.toString(),
          issueDate: today.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: "pending"
        };
        
        await apiRequest("POST", "/api/invoices", invoiceData);
        
        toast({
          title: "Invoice generated",
          description: `Invoice #${invoiceNumber} has been created for this reading.`,
        });
      }
      
      toast({
        title: "Reading recorded",
        description: "Meter reading has been recorded successfully.",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving meter reading:", error);
      toast({
        title: "Error",
        description: "Failed to save meter reading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Meter Reading</DialogTitle>
          <DialogDescription>
            Record a new reading for meter {meterId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="meterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter ID</FormLabel>
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
                  name="readingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Reading (kL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      {previousReading > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Previous reading: {previousReading} kL
                        </p>
                      )}
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
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any observations about the meter reading"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="generateInvoice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Generate invoice immediately</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This will create an invoice based on the current reading
                      </p>
                    </div>
                  </FormItem>
                )}
              />

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
                      Saving...
                    </>
                  ) : (
                    "Save Reading"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
