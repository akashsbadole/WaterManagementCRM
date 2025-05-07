import { storage } from './storage';
import { 
  InsertUser, InsertCustomer, InsertWaterMeter, InsertMeterReading, 
  InsertInvoice, InsertPayment, InsertComplaint, InsertComplaintComment
} from '../shared/schema';

/**
 * Seed script to create dummy data for development and testing
 */
async function seed() {
  console.log('🌱 Starting database seeding process...');

  try {
    // Create users
    console.log('Creating users...');
    const users: InsertUser[] = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@aquacrm.com' },
      { username: 'meterreader', password: 'meter123', role: 'meter_reader', name: 'Meter Reader', email: 'meter@aquacrm.com' },
      { username: 'customer', password: 'customer123', role: 'customer', name: 'Customer User', email: 'customer@example.com' }
    ];

    for (const user of users) {
      await storage.createUser(user);
    }

    // Create customers
    console.log('Creating customers...');
    const customers: InsertCustomer[] = [
      { customerId: 'CUST-0001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '9876543210', address: '123 Main St', city: 'Mumbai', zone: 'North', status: 'active', aadhaarNumber: '123456789012' },
      { customerId: 'CUST-0002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '9876543211', address: '456 Oak St', city: 'Delhi', zone: 'South', status: 'active', aadhaarNumber: '123456789013' },
      { customerId: 'CUST-0003', firstName: 'Robert', lastName: 'Johnson', email: 'robert@example.com', phone: '9876543212', address: '789 Pine St', city: 'Bangalore', zone: 'East', status: 'active', aadhaarNumber: '123456789014' },
      { customerId: 'CUST-0004', firstName: 'Mary', lastName: 'Williams', email: 'mary@example.com', phone: '9876543213', address: '101 Elm St', city: 'Chennai', zone: 'West', status: 'active', aadhaarNumber: '123456789015' },
      { customerId: 'CUST-0005', firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', phone: '9876543214', address: '202 Maple St', city: 'Hyderabad', zone: 'North', status: 'active', aadhaarNumber: '123456789016' },
      { customerId: 'CUST-0006', firstName: 'Patricia', lastName: 'Jones', email: 'patricia@example.com', phone: '9876543215', address: '303 Cedar St', city: 'Pune', zone: 'South', status: 'active', aadhaarNumber: '123456789017' },
      { customerId: 'CUST-0007', firstName: 'James', lastName: 'Miller', email: 'james@example.com', phone: '9876543216', address: '404 Birch St', city: 'Ahmedabad', zone: 'East', status: 'active', aadhaarNumber: '123456789018' },
      { customerId: 'CUST-0008', firstName: 'Jennifer', lastName: 'Davis', email: 'jennifer@example.com', phone: '9876543217', address: '505 Walnut St', city: 'Kolkata', zone: 'West', status: 'active', aadhaarNumber: '123456789019' },
      { customerId: 'CUST-0009', firstName: 'David', lastName: 'Garcia', email: 'david@example.com', phone: '9876543218', address: '606 Pineapple St', city: 'Jaipur', zone: 'North', status: 'inactive', aadhaarNumber: '123456789020' },
      { customerId: 'CUST-0010', firstName: 'Sarah', lastName: 'Rodriguez', email: 'sarah@example.com', phone: '9876543219', address: '707 Orange St', city: 'Surat', zone: 'South', status: 'pending', aadhaarNumber: '123456789021' },
      { customerId: 'CUST-0011', firstName: 'Thomas', lastName: 'Wilson', email: 'thomas@example.com', phone: '9876543220', address: '808 Lemon St', city: 'Lucknow', zone: 'East', status: 'active', aadhaarNumber: '123456789022' },
      { customerId: 'CUST-0012', firstName: 'Jessica', lastName: 'Martinez', email: 'jessica@example.com', phone: '9876543221', address: '909 Grape St', city: 'Kanpur', zone: 'West', status: 'active', aadhaarNumber: '123456789023' },
      { customerId: 'CUST-0013', firstName: 'Daniel', lastName: 'Anderson', email: 'daniel@example.com', phone: '9876543222', address: '110 Cherry St', city: 'Nagpur', zone: 'North', status: 'active', aadhaarNumber: '123456789024' },
      { customerId: 'CUST-0014', firstName: 'Nancy', lastName: 'Thomas', email: 'nancy@example.com', phone: '9876543223', address: '211 Mango St', city: 'Indore', zone: 'South', status: 'active', aadhaarNumber: '123456789025' },
      { customerId: 'CUST-0015', firstName: 'Mark', lastName: 'Jackson', email: 'mark@example.com', phone: '9876543224', address: '312 Banana St', city: 'Thane', zone: 'East', status: 'active', aadhaarNumber: '123456789026' }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const createdCustomer = await storage.createCustomer(customer);
      createdCustomers.push(createdCustomer);
    }

    // Create water meters
    console.log('Creating water meters...');
    const waterMeters = [];
    
    for (let i = 0; i < 20; i++) {
      const customerIndex = i % createdCustomers.length;
      const customer = createdCustomers[customerIndex];
      
      const waterMeter: InsertWaterMeter = {
        meterId: `MTR-${(1000 + i).toString().padStart(4, '0')}`,
        customerId: customer.customerId,
        location: `Block ${String.fromCharCode(65 + i % 8)}`,
        installationDate: new Date(2022, i % 12, (i % 28) + 1).toISOString().split('T')[0],
        type: ['analog', 'digital', 'smart'][i % 3],
        status: ['active', 'active', 'active', 'inactive', 'maintenance'][i % 5],
        initialReading: (i * 100).toString()
      };
      
      const createdMeter = await storage.createWaterMeter(waterMeter);
      waterMeters.push(createdMeter);
    }

    // Create meter readings
    console.log('Creating meter readings...');
    const meterReadings = [];
    const currentDate = new Date();
    
    for (let i = 0; i < waterMeters.length; i++) {
      const meter = waterMeters[i];
      let lastReading = parseInt(meter.initialReading || '0');
      
      // Create readings for the last 6 months
      for (let month = 5; month >= 0; month--) {
        const readingDate = new Date(currentDate);
        readingDate.setMonth(currentDate.getMonth() - month);
        
        // Random consumption between 50-150 units
        const consumption = Math.floor(Math.random() * 100) + 50;
        lastReading += consumption;
        
        const reading = {
          meterId: meter.meterId,
          readingDate: readingDate.toISOString().split('T')[0],
          reading: lastReading.toString(),
          consumption: consumption.toString(),
          notes: (month === 0) ? 'Latest reading' : null
        };
        
        const createdReading = await storage.createMeterReading(reading);
        meterReadings.push(createdReading);
      }
    }

    // Create invoices
    console.log('Creating invoices...');
    const invoices = [];
    
    for (let i = 0; i < 30; i++) {
      const customerIndex = i % createdCustomers.length;
      const customer = createdCustomers[customerIndex];
      const meter = waterMeters.find(m => m.customerId === customer.customerId) || waterMeters[0];
      
      const invoiceDate = new Date();
      invoiceDate.setMonth(invoiceDate.getMonth() - (i % 6));
      
      const billingStart = new Date(invoiceDate);
      billingStart.setDate(1);
      
      const billingEnd = new Date(invoiceDate);
      billingEnd.setMonth(billingEnd.getMonth() + 1);
      billingEnd.setDate(0);
      
      const dueDate = new Date(billingEnd);
      dueDate.setDate(dueDate.getDate() + 15);
      
      const consumption = Math.floor(Math.random() * 100) + 50;
      const waterCharges = (consumption * 10).toString();
      const maintenanceCharges = '250';
      const otherCharges = (Math.floor(Math.random() * 100)).toString();
      const taxAmount = Math.floor(parseInt(waterCharges) * 0.18).toString();
      const totalAmount = (
        parseInt(waterCharges) + 
        parseInt(maintenanceCharges) + 
        parseInt(otherCharges) + 
        parseInt(taxAmount)
      ).toString();
      
      const invoice = {
        invoiceNumber: `INV-${(10000 + i).toString().padStart(5, '0')}`,
        customerId: customer.customerId,
        meterId: meter.meterId,
        billingPeriodStart: billingStart.toISOString().split('T')[0],
        billingPeriodEnd: billingEnd.toISOString().split('T')[0],
        issueDate: invoiceDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        consumption: consumption.toString(),
        waterCharges: waterCharges,
        maintenanceCharges: maintenanceCharges,
        otherCharges: otherCharges,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        status: ['paid', 'pending', 'overdue'][i % 3]
      };
      
      const createdInvoice = await storage.createInvoice(invoice);
      invoices.push(createdInvoice);
    }

    // Create payments for paid invoices
    console.log('Creating payments...');
    const payments = [];
    
    for (const invoice of invoices) {
      if (invoice.status === 'paid') {
        const paymentDate = new Date(invoice.dueDate);
        paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 10));
        
        const payment = {
          invoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          amount: invoice.totalAmount,
          paymentDate: paymentDate.toISOString().split('T')[0],
          paymentMethod: ['cash', 'online', 'cheque'][Math.floor(Math.random() * 3)],
          reference: `REF-${Math.floor(Math.random() * 1000000)}`,
          notes: 'Payment received'
        };
        
        const createdPayment = await storage.createPayment(payment);
        payments.push(createdPayment);
      }
    }

    // Create complaints
    console.log('Creating complaints...');
    const complaints = [];
    const complaintCategories = ['water_quality', 'leakage', 'billing', 'meter', 'service', 'other'];
    const complaintStatuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
    const complaintPriorities = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < 20; i++) {
      const customerIndex = i % createdCustomers.length;
      const customer = createdCustomers[customerIndex];
      const meter = waterMeters.find(m => m.customerId === customer.customerId) || waterMeters[0];
      
      const submissionDate = new Date();
      submissionDate.setDate(submissionDate.getDate() - (30 - i));
      
      let resolutionDate = null;
      const status = complaintStatuses[i % complaintStatuses.length];
      if (['resolved', 'closed'].includes(status)) {
        resolutionDate = new Date(submissionDate);
        resolutionDate.setDate(resolutionDate.getDate() + Math.floor(Math.random() * 5) + 1);
      }
      
      const complaint = {
        complaintId: `CMP-${(2000 + i).toString().padStart(4, '0')}`,
        customerId: customer.customerId,
        meterId: meter.meterId,
        category: complaintCategories[i % complaintCategories.length],
        subject: getComplaintSubject(i),
        description: getComplaintDescription(i),
        priority: complaintPriorities[i % complaintPriorities.length],
        status: status,
        submissionDate: submissionDate.toISOString().split('T')[0],
        resolutionDate: resolutionDate ? resolutionDate.toISOString().split('T')[0] : null,
        assignedTo: ['resolved', 'closed', 'in_progress', 'assigned'].includes(status) ? 'EMP-001' : null,
        attachmentPath: null
      };
      
      const createdComplaint = await storage.createComplaint(complaint);
      complaints.push(createdComplaint);
    }

    // Create complaint comments
    console.log('Creating complaint comments...');
    for (let i = 0; i < complaints.length; i++) {
      const complaint = complaints[i];
      const commentCount = Math.floor(Math.random() * 5) + 1; // 1-5 comments per complaint
      
      for (let j = 0; j < commentCount; j++) {
        const commentDate = new Date(complaint.submissionDate);
        commentDate.setDate(commentDate.getDate() + j + 1);
        
        // If complaint is resolved, add a resolution comment
        if (j === commentCount - 1 && ['resolved', 'closed'].includes(complaint.status)) {
          const comment = {
            complaintId: complaint.complaintId,
            userId: 1, // admin user id
            comment: `Issue has been resolved. ${getResolutionComment(complaint.category)}`,
            isInternal: Math.random() > 0.7, // 30% chance to be internal
            createdAt: commentDate
          };
          
          await storage.createComplaintComment(comment);
        } else {
          const comment = {
            complaintId: complaint.complaintId,
            userId: Math.floor(Math.random() * 3) + 1, // random user id 1-3
            comment: getRandomComment(j, complaint.category),
            isInternal: Math.random() > 0.7, // 30% chance to be internal
            createdAt: commentDate
          };
          
          await storage.createComplaintComment(comment);
        }
      }
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding the database:', error);
  }
}

