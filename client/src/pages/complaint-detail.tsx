import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Comment form schema
const commentFormSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty"),
  isInternal: z.boolean().default(false),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

// Status update form schema
const statusUpdateFormSchema = z.object({
  status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"], {
    required_error: "Please select a status",
  }),
  assignedTo: z.string().optional(),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateFormSchema>;

export default function ComplaintDetail() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const complaintId = params.id;

  // Fetch complaint details
  const { data: complaint, isLoading } = useQuery({
    queryKey: ["/api/complaints", complaintId],
    queryFn: () => 
      apiRequest(`/api/complaints/${complaintId}`, { method: "GET" }),
    enabled: !!complaintId,
  });

  // Fetch comments for this complaint
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["/api/complaints", complaintId, "comments"],
    queryFn: () => 
      apiRequest(`/api/complaints/${complaint?.complaintId}/comments`, { method: "GET" }),
    enabled: !!complaint?.complaintId,
  });

  // Fetch customers for lookup
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Fetch user data (in a real app, this would be from auth context)
  const currentUserId = 1; // Mock user ID for demo

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: (data: CommentFormValues) =>
      apiRequest(`/api/complaints/${complaint?.complaintId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userId: currentUserId,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints", complaintId, "comments"] });
      commentForm.reset({ comment: "" });
      toast({
        title: "Comment added",
        description: "Your comment has been added to the complaint",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  // Update complaint status mutation
  const updateComplaintStatus = useMutation({
    mutationFn: (data: StatusUpdateFormValues) =>
      apiRequest(`/api/complaints/${complaintId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints", complaintId] });
      toast({
        title: "Status updated",
        description: "Complaint status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      });
    },
  });

  // Comment form
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      comment: "",
      isInternal: false,
    },
  });

  // Status update form
  const statusForm = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateFormSchema),
    defaultValues: {
      status: complaint?.status || "open",
      assignedTo: complaint?.assignedTo || "",
    },
    values: {
      status: complaint?.status || "open",
      assignedTo: complaint?.assignedTo || "",
    },
  });

  // Submit comment form
  function onCommentSubmit(data: CommentFormValues) {
    addComment.mutate(data);
  }

  // Submit status update form
  function onStatusSubmit(data: StatusUpdateFormValues) {
    updateComplaintStatus.mutate(data);
  }

  // Go back to complaints list
  const handleBackClick = () => {
    setLocation("/complaints");
  };

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

  // Find customer name from customerId
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c: any) => c.customerId === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : customerId;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-2xl mb-4">Complaint Not Found</h2>
          <p className="mb-4">The complaint you're looking for does not exist or has been removed.</p>
          <Button onClick={handleBackClick}>Back to Complaints</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={handleBackClick} className="mr-4">
          Back to Complaints
        </Button>
        <h1 className="text-2xl font-bold">Complaint Detail</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Complaint details */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{complaint.subject}</CardTitle>
                  <CardDescription>
                    {complaint.complaintId} | Submitted on{" "}
                    {new Date(complaint.submissionDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <StatusBadge status={complaint.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p>{getCustomerName(complaint.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <CategoryBadge category={complaint.category} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <PriorityBadge priority={complaint.priority} />
                </div>
                {complaint.meterId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Meter ID</p>
                    <p>{complaint.meterId}</p>
                  </div>
                )}
                {complaint.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned To</p>
                    <p>{complaint.assignedTo}</p>
                  </div>
                )}
                {complaint.resolutionDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resolution Date</p>
                    <p>{new Date(complaint.resolutionDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="whitespace-pre-line">{complaint.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comments & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingComments ? (
                <p>Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Add the first comment below.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className={`p-4 rounded-lg ${comment.isInternal ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                      <div className="flex items-start">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>
                            {comment.userId.toString().slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium">
                              User ID: {comment.userId}
                              {comment.isInternal && (
                                <Badge variant="outline" className="ml-2 text-xs">Internal Note</Badge>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm">{comment.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Form {...commentForm}>
                  <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="space-y-4">
                    <FormField
                      control={commentForm.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Add a comment</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Type your comment here..." 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={commentForm.control}
                      name="isInternal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input 
                              type="checkbox" 
                              className="h-4 w-4" 
                              checked={field.value} 
                              onChange={field.onChange} 
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Internal note (only visible to staff)</FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={addComment.isPending}>
                      {addComment.isPending ? "Adding Comment..." : "Add Comment"}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Status Management */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...statusForm}>
                <form onSubmit={statusForm.handleSubmit(onStatusSubmit)} className="space-y-4">
                  <FormField
                    control={statusForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={statusForm.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter employee ID or name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank if not assigned to anyone.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={updateComplaintStatus.isPending}
                  >
                    {updateComplaintStatus.isPending 
                      ? "Updating Status..." 
                      : "Update Status"
                    }
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Complaint Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="pl-4">
                    <p className="font-medium">Complaint Submitted</p>
                    <p className="text-sm text-gray-500">
                      {new Date(complaint.submissionDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                {comments
                  .filter((comment: any) => 
                    // Filter out internal comments if you want to show only public activity
                    // or you can include all for a full timeline
                    !comment.isInternal
                  )
                  .map((comment: any) => (
                    <div key={comment.id} className="relative">
                      <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      </div>
                      <div className="pl-4">
                        <p className="font-medium">Comment Added</p>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                }

                {complaint.resolutionDate && (
                  <div className="relative">
                    <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="pl-4">
                      <p className="font-medium">Complaint Resolved</p>
                      <p className="text-sm text-gray-500">
                        {new Date(complaint.resolutionDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}