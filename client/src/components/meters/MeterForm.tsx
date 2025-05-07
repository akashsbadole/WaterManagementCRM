import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { defaultWaterMeter, meterTypes, meterStatuses } from "@/lib/data";
import { generateMeterId } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Form schema
const formSchema = z.object({
  meterId: z.string().min(1, "Meter ID is required"),
  customerId: z.string().min(1, "Customer is required"),
  type: z.string().min(1, "Meter type is required"),
  location: z.string().min(1, "Location is required"),
  installationDate: z.string().min(1, "Installation date is required"),
  initialReading: z.string(),
  status: z.string().min(1, "Status is required"),
});

type MeterFormValues = z.infer<typeof formSchema>;

interface MeterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Partial<MeterFormValues>;
  isEditing?: boolean;
}

export function MeterForm({
  open,
  onOpenChange,
  onSuccess,
  initialData = defaultWaterMeter,
  isEditing = false,
}: MeterFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    },
    enabled: open, // Only fetch when modal is open
  });

  // Initialize form
  const form = useForm<MeterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultWaterMeter,
      ...initialData,
      meterId: initialData.meterId || generateMeterId(),
    },
  });

  // Form submission handler
  const onSubmit = async (data: MeterFormValues) => {
    setIsSubmitting(true);
    try {
      const endpoint = isEditing
        ? `/api/meters/${initialData.id}`
        : "/api/meters";
      const method = isEditing ? "PUT" : "POST";

      await apiRequest(method, endpoint, data);
      toast({
        title: isEditing ? "Water meter updated" : "Water meter created",
        description: isEditing 
          ? "Water meter has been updated successfully"
          : "Water meter has been created successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving water meter:", error);
      toast({
        title: "Error",
        description: "Failed to save water meter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Water Meter" : "Add New Water Meter"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update water meter information"
              : "Add details to register a new water meter"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meter Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={field.disabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meter type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meterTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Location</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="initialReading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Reading (kL)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                      {meterStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                  isEditing ? "Update Meter" : "Save Meter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
