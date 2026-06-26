import { Shop, Order, Coupon, SystemSettings, SupportTicket } from './types';

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'mrxprint',
    name: 'MRX Print & Xerox',
    ownerName: 'Alex Mercer',
    ownerEmail: 'alex@mrxprint.com',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
    bwPrice: 2, // 2 INR per page
    colorPrice: 10, // 10 INR per page
    paperPrices: {
      A4: 0,
      A3: 5,
      Letter: 1,
    },
    status: 'active',
    createdAt: '2026-01-15T08:30:00Z',
    revenue: 15420,
    printerStatus: 'online',
    printerName: 'HP LaserJet Pro M404dn',
    qrCode: 'mrxprint-qr-code-placeholder',
  },
  {
    id: 'abcxerox',
    name: 'ABC Digital Xerox',
    ownerName: 'Sarah Connor',
    ownerEmail: 'sarah@abcxerox.com',
    logoUrl: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=100&h=100&fit=crop&q=80',
    bwPrice: 1.5,
    colorPrice: 8,
    paperPrices: {
      A4: 0,
      A3: 4,
      Letter: 0.5,
    },
    status: 'active',
    createdAt: '2026-02-10T10:15:00Z',
    revenue: 8940,
    printerStatus: 'error',
    printerName: 'Canon imageRUNNER 2206',
    qrCode: 'abcxerox-qr-code-placeholder',
  },
  {
    id: 'smartprint',
    name: 'Smart Print Zone',
    ownerName: 'David Miller',
    ownerEmail: 'david@smartprint.com',
    logoUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=100&h=100&fit=crop&q=80',
    bwPrice: 3,
    colorPrice: 12,
    paperPrices: {
      A4: 0,
      A3: 6,
      Letter: 2,
    },
    status: 'active',
    createdAt: '2026-03-01T14:45:00Z',
    revenue: 11200,
    printerStatus: 'offline',
    printerName: 'Epson EcoTank L3150',
    qrCode: 'smartprint-qr-code-placeholder',
  },
  {
    id: 'spamcopier',
    name: 'Spam Copier Center',
    ownerName: 'John Doe',
    ownerEmail: 'spammy@spam.com',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop&q=80',
    bwPrice: 1,
    colorPrice: 5,
    paperPrices: {
      A4: 0,
      A3: 2,
      Letter: 0,
    },
    status: 'blocked',
    createdAt: '2026-04-12T09:00:00Z',
    revenue: 350,
    printerStatus: 'offline',
    printerName: 'Brother HL-L2321D',
    qrCode: 'spamcopier-qr-code-placeholder',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-5489',
    shopId: 'mrxprint',
    shopName: 'MRX Print & Xerox',
    customerPhone: '+91 98765 43210',
    fileName: 'College_Project_Report_Final.pdf',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    paperSize: 'A4',
    colorMode: 'color',
    copies: 2,
    totalPrice: 20, // 2 copies * 10 = 20
    paymentMethod: 'phonepe',
    paymentStatus: 'paid',
    printStatus: 'queued',
    createdAt: '2026-06-26T09:30:00-07:00',
    estimatedTime: '3 mins',
  },
  {
    id: 'ORD-5490',
    shopId: 'mrxprint',
    shopName: 'MRX Print & Xerox',
    customerPhone: '+91 91234 56789',
    fileName: 'Rent_Agreement_Draft.docx',
    fileType: 'DOCX',
    fileSize: '320 KB',
    paperSize: 'Letter',
    colorMode: 'bw',
    copies: 1,
    totalPrice: 3, // 1 copy * (2 bw + 1 letter) = 3
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    printStatus: 'printing',
    createdAt: '2026-06-26T09:45:00-07:00',
    estimatedTime: '1 min',
  },
  {
    id: 'ORD-5491',
    shopId: 'mrxprint',
    shopName: 'MRX Print & Xerox',
    customerPhone: '+91 88888 77777',
    fileName: 'Aadhar_Card_Scan.png',
    fileType: 'PNG',
    fileSize: '1.1 MB',
    paperSize: 'A4',
    colorMode: 'bw',
    copies: 4,
    totalPrice: 8, // 4 copies * 2 bw = 8
    paymentMethod: 'paytm',
    paymentStatus: 'paid',
    printStatus: 'completed',
    createdAt: '2026-06-26T08:15:00-07:00',
    estimatedTime: '0 mins',
  },
  {
    id: 'ORD-5492',
    shopId: 'abcxerox',
    shopName: 'ABC Digital Xerox',
    customerPhone: '+91 77777 66666',
    fileName: 'Architecture_Blueprint_A3.pdf',
    fileType: 'PDF',
    fileSize: '12.4 MB',
    paperSize: 'A3',
    colorMode: 'color',
    copies: 5,
    totalPrice: 60, // 5 copies * (8 color + 4 A3) = 60
    paymentMethod: 'phonepe',
    paymentStatus: 'paid',
    printStatus: 'queued',
    createdAt: '2026-06-26T09:50:00-07:00',
    estimatedTime: '8 mins',
  },
  {
    id: 'ORD-5493',
    shopId: 'smartprint',
    shopName: 'Smart Print Zone',
    customerPhone: '+91 99999 88888',
    fileName: 'Visa_Application_Form.pdf',
    fileType: 'PDF',
    fileSize: '850 KB',
    paperSize: 'A4',
    colorMode: 'bw',
    copies: 3,
    totalPrice: 9, // 3 copies * 3 bw = 9
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    printStatus: 'completed',
    createdAt: '2026-06-25T16:20:00-07:00',
    estimatedTime: '0 mins',
  },
  {
    id: 'ORD-5494',
    shopId: 'smartprint',
    shopName: 'Smart Print Zone',
    customerPhone: '+91 95555 44444',
    fileName: 'Family_Photo_HighRes.jpg',
    fileType: 'JPG',
    fileSize: '5.6 MB',
    paperSize: 'A4',
    colorMode: 'color',
    copies: 1,
    totalPrice: 12, // 1 copy * 12 color = 12
    paymentMethod: 'paytm',
    paymentStatus: 'failed',
    printStatus: 'cancelled',
    createdAt: '2026-06-26T07:10:00-07:00',
    estimatedTime: '0 mins',
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'WELCOME10', discountPercent: 10, isActive: true },
  { code: 'PRINTFREE20', discountPercent: 20, isActive: true },
  { code: 'FESTIVE30', discountPercent: 30, isActive: false },
];

