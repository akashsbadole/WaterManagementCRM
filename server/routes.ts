import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCustomerSchema, 
  insertWaterMeterSchema, 
  insertMeterReadingSchema, 
  insertInvoiceSchema, 
  insertPaymentSchema,
  insertCustomerDocumentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.status(200).json({ 
        id: user.id, 
        username: user.username, 
        name: user.name,
        email: user.email,
        role: user.role 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving customers" });
    }
  });

  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving customer" });
    }
  });

  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const validatedCustomer = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedCustomer);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const existingCustomer = await storage.getCustomer(id);
      if (!existingCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      const updatedCustomer = await storage.updateCustomer(id, req.body);
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ message: "Error updating customer" });
    }
  });

  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting customer" });
    }
  });

  // Water Meter routes
  app.get("/api/meters", async (req: Request, res: Response) => {
    try {
      const meters = await storage.getWaterMeters();
      res.status(200).json(meters);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving water meters" });
    }
  });

  app.get("/api/meters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const meter = await storage.getWaterMeter(id);
      if (!meter) {
        return res.status(404).json({ message: "Water meter not found" });
      }

      res.status(200).json(meter);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving water meter" });
    }
  });

  app.get("/api/customers/:customerId/meters", async (req: Request, res: Response) => {
    try {
      const customerId = req.params.customerId;
      const meters = await storage.getWaterMetersByCustomerId(customerId);
      res.status(200).json(meters);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving water meters" });
    }
  });

  app.post("/api/meters", async (req: Request, res: Response) => {
    try {
      const validatedMeter = insertWaterMeterSchema.parse(req.body);
      
      // Check if customer exists
      const customer = await storage.getCustomerByCustomerId(validatedMeter.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const meter = await storage.createWaterMeter(validatedMeter);
      res.status(201).json(meter);
    } catch (error) {
      res.status(400).json({ message: "Invalid water meter data" });
    }
  });

  app.put("/api/meters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const existingMeter = await storage.getWaterMeter(id);
      if (!existingMeter) {
        return res.status(404).json({ message: "Water meter not found" });
      }

      const updatedMeter = await storage.updateWaterMeter(id, req.body);
      res.status(200).json(updatedMeter);
    } catch (error) {
      res.status(400).json({ message: "Error updating water meter" });
    }
  });

  app.delete("/api/meters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const meter = await storage.getWaterMeter(id);
      if (!meter) {
        return res.status(404).json({ message: "Water meter not found" });
      }

      await storage.deleteWaterMeter(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting water meter" });
    }
  });

  // Meter Reading routes
  app.get("/api/readings", async (req: Request, res: Response) => {
    try {
      const readings = await storage.getMeterReadings();
      res.status(200).json(readings);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving meter readings" });
    }
  });

  app.get("/api/meters/:meterId/readings", async (req: Request, res: Response) => {
    try {
      const meterId = req.params.meterId;
      const readings = await storage.getMeterReadingsByMeterId(meterId);
      res.status(200).json(readings);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving meter readings" });
    }
  });

  app.post("/api/readings", async (req: Request, res: Response) => {
    try {
      const validatedReading = insertMeterReadingSchema.parse(req.body);
      
      // Check if meter exists
      const meter = await storage.getWaterMeterByMeterId(validatedReading.meterId);
      if (!meter) {
        return res.status(404).json({ message: "Water meter not found" });
      }
      
      const reading = await storage.createMeterReading(validatedReading);
      res.status(201).json(reading);
    } catch (error) {
      res.status(400).json({ message: "Invalid meter reading data" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getInvoices();
      res.status(200).json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.status(200).json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving invoice" });
    }
  });

  app.get("/api/customers/:customerId/invoices", async (req: Request, res: Response) => {
    try {
      const customerId = req.params.customerId;
      const invoices = await storage.getInvoicesByCustomerId(customerId);
      res.status(200).json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving invoices" });
    }
  });

  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const validatedInvoice = insertInvoiceSchema.parse(req.body);
      
      // Check if customer exists
      const customer = await storage.getCustomerByCustomerId(validatedInvoice.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Check if meter exists
      const meter = await storage.getWaterMeterByMeterId(validatedInvoice.meterId);
      if (!meter) {
        return res.status(404).json({ message: "Water meter not found" });
      }
      
      const invoice = await storage.createInvoice(validatedInvoice);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  app.put("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const existingInvoice = await storage.getInvoice(id);
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const updatedInvoice = await storage.updateInvoice(id, req.body);
      res.status(200).json(updatedInvoice);
    } catch (error) {
      res.status(400).json({ message: "Error updating invoice" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getPayments();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving payments" });
    }
  });

  app.get("/api/invoices/:invoiceNumber/payments", async (req: Request, res: Response) => {
    try {
      const invoiceNumber = req.params.invoiceNumber;
      const payments = await storage.getPaymentsByInvoiceNumber(invoiceNumber);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving payments" });
    }
  });

  app.get("/api/customers/:customerId/payments", async (req: Request, res: Response) => {
    try {
      const customerId = req.params.customerId;
      const payments = await storage.getPaymentsByCustomerId(customerId);
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving payments" });
    }
  });

  app.post("/api/payments", async (req: Request, res: Response) => {
    try {
      const validatedPayment = insertPaymentSchema.parse(req.body);
      
      // Check if invoice exists
      const invoice = await storage.getInvoiceByInvoiceNumber(validatedPayment.invoiceNumber);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // Check if customer exists
      const customer = await storage.getCustomerByCustomerId(validatedPayment.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const payment = await storage.createPayment(validatedPayment);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Customer Document routes
  app.get("/api/customers/:customerId/documents", async (req: Request, res: Response) => {
    try {
      const customerId = req.params.customerId;
      const documents = await storage.getCustomerDocuments(customerId);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving documents" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const validatedDocument = insertCustomerDocumentSchema.parse(req.body);
      
      // Check if customer exists
      const customer = await storage.getCustomerByCustomerId(validatedDocument.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const document = await storage.createCustomerDocument(validatedDocument);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data" });
    }
  });

  // Dashboard data route
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers();
      const meters = await storage.getWaterMeters();
      const readings = await storage.getMeterReadings();
      const invoices = await storage.getInvoices();
      const payments = await storage.getPayments();
      
      // Calculate total water consumption
      const totalConsumption = readings.reduce((sum, reading) => {
        return sum + Number(reading.consumption);
      }, 0);
      
      // Calculate pending payments
      const pendingAmount = invoices
        .filter(invoice => invoice.status === "pending" || invoice.status === "overdue")
        .reduce((sum, invoice) => {
          return sum + Number(invoice.totalAmount);
        }, 0);
      
      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, payment) => {
        return sum + Number(payment.amount);
      }, 0);
      
      // Get recent invoices (last 5)
      const recentInvoices = invoices
        .sort((a, b) => {
          const dateA = new Date(a.issueDate).getTime();
          const dateB = new Date(b.issueDate).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      
      // Calculate monthly consumption for charts
      const monthlyConsumption = calculateMonthlyConsumption(readings);
      
      // Calculate area-wise consumption
      const areaConsumption = calculateAreaConsumption(meters, readings, customers);
      
      res.status(200).json({
        totalCustomers: customers.length,
        totalConsumption,
        pendingAmount,
        totalRevenue,
        recentInvoices,
        monthlyConsumption,
        areaConsumption
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving dashboard data" });
    }
  });

  // Helper function to calculate monthly consumption
  function calculateMonthlyConsumption(readings: any[]) {
    const currentYear = new Date().getFullYear();
    const months = Array(12).fill(0);
    
    readings.forEach(reading => {
      const readingDate = new Date(reading.readingDate);
      if (readingDate.getFullYear() === currentYear) {
        const month = readingDate.getMonth();
        months[month] += Number(reading.consumption);
      }
    });
    
    return months;
  }

  // Helper function to calculate area-wise consumption
  function calculateAreaConsumption(meters: any[], readings: any[], customers: any[]) {
    const areaConsumption: { [key: string]: number } = {};
    
    // Initialize with zones
    const zones = ["North Zone", "South Zone", "East Zone", "West Zone"];
    zones.forEach(zone => {
      areaConsumption[zone] = 0;
    });
    
    // Calculate consumption by zone
    readings.forEach(reading => {
      const meter = meters.find(m => m.meterId === reading.meterId);
      if (meter) {
        const customer = customers.find(c => c.customerId === meter.customerId);
        if (customer) {
          const zone = customer.zone;
          areaConsumption[zone] = (areaConsumption[zone] || 0) + Number(reading.consumption);
        }
      }
    });
    
    return Object.entries(areaConsumption).map(([zone, consumption]) => ({
      zone,
      consumption
    }));
  }

  const httpServer = createServer(app);
  return httpServer;
}
