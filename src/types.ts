export interface Shop {
  id: string; // e.g., 'mrxprint'
  name: string;
  ownerName: string;
  ownerEmail: string;
  logoUrl: string;
  bwPrice: number; // Price per B&W copy
  colorPrice: number; // Price per Color copy
  paperPrices: {
    A4: number; // additional price or base
    A3: number;
    Letter: number;
  };
  status: 'active' | 'blocked';
  createdAt: string;
  revenue: number;
  printerStatus: 'online' | 'offline' | 'error';
  printerName: string;
  qrCode: string;
}

export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  customerPhone: string;
  fileName: string;
  fileType: string; // e.g., 'PDF', 'DOCX', 'PNG'
  fileSize: string; // e.g., '2.4 MB'
  paperSize: 'A4' | 'A3' | 'Letter';
  colorMode: 'bw' | 'color';
  copies: number;
  totalPrice: number;
  paymentMethod: 'phonepe' | 'paytm' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  printStatus: 'queued' | 'printing' | 'completed' | 'cancelled';
  createdAt: string;
  estimatedTime: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  isActive: boolean;
}

export interface SystemSettings {
  platformName: string;
  commissionPercent: number;
  superAdminEmail: string;
  pricingPlans: {
    name: string;
    price: number;
    billing: string;
    features: string[];
  }[];
}

export interface SupportTicket {
  id: string;
  shopId?: string;
  shopName?: string;
  customerName: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}