export const INITIAL_SETTINGS: SystemSettings = {
  platformName: 'QR Print SaaS',
  commissionPercent: 5, // 5% SaaS fee
  superAdminEmail: 'admin@qrprintsaas.com',
  pricingPlans: [
    {
      name: 'Starter Shop',
      price: 299, // INR per month
      billing: 'monthly',
      features: ['1 Shop Location', 'Up to 500 orders/mo', 'Standard QR Code', 'Cash & UPI Payment APIs', 'Email Support'],
    },
    {
      name: 'Pro Multi-Print',
      price: 799,
      billing: 'monthly',
      features: ['Up to 3 Shop Locations', 'Unlimited Orders', 'Custom QR Designs', 'Instant WhatsApp Alerts', 'Priority Printer APIs', '24/7 Support'],
    },
    {
      name: 'Enterprise Network',
      price: 1999,
      billing: 'monthly',
      features: ['Unlimited Locations', 'Custom Branding & Domain', 'Dedicated Printer Hardware Support', 'Direct Payment Settlement', 'Advanced Analytics Reports'],
    }
  ]
};

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-101',
    shopId: 'abcxerox',
    shopName: 'ABC Digital Xerox',
    customerName: 'Sarah Connor',
    subject: 'Printer Connection Timeout',
    message: 'The dashboard shows "Printer error" even though our printer is turned on and connected to the local helper agent. Please check our API connection logs.',
    status: 'open',
    createdAt: '2026-06-26T05:30:00-07:00',
  },
  {
    id: 'TCK-102',
    shopId: 'mrxprint',
    shopName: 'MRX Print & Xerox',
    customerName: 'Alex Mercer',
    subject: 'Refund request for cancelled UPI payment',
    message: 'A customer tried to pay 50 INR via PhonePe but it was timed out on our side. However, their bank account got debited. We need to refund or manually credit them.',
    status: 'open',
    createdAt: '2026-06-25T11:20:00-07:00',
  }
];
