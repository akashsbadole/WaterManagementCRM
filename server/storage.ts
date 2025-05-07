import {
  users, User, InsertUser,
  customers, Customer, InsertCustomer,
  waterMeters, WaterMeter, InsertWaterMeter,
  meterReadings, MeterReading, InsertMeterReading,
  invoices, Invoice, InsertInvoice,
  payments, Payment, InsertPayment,
  customerDocuments, CustomerDocument, InsertCustomerDocument,
  complaints, Complaint, InsertComplaint,
  complaintComments, ComplaintComment, InsertComplaintComment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByCustomerId(customerId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Water Meter methods
  getWaterMeters(): Promise<WaterMeter[]>;
  getWaterMeter(id: number): Promise<WaterMeter | undefined>;
  getWaterMeterByMeterId(meterId: string): Promise<WaterMeter | undefined>;
  getWaterMetersByCustomerId(customerId: string): Promise<WaterMeter[]>;
  createWaterMeter(waterMeter: InsertWaterMeter): Promise<WaterMeter>;
  updateWaterMeter(id: number, waterMeter: Partial<InsertWaterMeter>): Promise<WaterMeter | undefined>;
  deleteWaterMeter(id: number): Promise<boolean>;
  
  // Meter Reading methods
  getMeterReadings(): Promise<MeterReading[]>;
  getMeterReading(id: number): Promise<MeterReading | undefined>;
  getMeterReadingsByMeterId(meterId: string): Promise<MeterReading[]>;
  createMeterReading(meterReading: InsertMeterReading): Promise<MeterReading>;
  
  // Invoice methods
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByInvoiceNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  getInvoicesByCustomerId(customerId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // Payment methods
  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByInvoiceNumber(invoiceNumber: string): Promise<Payment[]>;
  getPaymentsByCustomerId(customerId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  // Customer Document methods
  getCustomerDocuments(customerId: string): Promise<CustomerDocument[]>;
  createCustomerDocument(document: InsertCustomerDocument): Promise<CustomerDocument>;
  
  // Complaint methods
  getComplaints(): Promise<Complaint[]>;
  getComplaint(id: number): Promise<Complaint | undefined>;
  getComplaintByComplaintId(complaintId: string): Promise<Complaint | undefined>;
  getComplaintsByCustomerId(customerId: string): Promise<Complaint[]>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaint(id: number, complaint: Partial<InsertComplaint>): Promise<Complaint | undefined>;
  
  // Complaint Comment methods
  getComplaintComments(complaintId: string): Promise<ComplaintComment[]>;
  createComplaintComment(comment: InsertComplaintComment): Promise<ComplaintComment>;
}

export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private customerStore: Map<number, Customer>;
  private waterMeterStore: Map<number, WaterMeter>;
  private meterReadingStore: Map<number, MeterReading>;
  private invoiceStore: Map<number, Invoice>;
  private paymentStore: Map<number, Payment>;
  private customerDocumentStore: Map<number, CustomerDocument>;
  private complaintStore: Map<number, Complaint>;
  private complaintCommentStore: Map<number, ComplaintComment>;
  
  private userId: number;
  private customerId: number;
  private waterMeterId: number;
  private meterReadingId: number;
  private invoiceId: number;
  private paymentId: number;
  private customerDocumentId: number;
  private complaintId: number;
  private complaintCommentId: number;
  
  constructor() {
    this.userStore = new Map();
    this.customerStore = new Map();
    this.waterMeterStore = new Map();
    this.meterReadingStore = new Map();
    this.invoiceStore = new Map();
    this.paymentStore = new Map();
    this.customerDocumentStore = new Map();
    this.complaintStore = new Map();
    this.complaintCommentStore = new Map();
    
    this.userId = 1;
    this.customerId = 1;
    this.waterMeterId = 1;
    this.meterReadingId = 1;
    this.invoiceId = 1;
    this.paymentId = 1;
    this.customerDocumentId = 1;
    this.complaintId = 1;
    this.complaintCommentId = 1;
    
    // Initialize with sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@aquabill.com",
      role: "admin"
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.userStore.set(id, user);
    return user;
  }
  
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customerStore.values());
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customerStore.get(id);
  }
  
  async getCustomerByCustomerId(customerId: string): Promise<Customer | undefined> {
    return Array.from(this.customerStore.values()).find(
      (customer) => customer.customerId === customerId
    );
  }
  
  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      createdAt: new Date()
    };
    this.customerStore.set(id, customer);
    return customer;
  }
  
  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customerStore.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer: Customer = {
      ...existingCustomer,
      ...customerUpdate
    };
    
    this.customerStore.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    return this.customerStore.delete(id);
  }
  
  // Water Meter methods
  async getWaterMeters(): Promise<WaterMeter[]> {
    return Array.from(this.waterMeterStore.values());
  }
  
  async getWaterMeter(id: number): Promise<WaterMeter | undefined> {
    return this.waterMeterStore.get(id);
  }
  
  async getWaterMeterByMeterId(meterId: string): Promise<WaterMeter | undefined> {
    return Array.from(this.waterMeterStore.values()).find(
      (waterMeter) => waterMeter.meterId === meterId
    );
  }
  
  async getWaterMetersByCustomerId(customerId: string): Promise<WaterMeter[]> {
    return Array.from(this.waterMeterStore.values()).filter(
      (waterMeter) => waterMeter.customerId === customerId
    );
  }
  
  async createWaterMeter(insertWaterMeter: InsertWaterMeter): Promise<WaterMeter> {
    const id = this.waterMeterId++;
    const waterMeter: WaterMeter = { 
      ...insertWaterMeter, 
      id,
      createdAt: new Date()
    };
    this.waterMeterStore.set(id, waterMeter);
    return waterMeter;
  }
  
  async updateWaterMeter(id: number, waterMeterUpdate: Partial<InsertWaterMeter>): Promise<WaterMeter | undefined> {
    const existingWaterMeter = this.waterMeterStore.get(id);
    if (!existingWaterMeter) return undefined;
    
    const updatedWaterMeter: WaterMeter = {
      ...existingWaterMeter,
      ...waterMeterUpdate
    };
    
    this.waterMeterStore.set(id, updatedWaterMeter);
    return updatedWaterMeter;
  }
  
  async deleteWaterMeter(id: number): Promise<boolean> {
    return this.waterMeterStore.delete(id);
  }
  
  // Meter Reading methods
  async getMeterReadings(): Promise<MeterReading[]> {
    return Array.from(this.meterReadingStore.values());
  }
  
  async getMeterReading(id: number): Promise<MeterReading | undefined> {
    return this.meterReadingStore.get(id);
  }
  
  async getMeterReadingsByMeterId(meterId: string): Promise<MeterReading[]> {
    return Array.from(this.meterReadingStore.values())
      .filter((meterReading) => meterReading.meterId === meterId)
      .sort((a, b) => {
        const dateA = new Date(a.readingDate).getTime();
        const dateB = new Date(b.readingDate).getTime();
        return dateB - dateA; // Sort by descending date
      });
  }
  
  async createMeterReading(insertMeterReading: InsertMeterReading): Promise<MeterReading> {
    const id = this.meterReadingId++;
    const meterReading: MeterReading = { 
      ...insertMeterReading, 
      id,
      createdAt: new Date()
    };
    this.meterReadingStore.set(id, meterReading);
    return meterReading;
  }
  
  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoiceStore.values());
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoiceStore.get(id);
  }
  
  async getInvoiceByInvoiceNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    return Array.from(this.invoiceStore.values()).find(
      (invoice) => invoice.invoiceNumber === invoiceNumber
    );
  }
  
  async getInvoicesByCustomerId(customerId: string): Promise<Invoice[]> {
    return Array.from(this.invoiceStore.values())
      .filter((invoice) => invoice.customerId === customerId)
      .sort((a, b) => {
        const dateA = new Date(a.issueDate).getTime();
        const dateB = new Date(b.issueDate).getTime();
        return dateB - dateA; // Sort by descending date
      });
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceId++;
    const invoice: Invoice = { 
      ...insertInvoice, 
      id,
      createdAt: new Date()
    };
    this.invoiceStore.set(id, invoice);
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoiceStore.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...existingInvoice,
      ...invoiceUpdate
    };
    
    this.invoiceStore.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.paymentStore.values());
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentStore.get(id);
  }
  
  async getPaymentsByInvoiceNumber(invoiceNumber: string): Promise<Payment[]> {
    return Array.from(this.paymentStore.values())
      .filter((payment) => payment.invoiceNumber === invoiceNumber)
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate).getTime();
        const dateB = new Date(b.paymentDate).getTime();
        return dateB - dateA; // Sort by descending date
      });
  }
  
  async getPaymentsByCustomerId(customerId: string): Promise<Payment[]> {
    return Array.from(this.paymentStore.values())
      .filter((payment) => payment.customerId === customerId)
      .sort((a, b) => {
        const dateA = new Date(a.paymentDate).getTime();
        const dateB = new Date(b.paymentDate).getTime();
        return dateB - dateA; // Sort by descending date
      });
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id,
      createdAt: new Date()
    };
    this.paymentStore.set(id, payment);
    
    // Update invoice status to paid if payment is made
    const invoice = Array.from(this.invoiceStore.values()).find(
      (inv) => inv.invoiceNumber === insertPayment.invoiceNumber
    );
    
    if (invoice) {
      this.updateInvoice(invoice.id, { status: "paid" });
    }
    
    return payment;
  }
  
  // Customer Document methods
  async getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
    return Array.from(this.customerDocumentStore.values())
      .filter((document) => document.customerId === customerId)
      .sort((a, b) => {
        const dateA = new Date(a.uploadDate).getTime();
        const dateB = new Date(b.uploadDate).getTime();
        return dateB - dateA; // Sort by descending date
      });
  }
  
  async createCustomerDocument(insertDocument: InsertCustomerDocument): Promise<CustomerDocument> {
    const id = this.customerDocumentId++;
    const document: CustomerDocument = { 
      ...insertDocument, 
      id,
      createdAt: new Date()
    };
    this.customerDocumentStore.set(id, document);
    return document;
  }

  // Complaint methods
  async getComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaintStore.values());
  }
  
  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.complaintStore.get(id);
  }
  
  async getComplaintByComplaintId(complaintId: string): Promise<Complaint | undefined> {
    return Array.from(this.complaintStore.values()).find(
      (complaint) => complaint.complaintId === complaintId
    );
  }
  
  async getComplaintsByCustomerId(customerId: string): Promise<Complaint[]> {
    return Array.from(this.complaintStore.values())
      .filter((complaint) => complaint.customerId === customerId)
      .sort((a, b) => {
        const dateA = new Date(a.submissionDate).getTime();
        const dateB = new Date(b.submissionDate).getTime();
        return dateB - dateA; // Sort by descending date
      });
  }
  
  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const id = this.complaintId++;
    const complaint: Complaint = { 
      ...insertComplaint, 
      id,
      resolutionDate: null
    };
    this.complaintStore.set(id, complaint);
    return complaint;
  }
  
  async updateComplaint(id: number, complaintUpdate: Partial<InsertComplaint>): Promise<Complaint | undefined> {
    const existingComplaint = this.complaintStore.get(id);
    if (!existingComplaint) return undefined;
    
    // If status is being changed to 'resolved', set resolution date
    if (complaintUpdate.status === 'resolved' && existingComplaint.status !== 'resolved') {
      complaintUpdate.resolutionDate = new Date();
    }
    
    const updatedComplaint: Complaint = {
      ...existingComplaint,
      ...complaintUpdate
    };
    
    this.complaintStore.set(id, updatedComplaint);
    return updatedComplaint;
  }
  
  // Complaint Comment methods
  async getComplaintComments(complaintId: string): Promise<ComplaintComment[]> {
    return Array.from(this.complaintCommentStore.values())
      .filter((comment) => comment.complaintId === complaintId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // Sort by ascending date (oldest first)
      });
  }
  
  async createComplaintComment(insertComment: InsertComplaintComment): Promise<ComplaintComment> {
    const id = this.complaintCommentId++;
    const comment: ComplaintComment = { 
      ...insertComment, 
      id,
      createdAt: new Date()
    };
    this.complaintCommentStore.set(id, comment);
    return comment;
  }
}

export const storage = new MemStorage();
