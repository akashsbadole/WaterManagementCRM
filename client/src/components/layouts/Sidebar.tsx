import React from "react";
import { Link, useRoute } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  DollarSign, 
  Settings, 
  Gauge, 
  LifeBuoy,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  onCloseSidebar?: () => void;
}

export function Sidebar({ onCloseSidebar }: SidebarProps) {
  // Check active route
  const [isOnDashboard] = useRoute("/");
  const [isOnCustomers] = useRoute("/customers");
  const [isOnMeters] = useRoute("/meters");
  const [isOnInvoices] = useRoute("/invoices");
  const [isOnPayments] = useRoute("/payments");
  const [isOnReports] = useRoute("/reports");

  // Menu items
  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      href: "/", 
      active: isOnDashboard 
    },
    { 
      name: "Customers", 
      icon: <Users className="h-5 w-5" />, 
      href: "/customers", 
      active: isOnCustomers 
    },
    { 
      name: "Water Meters", 
      icon: <Gauge className="h-5 w-5" />, 
      href: "/meters", 
      active: isOnMeters 
    },
    { 
      name: "Invoices", 
      icon: <FileText className="h-5 w-5" />, 
      href: "/invoices", 
      active: isOnInvoices 
    },
    { 
      name: "Payments", 
      icon: <DollarSign className="h-5 w-5" />, 
      href: "/payments", 
      active: isOnPayments 
    },
    { 
      name: "Reports", 
      icon: <BarChart3 className="h-5 w-5" />, 
      href: "/reports", 
      active: isOnReports 
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div className="flex items-center p-6 border-b border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4.2 6.6v10.8L12 22l7.8-4.6V6.6z"></path>
          <path d="M12 22v-6.4"></path>
          <path d="M12 12.6v-4"></path>
          <path d="M12 2v3.2"></path>
        </svg>
        <h1 className="text-xl font-bold text-primary">AquaCRM</h1>
      </div>

      {/* Menu items */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={onCloseSidebar}
            >
              <a 
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  item.active
                    ? "bg-primary-light/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary-dark"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="px-2 mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Settings
          </h3>
          <div className="mt-2 space-y-1">
            <Link href="/settings">
              <a className="flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-dark">
                <Settings className="h-5 w-5 mr-3 text-gray-400" />
                System Settings
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Support box */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-primary-light/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary-dark">Need help?</h3>
          <p className="mt-1 text-xs text-gray-600">
            Contact our support team for assistance with your water management system.
          </p>
          <Button className="mt-3 w-full text-xs" size="sm">
            <LifeBuoy className="h-4 w-4 mr-2" /> Support
          </Button>
        </div>
      </div>

      {/* User profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/assets/avatar.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs font-medium text-gray-500">Administrator</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
