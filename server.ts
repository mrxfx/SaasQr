import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Enable request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins for production-ready open sandbox/client connection
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 1. HEALTH CHECK ENDPOINT
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development',
    firebaseConfigured: !!process.env.VITE_FIREBASE_PROJECT_ID
  });
});

// 2. PAYMENT INTEGRATIONS
// PhonePe Initiate Mock Gateway Endpoint
app.post('/api/payments/phonepe/initiate', (req: Request, res: Response) => {
  const { orderId, amount, phone } = req.body;
  const merchantId = process.env.PHONEPE_MERCHANT_ID || 'M_MOCK_PHONEPE';
  
  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Missing orderId or amount' });
  }

  console.log(`[PhonePe] Initiating transaction for order ${orderId}, amount: ${amount} INR, phone: ${phone}`);
  
  // Simulate PhonePe redirect URL response
  res.json({
    success: true,
    message: 'PhonePe payment initialized',
    transactionId: `TXN-PHONEPE-${Date.now()}`,
    redirectUrl: `https://merch.phonepe.com/pay?txnId=${Date.now()}&amount=${amount}`,
    merchantId
  });
});

// Paytm Initiate Mock Gateway Endpoint
app.post('/api/payments/paytm/initiate', (req: Request, res: Response) => {
  const { orderId, amount, phone } = req.body;
  const merchantId = process.env.PAYTM_MERCHANT_ID || 'M_MOCK_PAYTM';

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Missing orderId or amount' });
  }

  console.log(`[Paytm] Initiating transaction for order ${orderId}, amount: ${amount} INR`);

  res.json({
    success: true,
    message: 'Paytm payment transaction initiated',
    txnToken: `TXN-TOKEN-PAYTM-${Math.random().toString(36).substring(2)}`,
    mid: merchantId,
    orderId
  });
});

// 3. WINDOWS PRINT AGENT & QUEUE API
// Windows Agent polls this endpoint to fetch queued print orders for a specific shop
app.get('/api/print-queue', (req: Request, res: Response) => {
  const { shopId } = req.query;
  if (!shopId) {
    return res.status(400).json({ error: 'Missing shopId query parameter' });
  }

  console.log(`[PrintAgent] Shop ${shopId} is polling the print queue...`);

  // Windows Print Agent can receive instructions. In a real system, we'd query Firestore for orders with status "queued" or "printing"
  res.json({
    success: true,
    shopId,
    timestamp: new Date().toISOString(),
    jobs: [
      {
        id: "mock-print-job-1",
        fileName: "annual_report.pdf",
        fileUrl: "https://example.com/mock-files/annual_report.pdf",
        copies: 2,
        colorMode: "bw",
        paperSize: "A4",
        status: "queued"
      }
    ]
  });
});

// Windows Agent calls this to update hardware printing status
app.post('/api/print-queue/status', (req: Request, res: Response) => {
  const { orderId, status, printerError } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ error: 'Missing orderId or status in body' });
  }

  console.log(`[PrintAgent] Updated order ${orderId} printStatus to ${status}. Error details: ${printerError || 'none'}`);

  res.json({
    success: true,
    message: `Print status updated successfully to ${status}`
  });
});

// Serve static assets in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback all other requests to Vite SPA index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler] Caught exception:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Production-ready Express backend listening on port ${PORT}`);
});
