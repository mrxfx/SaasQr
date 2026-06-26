import React, { useState } from 'react';
import { Shop, Order, SupportTicket } from '../types';
import {
  Store,
  Printer,
  FileText,
  DollarSign,
  Users,
  QrCode,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Play,
  Check,
  XCircle,
  HelpCircle,
  Download,
  Upload,
  RefreshCw,
  Plus,
  ArrowRight,
  AlertCircle,
  Heart,
  ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ShopPanelProps {
  shop: Shop;
  orders: Order[];
  tickets: SupportTicket[];
  onUpdateShop: (updatedShop: Shop) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateTickets: (tickets: SupportTicket[]) => void;
  onNavigate: (url: string) => void;
}

export default function ShopPanel({
  shop,
  orders,
  tickets,
  onUpdateShop,
  onUpdateOrders,
  onUpdateTickets,
  onNavigate,
}: ShopPanelProps) {
  const [activeTab, setActiveTab] = useState<'queue' | 'pricing' | 'history' | 'support'>('queue');
  const [logoUrlInput, setLogoUrlInput] = useState(shop.logoUrl);
  const [showQrCard, setShowQrCard] = useState(false);
  
  // Support Form state
  const [supportFormData, setSupportFormData] = useState({
    subject: '',
    message: '',
  });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Filter orders for this shop only!
  const shopOrders = orders.filter((o) => o.shopId === shop.id);
  
  // Stats
  const completedOrders = shopOrders.filter((o) => o.printStatus === 'completed');
  const totalRevenue = shopOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  const pendingQueue = shopOrders.filter((o) => o.printStatus === 'queued' || o.printStatus === 'printing');
  
  const customerPhones = Array.from(new Set(shopOrders.map((o) => o.customerPhone)));

  // Group revenue by payment method
  const cashRevenue = shopOrders
    .filter((o) => o.paymentStatus === 'paid' && o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  const upiRevenue = totalRevenue - cashRevenue;

  // Chart data: daily/order history
  const orderHistoryChartData = shopOrders.slice(-8).map((o, idx) => ({
    name: o.id,
    amount: o.totalPrice,
  }));

  // Update shop settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShop({
      ...shop,
      logoUrl: logoUrlInput,
    });
    alert('Shop settings saved successfully.');
  };

  const handleUpdatePrice = (field: 'bwPrice' | 'colorPrice', value: number) => {
    onUpdateShop({
      ...shop,
      [field]: value,
    });
  };

  const handleUpdatePaperPrice = (paper: 'A3' | 'Letter', value: number) => {
    onUpdateShop({
      ...shop,
      paperPrices: {
        ...shop.paperPrices,
        [paper]: value,
      },
    });
  };

  const handleTogglePrinter = () => {
    const statuses: ('online' | 'offline' | 'error')[] = ['online', 'offline', 'error'];
    const nextIndex = (statuses.indexOf(shop.printerStatus) + 1) % statuses.length;
    onUpdateShop({
      ...shop,
      printerStatus: statuses[nextIndex],
    });
  };

  // Change print queue status
  const handleChangePrintStatus = (orderId: string, nextStatus: 'printing' | 'completed' | 'cancelled') => {
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        // If transitioning to paid on completion
        let paymentStatus = o.paymentStatus;
        if (nextStatus === 'completed' && o.paymentMethod === 'cash') {
          paymentStatus = 'paid';
        }

        return {
          ...o,
          printStatus: nextStatus,
          paymentStatus,
        } as Order;
      }
      return o;
    });

    onUpdateOrders(updatedOrders);

    // If order was completed and paid, update the shop's lifetime revenue
    if (nextStatus === 'completed') {
      const order = orders.find((o) => o.id === orderId);
      if (order && order.paymentStatus !== 'paid') {
        onUpdateShop({
          ...shop,
          revenue: shop.revenue + order.totalPrice,
        });
      }
    }
  };

  // Create Support Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportFormData.subject || !supportFormData.message) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      shopId: shop.id,
      shopName: shop.name,
      customerName: shop.ownerName,
      subject: supportFormData.subject,
      message: supportFormData.message,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    onUpdateTickets([...tickets, newTicket]);
    setSupportFormData({ subject: '', message: '' });
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  // Simulated Report Download
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to view report printout.');
      return;
    }
    
    const ordersHtml = shopOrders.map((o) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-family: monospace;">${o.id}</td>
        <td style="padding: 10px;">${o.fileName}</td>
        <td style="padding: 10px; text-transform: uppercase;">${o.colorMode} (${o.paperSize})</td>
        <td style="padding: 10px;">${o.copies}</td>
        <td style="padding: 10px; text-transform: uppercase;">${o.paymentMethod}</td>
        <td style="padding: 10px; text-transform: uppercase;">${o.printStatus}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">₹${o.totalPrice}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${shop.name} - Printing Audit Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            h1 { margin-bottom: 5px; font-weight: 800; }
            p { margin-top: 0; color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { text-align: left; padding: 12px; background: #f4f4f5; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
            .summary { margin-top: 40px; border-top: 2px solid #333; padding-top: 20px; display: flex; justify-content: space-between; }
            .sum-item { text-align: right; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1>${shop.name}</h1>
              <p>Owner: ${shop.ownerName} (${shop.ownerEmail})</p>
              <p>Report Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <img src="${shop.logoUrl}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover;" />
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>File Name</th>
                <th>Format</th>
                <th>Copies</th>
                <th>Payment</th>
                <th>Print Status</th>
                <th style="text-align: right;">Total price</th>
              </tr>
            </thead>
            <tbody>
              ${ordersHtml}
            </tbody>
          </table>

          <div class="summary">
            <div>
              <p>SaaS Provider: QR Print SaaS</p>
            </div>
            <div class="sum-item">
              <h3>Total Orders: ${shopOrders.length}</h3>
              <h2>Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}</h2>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="shop-owner-panel" className="flex flex-col md:flex-row min-h-[500px] bg-slate-50 flex-1">
      {/* Sidebar navigation */}
      <aside id="shop-sidebar" className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src={shop.logoUrl} alt={shop.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
            <div className="truncate">
              <h2 className="font-bold text-slate-900 text-sm leading-tight truncate">{shop.name}</h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Shop Owner Admin</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('queue')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'queue'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Printer className="w-4 h-4" />
              Print Queue
              {pendingQueue.length > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingQueue.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'pricing'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Printer & Pricing
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Customer History
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'support'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Contact SaaS Admin
            </button>
          </nav>
        </div>

        {/* Action button to check customer view */}
        <div className="space-y-4 border-t border-slate-100 pt-6 mt-6">
          <button
            onClick={() => onNavigate(`yourdomain.com/${shop.id}`)}
            className="w-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            Go to Customer Page
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {shop.ownerName[0]}
            </div>
            <div className="truncate">
              <h4 className="font-bold text-slate-800 text-xs truncate">{shop.ownerName}</h4>
              <span className="text-[9px] text-slate-400 font-medium truncate">{shop.ownerEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main pane content */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Top welcome status bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{shop.name}</h1>
              <span className="text-slate-400 text-xs font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">@{shop.id}</span>
            </div>
            <p className="text-slate-500 text-xs">Set up pricing, manage customers, and handle incoming print queues.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Audit Report */}
            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Download Audit
            </button>

            {/* Custom QR Code Print Button */}
            <button
              onClick={() => setShowQrCard(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              Show Shop QR Code
            </button>
          </div>
        </div>

        {/* Dynamic inner tabs */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Total Gross Sales</span>
                  <span className="text-xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">UPI Payments</span>
                  <span className="text-xl font-black text-slate-900">₹{upiRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Cash Collection</span>
                  <span className="text-xl font-black text-slate-900">₹{cashRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              {/* Printer Hardware connection health */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Printer Health</span>
                  <span className={`text-sm font-black uppercase ${
                    shop.printerStatus === 'online'
                      ? 'text-green-600'
                      : shop.printerStatus === 'error'
                      ? 'text-rose-600 animate-pulse'
                      : 'text-slate-400'
                  }`}>
                    ● {shop.printerStatus}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{shop.printerName}</span>
                </div>
                <button
                  onClick={handleTogglePrinter}
                  className="p-2 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition"
                  title="Toggle connection status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Live Print Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Live Print Queue</h3>
                  <p className="text-[11px] text-slate-400">Mark orders as printing, complete, or refund them immediately.</p>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                    {shopOrders.filter((o) => o.printStatus === 'queued' || o.printStatus === 'printing').length} Pending
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {completedOrders.length} Done
                  </span>
                </div>
              </div>

              {shopOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Printer className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No print orders received yet</p>
                  <p className="text-xs">Counter QR uploads will automatically show up here in real-time!</p>
                  <button
                    onClick={() => onNavigate(`yourdomain.com/${shop.id}`)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition"
                  >
                    Simulate a Customer Upload
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {shopOrders.map((order) => (
                    <div key={`order-row-${order.id}`} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl font-mono text-xs font-black self-start">
                          #{order.id.split('-')[1]}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm truncate" title={order.fileName}>
                              {order.fileName}
                            </span>
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">
                              {order.fileType}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span>Phone: <strong className="text-slate-800 font-semibold">{order.customerPhone}</strong></span>
                            <span>•</span>
                            <span>Copies: <strong className="text-slate-800 font-semibold">{order.copies}</strong></span>
                            <span>•</span>
                            <span className="capitalize font-semibold text-slate-600">
                              {order.colorMode === 'bw' ? 'Black & White' : 'Color'} ({order.paperSize})
                            </span>
                            <span>•</span>
                            <span>Size: {order.fileSize}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1.5">
                            {/* Payment status badge */}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : order.paymentStatus === 'failed'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {order.paymentStatus} ({order.paymentMethod})
                            </span>

                            {/* Print status badge */}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              order.printStatus === 'completed'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : order.printStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                            }`}>
                              Status: {order.printStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex sm:flex-col items-end gap-3.5 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="text-right flex sm:block justify-between items-center w-full sm:w-auto">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Grand Price</span>
                          <span className="text-lg font-black text-slate-900">₹{order.totalPrice}</span>
                        </div>

                        {order.printStatus !== 'completed' && order.printStatus !== 'cancelled' && (
                          <div className="flex gap-2 w-full sm:w-auto">
                            {order.printStatus === 'queued' ? (
                              <button
                                onClick={() => handleChangePrintStatus(order.id, 'printing')}
                                className="flex-1 sm:flex-none text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5" /> Start
                              </button>
                            ) : (
                              <button
                                onClick={() => handleChangePrintStatus(order.id, 'completed')}
                                className="flex-1 sm:flex-none text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" /> Done
                              </button>
                            )}

                            <button
                              onClick={() => handleChangePrintStatus(order.id, 'cancelled')}
                              className="text-xs border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Setting Prices Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 md:col-span-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Set Printing Prices</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Black & White Price (₹ per page)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={shop.bwPrice}
                      onChange={(e) => handleUpdatePrice('bwPrice', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Color Price (₹ per page)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={shop.colorPrice}
                      onChange={(e) => handleUpdatePrice('colorPrice', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Paper Size Surcharges */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs">Paper Size Surcharges (Added to base price)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">A4 Size Extra</label>
                    <span className="text-xs font-bold text-slate-500 block py-2 px-1 bg-slate-50 border border-slate-100 rounded text-center">₹0 (Base)</span>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">A3 Size Extra (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={shop.paperPrices.A3}
                      onChange={(e) => handleUpdatePaperPrice('A3', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] font-bold uppercase mb-1">Letter Size Extra (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={shop.paperPrices.Letter}
                      onChange={(e) => handleUpdatePaperPrice('Letter', Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Profile settings (Logo) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Shop Branding</h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="flex flex-col items-center gap-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <img src={logoUrlInput || shop.logoUrl} alt="logo preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Logo Preview</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-blue-50"
                >
                  Save Brand Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-sm">Customer Print Volume History</h3>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Customer Phone</th>
                    <th className="px-6 py-4 text-center">Total Orders</th>
                    <th className="px-6 py-4 text-right">Total Contributed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerPhones.map((phone) => {
                    const custOrders = shopOrders.filter((o) => o.customerPhone === phone);
                    const custValue = custOrders.reduce((sum, o) => sum + o.totalPrice, 0);
                    return (
                      <tr key={`cust-${phone}`} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-bold text-slate-900">{phone}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">{custOrders.length}</td>
                        <td className="px-6 py-4 text-right font-black text-blue-600">₹{custValue}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm md:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Open Ticket with SaaS Support</h3>

              {ticketSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  Ticket submitted! Super Admin has been notified. They can respond via Support Panel.
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Subject*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Printer Connection Issue"
                    value={supportFormData.subject}
                    onChange={(e) => setSupportFormData({ ...supportFormData, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Explain details*</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write details of the issue..."
                    value={supportFormData.message}
                    onChange={(e) => setSupportFormData({ ...supportFormData, message: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition shadow-md shadow-blue-50"
                >
                  Submit Ticket
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Previous Tickets</h3>
              
              <div className="space-y-3">
                {tickets
                  .filter((t) => t.shopId === shop.id)
                  .map((t) => (
                    <div key={`ticket-${t.id}`} className="p-3 border border-slate-100 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800 truncate">{t.subject}</span>
                        <span className={`text-[9px] uppercase px-1 rounded ${
                          t.status === 'open' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-slate-500 line-clamp-2">{t.message}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Printable Dialog */}
      {showQrCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-8 text-center relative">
            <button
              onClick={() => setShowQrCard(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-2 block">Counter QR Standee</span>
            <h3 className="text-lg font-black text-slate-900 mb-6">{shop.name}</h3>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-center mb-6 max-w-[220px] mx-auto shadow-inner">
              <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <QrCode className="w-36 h-36 text-slate-900" />
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6 px-4">
              Place this standee at your counter. Customers can scan to upload and print instantly without typing URLs.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) return;
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Counter Standee - ${shop.name}</title>
                        <style>
                          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; text-align: center; }
                          .card { border: 3px solid #2563EB; border-radius: 24px; padding: 40px; max-width: 350px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                          h1 { margin: 10px 0; color: #1e293b; font-size: 24px; font-weight: 800; }
                          h2 { margin: 0; color: #2563EB; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; }
                          p { font-size: 12px; color: #64748b; margin-top: 15px; }
                          .qr-border { border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; display: inline-block; background: #f8fafc; margin: 25px 0; }
                        </style>
                      </head>
                      <body>
                        <div class="card">
                          <h2>Contactless Printing</h2>
                          <h1>${shop.name}</h1>
                          <div class="qr-border">
                            <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 7h2v2H7zM15 7h2v2h-2zM7 15h2v2H7zM15 15h2v2h-2z"/></svg>
                          </div>
                          <p>SCAN TO UPLOAD & PRINT DOCUMENTS</p>
                          <strong style="font-size: 11px; color: #475569;">Powered by QR Print SaaS</strong>
                        </div>
                        <script>window.print();</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition"
              >
                Print Standee
              </button>
              <button
                onClick={() => {
                  alert('Counter standee image saved to local assets!');
                  setShowQrCard(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-blue-50"
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