// Helper functions to generate realistic complaint content
function getComplaintSubject(index: number): string {
  const subjects = [
    "Low water pressure in apartment",
    "Water has strange taste",
    "Leaking pipe in front yard",
    "Meter showing incorrect reading",
    "Overcharged on last invoice",
    "Water quality concerns",
    "No water supply for last 2 days",
    "Discolored water coming from tap",
    "Broken water meter",
    "Meter not accessible due to vegetation",
    "Unexpected high usage on bill",
    "Water leakage in bathroom",
    "Foul smell from water",
    "Meter reader didn't show up",
    "Meter reading discrepancy",
    "Billing calculation error",
    "Service interruption without notice",
    "Water connection issues after renovation",
    "Difficulty in making online payment",
    "Request for meter replacement"
  ];
  
  return subjects[index % subjects.length];
}

function getComplaintDescription(index: number): string {
  const descriptions = [
    "I've noticed that the water pressure in my apartment has been very low for the past week. It takes a long time to fill a bucket or take a shower.",
    "The water from my tap has a strange metallic taste for the last few days. I'm concerned about its safety for drinking.",
    "There's a water pipe leaking in my front yard, causing water to pool on the lawn. Please send someone to fix it urgently.",
    "I believe my water meter is showing incorrect readings. My consumption hasn't changed but the readings are much higher than normal.",
    "I think I've been overcharged on my last invoice. The consumption shown is much higher than my actual usage.",
    "The water quality has deteriorated recently. It's cloudy and sometimes has particles floating in it.",
    "We haven't had any water supply for the last 2 days. Please restore service as soon as possible.",
    "The water coming from all taps in my house is yellowish/brown in color. This is concerning as we can't use it for cooking or drinking.",
    "My water meter appears to be broken. The display is cracked and doesn't show readings clearly.",
    "The water meter is not accessible as it's covered by overgrown bushes. The meter reader left a note saying they couldn't access it.",
    "My last bill shows unusually high consumption although our usage patterns haven't changed. Please investigate.",
    "There's a water leakage from the bathroom pipes that's causing dampness in the adjacent wall.",
    "The water has a foul smell like sewage. This started about 3 days ago and is consistent from all taps.",
    "The meter reader was scheduled to come yesterday but didn't show up. Please reschedule.",
    "There's a big discrepancy between my own meter reading record and what's shown on the bill.",
    "I think there's an error in how my bill was calculated. The rate seems higher than what was communicated earlier.",
    "There was a water service interruption yesterday without any prior notice. This caused significant inconvenience.",
    "After recent home renovation, we're having issues with the water connection. The pressure is inconsistent.",
    "I'm unable to make an online payment through your portal. The transaction fails at the final step.",
    "My meter is very old and difficult to read. I would like to request a replacement with a newer model."
  ];
  
  return descriptions[index % descriptions.length];
}

