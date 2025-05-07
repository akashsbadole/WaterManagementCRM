import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, DropletIcon, AlertTriangle, DollarSign, BarChart3, BarChart } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ConsumptionChart } from "@/components/dashboard/ConsumptionChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentCustomers, RecentInvoices, AreaConsumption } from "@/components/dashboard/RecentActivity";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function Dashboard() {
  // Fetch dashboard data
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

  // Prepare data for consumption chart
  const consumptionChartData = React.useMemo(() => {
    if (!dashboardData) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    }

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels,
      values: dashboardData.monthlyConsumption || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
  }, [dashboardData]);

  // Prepare data for revenue chart
  const revenueChartData = React.useMemo(() => {
    // Sample revenue data for demonstration
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          name: 'Revenue',
          values: [30000, 45000, 47000, 55000, 60000, 65000],
          color: '#1976D2'
        },
        {
          name: 'Expenses',
          values: [20000, 25000, 30000, 35000, 30000, 40000],
          color: '#29B6F6'
        }
      ]
    };
  }, []);

  // Prepare data for area consumption
  const areaConsumptionData = React.useMemo(() => {
    if (!dashboardData || !dashboardData.areaConsumption) {
      return [
        { zone: 'North Zone', consumption: 0, percentage: 0, color: '#1976D2' },
        { zone: 'South Zone', consumption: 0, percentage: 0, color: '#29B6F6' },
        { zone: 'East Zone', consumption: 0, percentage: 0, color: '#0D47A1' },
        { zone: 'West Zone', consumption: 0, percentage: 0, color: '#03A9F4' }
      ];
    }

    const totalConsumption = dashboardData.areaConsumption.reduce(
      (sum: number, area: any) => sum + area.consumption, 0
    );

    const colors = ['#1976D2', '#29B6F6', '#0D47A1', '#03A9F4'];

    return dashboardData.areaConsumption.map((area: any, index: number) => ({
      zone: area.zone,
      consumption: area.consumption,
      percentage: totalConsumption > 0 
        ? Math.round((area.consumption / totalConsumption) * 100) 
        : 0,
      color: colors[index % colors.length]
    }));
  }, [dashboardData]);

  // Recent customers data
  const recentCustomersData = React.useMemo(() => {
    if (isLoading || !dashboardData) {
      return [];
    }

    // This would be populated from dashboardData in a real implementation
    return [
      {
        id: 1,
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        addedOn: '2023-06-15',
      },
      {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        addedOn: '2023-06-10',
      },
      {
        id: 3,
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        addedOn: '2023-06-08',
      },
      {
        id: 4,
        name: 'Neha Singh',
        email: 'neha.singh@example.com',
        addedOn: '2023-06-05',
      }
    ];
  }, [dashboardData, isLoading]);

  // Recent invoices data
  const recentInvoicesData = React.useMemo(() => {
    if (isLoading || !dashboardData || !dashboardData.recentInvoices) {
      return [];
    }

    return dashboardData.recentInvoices.map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: parseFloat(invoice.totalAmount),
      dueDate: invoice.dueDate,
      status: invoice.status
    }));
  }, [dashboardData, isLoading]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your water management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={formatNumber(dashboardData?.totalCustomers || 0)}
          icon={<Users className="h-full w-full" />}
          change={{
            value: "4.7%",
            trend: "up",
            label: "vs last month"
          }}
        />
        <StatsCard
          title="Water Consumption"
          value={`${formatNumber(dashboardData?.totalConsumption || 0)} kL`}
          icon={<DropletIcon className="h-full w-full" />}
          change={{
            value: "2.3%",
            trend: "down",
            label: "vs last month"
          }}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Pending Payments"
          value={formatCurrency(dashboardData?.pendingAmount || 0)}
          icon={<AlertTriangle className="h-full w-full" />}
          change={{
            value: "8.4%",
            trend: "up",
            label: "vs last month"
          }}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-100"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(dashboardData?.totalRevenue || 0)}
          icon={<DollarSign className="h-full w-full" />}
          change={{
            value: "12.8%",
            trend: "up",
            label: "vs last month"
          }}
          iconColor="text-green-500"
          iconBgColor="bg-green-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConsumptionChart data={consumptionChartData} isLoading={isLoading} />
        </div>
        <div>
          <RevenueChart data={revenueChartData} isLoading={isLoading} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentCustomers customers={recentCustomersData} isLoading={isLoading} />
        <RecentInvoices invoices={recentInvoicesData} isLoading={isLoading} />
        <AreaConsumption data={areaConsumptionData} isLoading={isLoading} />
      </div>
    </div>
  );
}
