import React from "react";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { useQuery } from "@tanstack/react-query";
import { zones, customerStatuses } from "@/lib/data";

export default function Customers() {
  const [showCustomerModal, setShowCustomerModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [zoneFilter, setZoneFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { refetch } = useQuery({
    queryKey: ['/api/customers'],
    // The actual query function is in the CustomerTable component
  });

  const handleCustomerAdded = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer information and water meter assignments.
          </p>
        </div>
        <Button onClick={() => setShowCustomerModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select
                value={zoneFilter}
                onValueChange={setZoneFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {customerStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <CustomerTable />

      {/* Add Customer Modal */}
      <CustomerForm
        open={showCustomerModal}
        onOpenChange={setShowCustomerModal}
        onSuccess={handleCustomerAdded}
      />
    </div>
  );
}
