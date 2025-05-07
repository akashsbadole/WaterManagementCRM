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
import { getStatusColor, formatDate } from "@/lib/utils";
import { MoreHorizontal, Eye, Edit, Trash, AlertCircle, BarChart2 } from "lucide-react";
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
import { MeterForm } from "./MeterForm";
import { ReadingForm } from "./ReadingForm";

interface WaterMeter {
  id: number;
  meterId: string;
  customerId: string;
  type: string;
  location: string;
  installationDate: string;
  initialReading: string;
  status: string;
  createdAt: string;
}

interface Customer {
  id: number;
  customerId: string;
  firstName: string;
  lastName: string;
}

interface MeterTableProps {
  onViewReadings?: (meterId: string) => void;
}

export function MeterTable({ onViewReadings }: MeterTableProps) {
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showReadingModal, setShowReadingModal] = React.useState(false);
  const [selectedMeter, setSelectedMeter] = React.useState<WaterMeter | null>(null);
  
  const { data: meters, isLoading: isLoadingMeters, isError: isMeterError, refetch: refetchMeters } = useQuery({
    queryKey: ['/api/meters'],
    queryFn: async () => {
      const response = await fetch('/api/meters');
      if (!response.ok) {
        throw new Error('Failed to fetch meters');
      }
      return response.json();
    }
  });

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

  // Get latest readings for each meter
  const { data: readings, isLoading: isLoadingReadings } = useQuery({
    queryKey: ['/api/readings'],
    queryFn: async () => {
      const response = await fetch('/api/readings');
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      return response.json();
    }
  });

  // Helper to get customer name
  const getCustomerName = (customerId: string) => {
    if (!customers || isLoadingCustomers) return "Loading...";
    const customer = customers.find((c: Customer) => c.customerId === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown";
  };

  // Get the latest reading for a meter
  const getLatestReading = (meterId: string) => {
    if (!readings || isLoadingReadings) return null;
    
    const meterReadings = readings.filter((r: any) => r.meterId === meterId);
    if (meterReadings.length === 0) return null;
    
    return meterReadings.sort((a: any, b: any) => {
      return new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime();
    })[0];
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedMeter) return;
    
    try {
      await apiRequest("DELETE", `/api/meters/${selectedMeter.id}`);
      toast({
        title: "Water meter deleted",
        description: "The water meter has been deleted successfully.",
      });
      refetchMeters();
    } catch (error) {
      console.error("Error deleting water meter:", error);
      toast({
        title: "Error",
        description: "Failed to delete water meter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteAlert(false);
    }
  };

  // Handle view readings
  const handleViewReadings = (meterId: string) => {
    if (onViewReadings) {
      onViewReadings(meterId);
    } else {
      toast({
        title: "View readings",
        description: `Viewing readings for Meter ID: ${meterId}`,
      });
    }
  };

  // Handle edit
  const handleEdit = (meter: WaterMeter) => {
    setSelectedMeter(meter);
    setShowEditModal(true);
  };

  // Handle add reading
  const handleAddReading = (meter: WaterMeter) => {
    setSelectedMeter(meter);
    setShowReadingModal(true);
  };

  // Confirmation before delete
  const confirmDelete = (meter: WaterMeter) => {
    setSelectedMeter(meter);
    setShowDeleteAlert(true);
  };

  const isLoading = isLoadingMeters || isLoadingCustomers || isLoadingReadings;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isMeterError) {
    return (
      <div className="w-full flex flex-col items-center justify-center my-12 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Error loading water meters</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was a problem fetching the water meter data.
        </p>
        <Button onClick={() => refetchMeters()}>Try Again</Button>
      </div>
    );
  }

  const meterData: WaterMeter[] = meters || [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meter ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Reading</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meterData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No meters found</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a new water meter to get started.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              meterData.map((meter) => {
                const latestReading = getLatestReading(meter.meterId);
                return (
                  <TableRow key={meter.id}>
                    <TableCell className="font-medium">{meter.meterId}</TableCell>
                    <TableCell>
                      <div className="font-medium">{getCustomerName(meter.customerId)}</div>
                      <div className="text-sm text-muted-foreground">{meter.customerId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="capitalize">{meter.type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{meter.location}</div>
                    </TableCell>
                    <TableCell>
                      {latestReading ? (
                        <>
                          <div className="font-medium">{latestReading.reading} kL</div>
                          <div className="text-sm text-muted-foreground">{formatDate(latestReading.readingDate)}</div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">No readings</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(meter.status)}>
                        {meter.status.charAt(0).toUpperCase() + meter.status.slice(1)}
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
                          <DropdownMenuItem onClick={() => handleViewReadings(meter.meterId)}>
                            <BarChart2 className="mr-2 h-4 w-4" />
                            <span>Readings</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddReading(meter)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Add Reading</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(meter)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDelete(meter)} className="text-destructive focus:text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Meter Modal */}
      {selectedMeter && (
        <MeterForm
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={refetchMeters}
          initialData={selectedMeter}
          isEditing={true}
        />
      )}

      {/* Add Reading Modal */}
      {selectedMeter && (
        <ReadingForm
          open={showReadingModal}
          onOpenChange={setShowReadingModal}
          meterId={selectedMeter.meterId}
          onSuccess={refetchMeters}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the water meter
              {selectedMeter && ` ${selectedMeter.meterId}`}.
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
