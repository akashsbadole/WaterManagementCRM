import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layouts/MainLayout";

// Pages
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Meters from "@/pages/meters";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/customers" component={Customers} />
        <Route path="/meters" component={Meters} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/payments" component={Payments} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
