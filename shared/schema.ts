import { pgTable, text, serial, integer, boolean, numeric, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role").default("customer"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

// Customer status enum
export const customerStatusEnum = pgEnum("customer_status", ["active", "inactive", "pending"]);

// Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  zone: text("zone").notNull(),
  status: customerStatusEnum("status").default("active"),
  aadhaarNumber: text("aadhaar_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  customerId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  zone: true,
  status: true,
  aadhaarNumber: true,
});

// Meter type enum
export const meterTypeEnum = pgEnum("meter_type", ["analog", "digital", "smart"]);

// Meter status enum
export const meterStatusEnum = pgEnum("meter_status", ["active", "inactive", "maintenance"]);

// Water Meters
export const waterMeters = pgTable("water_meters", {
  id: serial("id").primaryKey(),
  meterId: text("meter_id").notNull().unique(),
  customerId: text("customer_id").notNull(),
  type: meterTypeEnum("type").default("analog"),
  location: text("location").notNull(),
  installationDate: date("installation_date").notNull(),
  initialReading: numeric("initial_reading").notNull().default("0"),
  status: meterStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaterMeterSchema = createInsertSchema(waterMeters).pick({
  meterId: true,
  customerId: true,
  type: true,
  location: true,
  installationDate: true,
  initialReading: true,
  status: true,
});

// Meter Readings
export const meterReadings = pgTable("meter_readings", {
  id: serial("id").primaryKey(),
  meterId: text("meter_id").notNull(),
  readingDate: date("reading_date").notNull(),
  reading: numeric("reading").notNull(),
  consumption: numeric("consumption").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeterReadingSchema = createInsertSchema(meterReadings).pick({
  meterId: true,
  readingDate: true,
  reading: true,
  consumption: true,
  notes: true,
});

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", ["paid", "pending", "overdue"]);

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: text("customer_id").notNull(),
  meterId: text("meter_id").notNull(),
  billingPeriodStart: date("billing_period_start").notNull(),
  billingPeriodEnd: date("billing_period_end").notNull(),
  consumption: numeric("consumption").notNull(),
  waterCharges: numeric("water_charges").notNull(),
  maintenanceCharges: numeric("maintenance_charges").notNull(),
  gstPercentage: numeric("gst_percentage").notNull(),
  gstAmount: numeric("gst_amount").notNull(),
  otherCharges: numeric("other_charges").default("0"),
  totalAmount: numeric("total_amount").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  status: invoiceStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceNumber: true,
  customerId: true,
  meterId: true,
  billingPeriodStart: true,
  billingPeriodEnd: true,
  consumption: true,
  waterCharges: true,
  maintenanceCharges: true,
  gstPercentage: true,
  gstAmount: true,
  otherCharges: true,
  totalAmount: true,
  issueDate: true,
  dueDate: true,
  status: true,
});

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "online", "cheque"]);

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  customerId: text("customer_id").notNull(),
  amount: numeric("amount").notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("cash"),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  invoiceNumber: true,
  customerId: true,
  amount: true,
  paymentDate: true,
  paymentMethod: true,
  reference: true,
  notes: true,
});

// Document type enum
export const documentTypeEnum = pgEnum("document_type", ["aadhaar", "address_proof", "other"]);

// Customer Documents
export const customerDocuments = pgTable("customer_documents", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  documentType: documentTypeEnum("document_type").notNull(),
  documentName: text("document_name").notNull(),
  documentPath: text("document_path").notNull(),
  uploadDate: date("upload_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerDocumentSchema = createInsertSchema(customerDocuments).pick({
  customerId: true,
  documentType: true,
  documentName: true,
  documentPath: true,
  uploadDate: true,
});

// Types for our schema
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type WaterMeter = typeof waterMeters.$inferSelect;
export type InsertWaterMeter = z.infer<typeof insertWaterMeterSchema>;

export type MeterReading = typeof meterReadings.$inferSelect;
export type InsertMeterReading = z.infer<typeof insertMeterReadingSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type CustomerDocument = typeof customerDocuments.$inferSelect;
export type InsertCustomerDocument = z.infer<typeof insertCustomerDocumentSchema>;

// Complaint priority enum
export const complaintPriorityEnum = pgEnum("complaint_priority", ["low", "medium", "high", "critical"]);

// Complaint status enum
export const complaintStatusEnum = pgEnum("complaint_status", ["open", "assigned", "in_progress", "resolved", "closed"]);

// Complaint Category enum
export const complaintCategoryEnum = pgEnum("complaint_category", ["water_quality", "leakage", "billing", "meter", "service", "other"]);

// Complaints
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complaintId: text("complaint_id").notNull().unique(),
  customerId: text("customer_id").notNull(),
  meterId: text("meter_id"),
  category: complaintCategoryEnum("category").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  priority: complaintPriorityEnum("priority").default("medium"),
  status: complaintStatusEnum("status").default("open"),
  assignedTo: text("assigned_to"),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  resolutionDate: timestamp("resolution_date"),
  attachmentPath: text("attachment_path"),
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  complaintId: true,
  customerId: true,
  meterId: true,
  category: true,
  subject: true,
  description: true,
  priority: true,
  status: true,
  assignedTo: true,
  submissionDate: true,
  attachmentPath: true,
});

// Complaint Comments/Notes
export const complaintComments = pgTable("complaint_comments", {
  id: serial("id").primaryKey(),
  complaintId: text("complaint_id").notNull(),
  userId: integer("user_id").notNull(),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertComplaintCommentSchema = createInsertSchema(complaintComments).pick({
  complaintId: true,
  userId: true,
  comment: true,
  isInternal: true,
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type ComplaintComment = typeof complaintComments.$inferSelect;
export type InsertComplaintComment = z.infer<typeof insertComplaintCommentSchema>;
