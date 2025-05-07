import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/utils";

interface ConsumptionData {
  labels: string[];
  values: number[];
}

interface ConsumptionChartProps {
  data: ConsumptionData;
  isLoading?: boolean;
}

export function ConsumptionChart({ data, isLoading = false }: ConsumptionChartProps) {
  // Function to determine bar height based on value
  const getBarHeight = (value: number, maxValue: number) => {
    if (maxValue === 0) return "0%";
    const heightPercentage = Math.max(5, (value / maxValue) * 100);
    return `${heightPercentage}%`;
  };

  const maxValue = Math.max(...data.values, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Water Consumption Trends</CardTitle>
        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-[280px] flex items-end">
            <div className="relative w-full h-full pt-5">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-10 w-10 flex flex-col justify-between text-xs text-gray-500">
                <span>{formatNumber(maxValue)}</span>
                <span>{formatNumber(maxValue * 0.75)}</span>
                <span>{formatNumber(maxValue * 0.5)}</span>
                <span>{formatNumber(maxValue * 0.25)}</span>
                <span>0</span>
              </div>
              
              {/* Horizontal grid lines */}
              <div className="absolute left-12 right-0 top-0 bottom-10 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="border-b border-gray-200 w-full h-0"
                  />
                ))}
              </div>
              
              {/* Chart bars */}
              <div className="absolute left-12 right-0 top-0 bottom-10 flex items-end">
                <div className="w-full flex justify-between items-end h-full">
                  {data.values.map((value, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 px-1">
                      <div 
                        className="w-full max-w-[40px] bg-primary-light rounded-t-sm transition-all duration-500"
                        style={{ height: getBarHeight(value, maxValue) }}
                      ></div>
                      <span className="text-xs mt-2 text-gray-500">{data.labels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
