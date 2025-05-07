import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface ChartData {
  labels: string[];
  datasets: {
    name: string;
    values: number[];
    color: string;
  }[];
}

interface RevenueChartProps {
  data: ChartData;
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading = false }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Revenue Analysis</CardTitle>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-[280px]">
            <div className="relative w-full h-full">
              {/* Chart legend */}
              <div className="absolute top-0 right-0 flex items-center space-x-4">
                {data.datasets.map((dataset, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: dataset.color }}
                    ></div>
                    <span className="text-xs text-gray-600">{dataset.name}</span>
                  </div>
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-8 bottom-10 w-14 flex flex-col justify-between text-xs text-gray-500">
                {[...Array(5)].map((_, i) => {
                  const maxValue = Math.max(...data.datasets.flatMap(d => d.values));
                  const value = maxValue - (i * (maxValue / 4));
                  return (
                    <span key={i}>{formatCurrency(value)}</span>
                  );
                })}
              </div>
              
              {/* Horizontal grid lines */}
              <div className="absolute left-16 right-0 top-8 bottom-10 flex flex-col justify-between">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="border-b border-gray-200 w-full h-0"
                  />
                ))}
              </div>
              
              {/* Chart lines */}
              <div className="absolute left-16 right-0 top-8 bottom-10">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  {data.datasets.map((dataset, datasetIndex) => {
                    const maxValue = Math.max(...data.datasets.flatMap(d => d.values));
                    const points = dataset.values.map((value, i) => {
                      const x = (i / (dataset.values.length - 1)) * 100;
                      const y = 100 - ((value / maxValue) * 100);
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <polyline
                        key={datasetIndex}
                        points={points}
                        fill="none"
                        stroke={dataset.color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute left-16 right-0 bottom-0 h-10 flex justify-between items-center">
                {data.labels.map((label, i) => (
                  <div key={i} className="text-xs text-gray-500">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