function getRandomComment(commentIndex: number, category: string): string {
  const followupComments = [
    "Thank you for reporting this issue. We have registered your complaint and will look into it soon.",
    "We've assigned a technician to investigate this issue. They will contact you to schedule a visit.",
    "Could you please provide more details about the problem? Any additional information would help us address it better.",
    "Our team is working on resolving your issue. We appreciate your patience.",
    "We've identified the cause of the problem and are working on a solution.",
    "A service technician has been dispatched to your location and should arrive within the next 48 hours.",
    "We apologize for the inconvenience caused. Your complaint is being prioritized.",
    "This is a known issue in your area, and our maintenance team is already working on it.",
    "We need access to your property to investigate further. When would be a convenient time?",
    "We've checked our records and found similar reports from your neighborhood. We're treating this as a local issue.",
    "Your complaint has been escalated to the senior technical team for immediate attention.",
    "We will need to conduct water quality tests. Our team will collect samples soon.",
    "Please check if the issue persists after the recent maintenance work in your area.",
    "We've updated your complaint status and you should be able to track progress online.",
    "Do you notice this issue at specific times of day or is it constant?",
    "Our billing department is reviewing your invoice and will make adjustments if errors are found.",
    "We've scheduled maintenance in your area next week which should resolve this issue permanently.",
    "Could you send a photo of the issue? This would help our technicians prepare appropriately.",
    "We'll need to temporarily interrupt service in your area to fix this. We'll notify you in advance.",
    "Your feedback is important to us. We're working on improving our service based on complaints like yours."
  ];
  
  if (commentIndex === 0) {
    return "Thank you for reporting this issue. We have registered your complaint and will look into it soon.";
  }
  
  const categorySpecificComments: Record<string, string[]> = {
    'water_quality': [
      "We'll send someone to collect water samples for testing.",
      "Have you noticed any change in color, taste, or smell?",
      "Is anyone in your household experiencing any health issues?",
      "We've scheduled water testing for your area."
    ],
    'leakage': [
      "Please turn off your main water valve if the leakage is severe.",
      "We'll send a plumber to fix the leak.",
      "Is the leak causing any damage to your property?",
      "Can you locate where exactly the leakage is coming from?"
    ],
    'billing': [
      "We're reviewing your billing history to check for any discrepancies.",
      "Could you provide your meter reading so we can verify it against our records?",
      "We'll adjust your bill if we find any errors.",
      "Our billing department will contact you within 2 business days."
    ],
    'meter': [
      "We'll schedule a meter inspection soon.",
      "When did you first notice issues with your meter?",
      "We might need to replace your meter if it's malfunctioning.",
      "Is your meter accessible for our technician to inspect?"
    ],
    'service': [
      "We apologize for the service interruption.",
      "Normal service should resume within 24 hours.",
      "The interruption was due to essential maintenance work.",
      "We're working to improve service reliability in your area."
    ],
    'other': [
      "We've noted your concern and will address it promptly.",
      "Could you provide more specific details about your issue?",
      "Is there anything else we should know about your situation?",
      "We're committed to resolving your issue as soon as possible."
    ]
  };
  
  // Mix general comments with category-specific ones
  if (categorySpecificComments[category] && Math.random() > 0.5) {
    const specificComments = categorySpecificComments[category];
    return specificComments[Math.floor(Math.random() * specificComments.length)];
  }
  
  return followupComments[Math.floor(Math.random() * followupComments.length)];
}

