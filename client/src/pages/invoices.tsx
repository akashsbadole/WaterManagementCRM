import React from "react";
import { PlusCircle, Search, Filter, Download } from "lucide-react";
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
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { useQuery } from "@tanstack/react-query";
import { invoiceStatuses } from "@/lib/data";

export default function Invoices() {
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("all");

  const { refetch } = useQuery({
    queryKey: ['/api/invoices'],
    // The actual query function is in the InvoiceTable component
  });

  const handleInvoiceAdded = () => {
    refetch();
  };

  const handleExport = () => {
    // In a real implementation, this would export invoices data to CSV/Excel
    alert("Exporting invoices data...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Generate and manage customer invoices for water consumption.
          </p>
        </div>
        <Button onClick={() => setShowInvoiceModal(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                  {invoiceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
                className="flex-1"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleExport} title="Export Invoices">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <InvoiceTable />

      {/* Generate Invoice Modal */}
      <InvoiceForm
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        onSuccess={handleInvoiceAdded}
      />
    </div>
  );
}
