import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: {
    value: string;
    trend: "up" | "down";
    label: string;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  iconColor = "text-primary",
  iconBgColor = "bg-primary-light/20"
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", iconBgColor)}>
            <div className={cn("h-5 w-5", iconColor)}>
              {icon}
            </div>
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center">
            <span 
              className={cn(
                "text-sm font-medium flex items-center",
                change.trend === "up" 
                  ? "text-success" 
                  : "text-danger"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mr-1"
              >
                {change.trend === "up" ? (
                  <path
                    fillRule="evenodd"
                    d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M1.22 5.222a.75.75 0 011.06 0L7 9.942l3.768-3.768a.75.75 0 011.113.074 20.948 20.948 0 005.135 4.45l-3.124-.54a.75.75 0 01.586-1.383l4.79.83a.75.75 0 01.588.89l-.83 4.79a.75.75 0 01-1.383-.585l.54-3.125a22.457 22.457 0 01-5.8-4.899L7 11.057 1.72 5.778a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {change.value}
            </span>
            <span className="text-gray-500 text-sm ml-2">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
