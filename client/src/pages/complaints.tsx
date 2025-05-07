import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generateCustomerId } from "@/lib/utils";

// Define complaint form schema
const complaintFormSchema = z.object({
  complaintId: z.string().optional(),
  customerId: z.string().min(1, "Customer ID is required"),
  meterId: z.string().optional(),
  category: z.enum(["water_quality", "leakage", "billing", "meter", "service", "other"], {
    required_error: "Please select a category",
  }),
  subject: z.string().min(3, "Subject is required"),
  description: z.string().min(10, "Description is required"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a priority",
  }),
  status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).default("open"),
  assignedTo: z.string().optional(),
});

type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

export default function Complaints() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Fetch complaints
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["/api/complaints"],
    select: (data) => {
      return data.filter((complaint: any) => {
        const matchesSearch = searchTerm === "" || 
          complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || complaint.status === filterStatus;
        const matchesCategory = filterCategory === "all" || complaint.category === filterCategory;
        
        return matchesSearch && matchesStatus && matchesCategory;
      });
    }
  });

  // Fetch customers for dropdown
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Create complaint mutation
  const createComplaint = useMutation({
    mutationFn: (data: ComplaintFormValues) =>
      apiRequest("/api/complaints", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Complaint submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit complaint",
        variant: "destructive",
      });
    },
  });

  // Form definition for creating complaint
  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      complaintId: `CMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      priority: "medium",
      status: "open",
    },
  });

  // Handle form submission
  function onSubmit(data: ComplaintFormValues) {
    createComplaint.mutate(data);
  }

  // Status badge component with proper coloring
  const StatusBadge = ({ status }: { status: string }) => {
    let color = "";
    switch (status) {
      case "open":
        color = "bg-blue-200 hover:bg-blue-300 text-blue-800";
        break;
      case "assigned":
        color = "bg-purple-200 hover:bg-purple-300 text-purple-800";
        break;
      case "in_progress":
        color = "bg-yellow-200 hover:bg-yellow-300 text-yellow-800";
        break;
      case "resolved":
        color = "bg-green-200 hover:bg-green-300 text-green-800";
        break;
      case "closed":
        color = "bg-gray-200 hover:bg-gray-300 text-gray-800";
        break;
      default:
        color = "bg-gray-200 hover:bg-gray-300 text-gray-800";
    }
    return <Badge className={color}>{status.replace("_", " ")}</Badge>;
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    let color = "";
    switch (priority) {
      case "low":
        color = "bg-gray-200 hover:bg-gray-300 text-gray-800";
        break;
      case "medium":
        color = "bg-blue-200 hover:bg-blue-300 text-blue-800";
        break;
      case "high":
        color = "bg-orange-200 hover:bg-orange-300 text-orange-800";
        break;
      case "critical":
        color = "bg-red-200 hover:bg-red-300 text-red-800";
        break;
      default:
        color = "bg-gray-200 hover:bg-gray-300 text-gray-800";
    }
    return <Badge className={color}>{priority}</Badge>;
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    let color = "";
    let displayName = "";
    
    switch (category) {
      case "water_quality":
        color = "bg-blue-200 hover:bg-blue-300 text-blue-800";
        displayName = "Water Quality";
        break;
      case "leakage":
        color = "bg-cyan-200 hover:bg-cyan-300 text-cyan-800";
        displayName = "Leakage";
        break;
      case "billing":
        color = "bg-yellow-200 hover:bg-yellow-300 text-yellow-800";
        displayName = "Billing";
        break;
      case "meter":
        color = "bg-purple-200 hover:bg-purple-300 text-purple-800";
        displayName = "Meter";
        break;
      case "service":
        color = "bg-green-200 hover:bg-green-300 text-green-800";
        displayName = "Service";
        break;
      case "other":
        color = "bg-gray-200 hover:bg-gray-300 text-gray-800";
        displayName = "Other";
        break;
      default:
        color = "bg-gray-200 hover:bg-gray-300 text-gray-800";
        displayName = category;
    }
    return <Badge className={color}>{displayName}</Badge>;
  };

  // View complaint detail handler
  const handleViewComplaint = (id: number) => {
    setLocation(`/complaint-detail/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Complaint Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Submit New Complaint</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit a Complaint</DialogTitle>
              <DialogDescription>
                Fill in the details below to submit a new complaint.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.customerId}>
                              {customer.customerId} - {customer.firstName} {customer.lastName}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="water_quality">Water Quality</SelectItem>
                          <SelectItem value="leakage">Leakage</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="meter">Meter</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief subject of the complaint" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the issue"
                          className="h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createComplaint.isPending}>
                    {createComplaint.isPending ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="water_quality">Water Quality</SelectItem>
                  <SelectItem value="leakage">Leakage</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="meter">Meter</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading complaints...
                  </TableCell>
                </TableRow>
              ) : complaints?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No complaints found. Create a new complaint to get started.
                  </TableCell>
                </TableRow>
              ) : (
                complaints?.map((complaint: any) => (
                  <TableRow key={complaint.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewComplaint(complaint.id)}>
                    <TableCell>{complaint.complaintId}</TableCell>
                    <TableCell>{complaint.subject}</TableCell>
                    <TableCell>{complaint.customerId}</TableCell>
                    <TableCell><CategoryBadge category={complaint.category} /></TableCell>
                    <TableCell><PriorityBadge priority={complaint.priority} /></TableCell>
                    <TableCell><StatusBadge status={complaint.status} /></TableCell>
                    <TableCell>{new Date(complaint.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleViewComplaint(complaint.id);
                      }}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}