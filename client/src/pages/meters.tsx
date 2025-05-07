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
import { MeterTable } from "@/components/meters/MeterTable";
import { MeterForm } from "@/components/meters/MeterForm";
import { ReadingForm } from "@/components/meters/ReadingForm";
import { useQuery } from "@tanstack/react-query";
import { meterTypes, meterStatuses } from "@/lib/data";

export default function Meters() {
  const [showMeterModal, setShowMeterModal] = React.useState(false);
  const [showReadingModal, setShowReadingModal] = React.useState(false);
  const [selectedMeterId, setSelectedMeterId] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const { refetch } = useQuery({
    queryKey: ['/api/meters'],
    // The actual query function is in the MeterTable component
  });

  const handleMeterAdded = () => {
    refetch();
  };

  const handleAddReading = () => {
    setShowReadingModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Water Meters</h1>
          <p className="text-muted-foreground">
            Manage water meters and track consumption data.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button variant="outline" onClick={handleAddReading}>
            Add Reading
          </Button>
          <Button onClick={() => setShowMeterModal(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Meter
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meters..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {meterTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  {meterStatuses.map((status) => (
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

      {/* Meter Table */}
      <MeterTable onViewReadings={(meterId) => {
        setSelectedMeterId(meterId);
        setShowReadingModal(true);
      }} />

      {/* Add Meter Modal */}
      <MeterForm
        open={showMeterModal}
        onOpenChange={setShowMeterModal}
        onSuccess={handleMeterAdded}
      />

      {/* Add Reading Modal */}
      {showReadingModal && (
        <ReadingForm
          open={showReadingModal}
          onOpenChange={setShowReadingModal}
          meterId={selectedMeterId}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
