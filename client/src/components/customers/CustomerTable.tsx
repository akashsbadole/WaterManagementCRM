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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import { MoreHorizontal, Eye, Edit, Trash, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CustomerForm } from "./CustomerForm";

interface Customer {
  id: number;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  status: string;
  createdAt: string;
}

export function CustomerTable() {
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      return response.json();
    }
  });

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCustomer) return;
    
    try {
      await apiRequest("DELETE", `/api/customers/${selectedCustomer.id}`);
      toast({
        title: "Customer deleted",
        description: "The customer has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteAlert(false);
    }
  };

  // Handle view
  const handleView = (customer: Customer) => {
    toast({
      title: "Customer details",
      description: `Viewing details for ${customer.firstName} ${customer.lastName}`,
    });
  };

  // Handle edit
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  // Confirmation before delete
  const confirmDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteAlert(true);
  };

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
        <h3 className="text-lg font-medium">Error loading customers</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was a problem fetching the customer data.
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const customers: Customer[] = data || [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No customers found</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a new customer to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.customerId}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>
                          {customer.firstName.charAt(0) + customer.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <div>{customer.zone}</div>
                    <div className="text-sm text-muted-foreground">{customer.city}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
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
                        <DropdownMenuItem onClick={() => handleView(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(customer)} className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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

      {/* Edit Customer Modal */}
      {selectedCustomer && (
        <CustomerForm
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={refetch}
          initialData={selectedCustomer}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer
              {selectedCustomer && ` ${selectedCustomer.firstName} ${selectedCustomer.lastName}`}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
