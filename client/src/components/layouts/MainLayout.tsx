import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useMobile();
  const { toast } = useToast();

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const sidebar = document.getElementById("sidebar");
      if (isMobile && sidebar && !sidebar.contains(event.target as Node) && sidebarOpen) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // Handle notification click
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <Sidebar onCloseSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              {/* Mobile menu button */}
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-2"
                >
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search for customers, invoices..." 
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNotificationClick}
                >
                  <Bell className="h-5 w-5" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
                    variant="destructive"
                  >
                    3
                  </Badge>
                </Button>
              </div>

              {/* User avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/assets/avatar.png" alt="Admin User" />
                      <AvatarFallback>AU</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@aquabill.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    System Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-10">
            <div className="flex justify-around">
              <Button variant="ghost" className="flex flex-col h-16 w-full rounded-none" onClick={() => window.location.hash = "#dashboard"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span className="text-xs">Dashboard</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 w-full rounded-none" onClick={() => window.location.hash = "#customers"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-xs">Customers</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 w-full rounded-none" onClick={() => window.location.hash = "#meters"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="M20 12h2" />
                  <path d="M2 12h2" />
                </svg>
                <span className="text-xs">Meters</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 w-full rounded-none" onClick={() => window.location.hash = "#invoices"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-xs">Invoices</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-16 w-full rounded-none" onClick={() => setSidebarOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span className="text-xs">More</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
