import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  BarChart2, 
  PieChart,
  LineChart,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { zones } from "@/lib/data";

// Custom components for the report page
const ConsumptionByZoneChart = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  const colors = ['#1E88E5', '#42A5F5', '#90CAF9', '#BBDEFB']; // Blue shades
  
  // Calculate total for percentages
  const total = data.reduce((sum: number, zone: any) => sum + zone.consumption, 0);
  
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 flex">
        <div className="w-1/2 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((zone: any, i: number) => {
              // Calculate percentage and angles for the pie slice
              const percentage = total > 0 ? (zone.consumption / total) * 100 : 0;
              const startAngle = i > 0 ? 
                data.slice(0, i).reduce((sum: number, z: any) => sum + (z.consumption / total) * 360, 0) : 0;
              const endAngle = startAngle + (percentage * 3.6); // 3.6 = 360/100
              
              // Convert angles to radians
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              
              // Calculate path points
              const x1 = 50 + 40 * Math.cos(startRad);
              const y1 = 50 + 40 * Math.sin(startRad);
              const x2 = 50 + 40 * Math.cos(endRad);
              const y2 = 50 + 40 * Math.sin(endRad);
              
              // Create path
              const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(" ");
              
              return (
                <path 
                  key={i} 
                  d={pathData} 
                  fill={colors[i % colors.length]} 
                  stroke="#fff" 
                  strokeWidth="0.5"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
        </div>
        <div className="w-1/2 flex flex-col justify-center space-y-4 pl-6">
          {data.map((zone: any, i: number) => {
            const percentage = total > 0 ? ((zone.consumption / total) * 100).toFixed(1) : "0";
            return (
              <div key={i} className="flex items-center">
                <div 
                  className="w-4 h-4 mr-2 rounded-sm"
                  style={{ backgroundColor: colors[i % colors.length] }}
                ></div>
                <div>
                  <p className="text-sm font-medium">{zone.zone}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(zone.consumption)} kL ({percentage}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ConsumptionTrendChart = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.values);
  
  return (
    <div className="h-80 pt-4 pb-6">
      <div className="relative w-full h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-10 w-16 flex flex-col justify-between text-xs text-gray-500">
          <span>{formatNumber(maxValue)}</span>
          <span>{formatNumber(maxValue * 0.75)}</span>
          <span>{formatNumber(maxValue * 0.5)}</span>
          <span>{formatNumber(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Horizontal grid lines */}
        <div className="absolute left-16 right-0 top-0 bottom-10 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-gray-200 w-full h-0"></div>
          ))}
        </div>
        
        {/* Bars */}
        <div className="absolute left-16 right-0 top-0 bottom-10 flex items-end">
          <div className="w-full flex justify-between items-end h-full px-2">
            {data.values.map((value: number, i: number) => {
              const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full max-w-[40px] bg-primary rounded-t-sm transition-all duration-500"
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                  <span className="text-xs mt-2 text-gray-500">{data.labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const TopConsumersTable = ({ consumers, isLoading }: { consumers: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!consumers || consumers.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No data available</h3>
        <p className="text-sm text-muted-foreground">
          There is no consumption data to display for this period.
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meter ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {consumers.map((consumer, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="font-medium">{consumer.name}</div>
                <div className="text-xs text-gray-500">{consumer.customerId}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {consumer.meterId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {consumer.zone}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                {formatNumber(consumer.consumption)} kL
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <span className={`text-xs font-medium ${consumer.change > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {consumer.change > 0 ? '+' : ''}{consumer.change}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RevenueOverviewCard = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Revenue Overview</CardTitle>
        <CardDescription>Current month vs previous month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current Month</p>
            <p className="text-2xl font-bold">{formatCurrency(data.current)}</p>
            <div className="flex items-center text-xs">
              <span className={`font-medium ${data.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.percentChange >= 0 ? '+' : ''}{data.percentChange}%
              </span>
              <span className="text-muted-foreground ml-1">vs previous month</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Year to Date</p>
            <p className="text-2xl font-bold">{formatCurrency(data.ytd)}</p>
            <div className="flex items-center text-xs">
              <span className={`font-medium ${data.ytdPercentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {data.ytdPercentChange >= 0 ? '+' : ''}{data.ytdPercentChange}%
              </span>
              <span className="text-muted-foreground ml-1">vs last year</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InvoiceStatsCard = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Invoice Statistics</CardTitle>
        <CardDescription>Current month overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{data.total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-xl font-bold text-green-500">{data.paid}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-yellow-500">{data.pending}</p>
          </div>
        </div>
        
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(data.paid / data.total) * 100}%` }}></div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Payment Rate</span>
          <span>{Math.round((data.paid / data.total) * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("consumption");
  
  // Fetch dashboard data for reports
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    }
  });
  
  // Sample data for the consumption by zone chart
  const consumptionByZoneData = React.useMemo(() => {
    if (!dashboardData || !dashboardData.areaConsumption) {
      return zones.map(zone => ({
        zone,
        consumption: 0
      }));
    }
    return dashboardData.areaConsumption;
  }, [dashboardData]);

  // Sample data for the consumption trend chart
  const consumptionTrendData = React.useMemo(() => {
    if (!dashboardData || !dashboardData.monthlyConsumption) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: dashboardData.monthlyConsumption
    };
  }, [dashboardData]);

  // Sample data for top consumers
  const topConsumersData = React.useMemo(() => {
    // In a real implementation, this would come from the API
    return [
      { name: "Rahul Sharma", customerId: "CUS-1001", meterId: "M-1245", zone: "South Zone", consumption: 5432, change: 8.2 },
      { name: "Priya Patel", customerId: "CUS-1002", meterId: "M-1453", zone: "North Zone", consumption: 7890, change: 12.5 },
      { name: "Arjun Mehta", customerId: "CUS-1003", meterId: "M-1123", zone: "East Zone", consumption: 3210, change: -5.3 },
      { name: "Vikram Singh", customerId: "CUS-1004", meterId: "M-1567", zone: "West Zone", consumption: 4567, change: -2.1 },
      { name: "Neha Gupta", customerId: "CUS-1005", meterId: "M-1340", zone: "South Zone", consumption: 6789, change: 7.8 }
    ];
  }, []);

  // Sample data for revenue overview
  const revenueData = React.useMemo(() => {
    return {
      current: 732150,
      previous: 645320,
      percentChange: 13.5,
      ytd: 4328750,
      ytdPercentChange: 8.2
    };
  }, []);

  // Sample data for invoice statistics
  const invoiceStatsData = React.useMemo(() => {
    return {
      total: 153,
      paid: 124,
      pending: 29
    };
  }, []);

  const handleExport = () => {
    // In a real implementation, this would export the report data
    alert("Exporting report data...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze water consumption and revenue data.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={dateRange}
                onValueChange={setDateRange}
              >
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={zoneFilter}
                onValueChange={setZoneFilter}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select zone" />
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
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." className="pl-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="consumption" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-4 w-full sm:w-auto">
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Consumption</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="area" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Area Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Consumption Reports */}
        <TabsContent value="consumption" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consumption Trend</CardTitle>
                <CardDescription>Monthly water consumption for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <ConsumptionTrendChart data={consumptionTrendData} isLoading={isLoading} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Consumers</CardTitle>
                <CardDescription>Customers with highest consumption</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <TopConsumersTable consumers={topConsumersData} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Consumption Overview</CardTitle>
              <CardDescription>
                Total consumption: <strong>{formatNumber(dashboardData?.totalConsumption || 0)} kL</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Consumption data is aggregated from all water meters in the selected period.
                The chart shows the total water usage across different months.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Average Daily</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatNumber((dashboardData?.totalConsumption || 0) / 30)} kL
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">Average Per Customer</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatNumber(dashboardData?.totalCustomers ? (dashboardData?.totalConsumption || 0) / dashboardData?.totalCustomers : 0)} kL
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">Peak Day</p>
                  <p className="text-xl font-bold text-purple-900">June 15</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">Year-over-Year</p>
                  <p className="text-xl font-bold text-yellow-900">+8.3%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Reports */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevenueOverviewCard data={revenueData} isLoading={isLoading} />
            <InvoiceStatsCard data={invoiceStatsData} isLoading={isLoading} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Monthly revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(732150)}</p>
                      </div>
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <line x1="12" y1="2" x2="12" y2="22"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-green-500 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                          <polyline points="16 7 22 7 22 13"></polyline>
                        </svg>
                        16%
                      </span>
                      <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Outstanding Amount</p>
                        <p className="text-2xl font-bold">{formatCurrency(183240)}</p>
                      </div>
                      <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                          <path d="M2 8h20M2 12h20M2 16h20"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-red-500 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                          <polyline points="16 17 22 17 22 11"></polyline>
                        </svg>
                        5%
                      </span>
                      <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Collection Rate</p>
                        <p className="text-2xl font-bold">78.5%</p>
                      </div>
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-green-500 font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                          <polyline points="16 7 22 7 22 13"></polyline>
                        </svg>
                        3.2%
                      </span>
                      <span className="text-gray-500 ml-2">from last month</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-base font-medium mb-4">Invoice Status Distribution</h3>
                  <div className="flex space-x-4">
                    <div className="w-2/3">
                      <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div className="flex h-full">
                          <div className="bg-green-500 h-full" style={{ width: "65%" }}></div>
                          <div className="bg-yellow-500 h-full" style={{ width: "20%" }}></div>
                          <div className="bg-red-500 h-full" style={{ width: "15%" }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-1/3 flex flex-col justify-center space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                          <span className="text-xs">Paid</span>
                        </div>
                        <span className="text-xs font-medium">65%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
                          <span className="text-xs">Pending</span>
                        </div>
                        <span className="text-xs font-medium">20%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
                          <span className="text-xs">Overdue</span>
                        </div>
                        <span className="text-xs font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Area Analysis */}
        <TabsContent value="area" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consumption by Zone</CardTitle>
              <CardDescription>Distribution of water consumption across different zones</CardDescription>
            </CardHeader>
            <CardContent>
              <ConsumptionByZoneChart data={consumptionByZoneData} isLoading={isLoading} />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Zone Comparison</CardTitle>
                <CardDescription>Average daily consumption by zone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {zones.map((zone, index) => {
                    const values = [178, 145, 132, 120]; // Sample values
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{zone}</span>
                          <span className="text-sm font-medium">{values[index]} kL/day</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(values[index] / Math.max(...values)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Zone Efficiency</CardTitle>
                <CardDescription>Water usage efficiency rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {zones.map((zone, index) => {
                    const ratings = ["A+", "B", "A", "C"]; // Sample ratings
                    const colors = ["bg-green-500", "bg-yellow-500", "bg-green-400", "bg-orange-400"];
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-gray-200">
                          <span className={`text-xl font-bold ${colors[index].replace('bg-', 'text-').replace('-500', '-700').replace('-400', '-600')}`}>
                            {ratings[index]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{zone}</p>
                          <p className="text-sm text-muted-foreground">
                            {index % 2 === 0 ? "Excellent efficiency" : "Needs improvement"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