function getResolutionComment(category: string): string {
  const resolutionComments: Record<string, string[]> = {
    'water_quality': [
      "Water quality tests show normal levels now. Flushing of pipes has been completed.",
      "We've addressed the contamination source. Water is now safe for consumption.",
      "Water quality has been restored to meet all regulatory standards.",
      "The water treatment plant has adjusted chlorine levels to address your concern."
    ],
    'leakage': [
      "The leaking pipe has been repaired and tested for pressure.",
      "We've replaced the damaged section of the pipeline and confirmed no more leaks.",
      "The leak was fixed and we've checked nearby connections for potential issues.",
      "Repair work completed. Please monitor and let us know if you notice any issues."
    ],
    'billing': [
      "Your bill has been recalculated and adjusted. The corrected invoice has been sent.",
      "We found a billing error and have applied a credit to your account.",
      "The meter reading discrepancy has been resolved and your bill corrected.",
      "Billing system issue has been fixed. Your correct usage has been recorded."
    ],
    'meter': [
      "Your meter has been replaced with a new one and calibrated correctly.",
      "We've repaired the meter and verified it's now recording accurately.",
      "The meter access issue has been resolved. Regular readings can now resume.",
      "New smart meter installed which will provide more accurate readings."
    ],
    'service': [
      "Full water service has been restored to your area.",
      "The maintenance work has been completed ahead of schedule.",
      "Service interruption issue resolved. Pressure should be back to normal.",
      "The underlying infrastructure problem has been fixed, improving reliability."
    ],
    'other': [
      "We've addressed your concern and completed necessary actions.",
      "All requested changes have been implemented successfully.",
      "The issue has been resolved according to our service standards.",
      "Problem fixed. Please contact us again if you need further assistance."
    ]
  };
  
  if (resolutionComments[category]) {
    const comments = resolutionComments[category];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  return "The issue has been successfully resolved. Thank you for your patience.";
}

// Start seeding process
seed().catch(console.error);