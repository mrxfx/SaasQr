import React, { useState } from 'react';
import { Shop, Order, Coupon, SystemSettings, SupportTicket } from '../types';
import {
  LayoutDashboard,
  Store,
  FileText,
  Percent,
  LifeBuoy,
  Settings,
  Plus,
  Search,
  Check,
  Ban,
  Trash2,
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  Eye,
  QrCode,
  ArrowUpRight,
  UserCheck,
  AlertTriangle,
  Download,
  Shield,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface SuperAdminPanelProps {
  shops: Shop[];
  orders: Order[];
  coupons: Coupon[];
  settings: SystemSettings;
  tickets: SupportTicket[];
  onUpdateShops: (shops: Shop[]) => void;
  onUpdateCoupons: (coupons: Coupon[]) => void;
  onUpdateSettings: (settings: SystemSettings) => void;
  onUpdateTickets: (tickets: SupportTicket[]) => void;
  onNavigate: (url: string) => void;
}

export default function SuperAdminPanel({
  shops,
  orders,
  coupons,
  settings,
  tickets,
  onUpdateShops,
  onUpdateCoupons,
  onUpdateSettings,
  onUpdateTickets,
  onNavigate,
}: SuperAdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'shops' | 'orders' | 'coupons' | 'support' | 'settings'>('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Edit Shop Form states
  const [showShopModal, setShowShopModal] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopFormData, setShopFormData] = useState({
    id: '',
    name: '',
    ownerName: '',
    ownerEmail: '',
    logoUrl: '',
    bwPrice: 2,
    colorPrice: 10,
    printerName: 'HP LaserJet Pro M404dn',
  });

  // Coupon Form state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountPercent: 10,
    isActive: true,
  });

  // Calculate high-level stats
  const totalSaaSVolume = orders.length;
  const totalGrossRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  // Platform commission earnings (e.g. 5% of gross revenue)
  const commissionPercent = settings.commissionPercent;
  const saasEarnings = (totalGrossRevenue * commissionPercent) / 100;
  
  const activeShops = shops.filter((s) => s.status === 'active');
  const blockedShops = shops.filter((s) => s.status === 'blocked');

  // Prepare chart data (simulated hourly or shop-wise revenue)
  const shopRevenueChartData = shops.map((s) => ({
    name: s.name.split(' ')[0], // short name
    revenue: s.revenue,
    orders: orders.filter((o) => o.shopId === s.id).length,
  }));

  // Handle block/approve
  const toggleShopStatus = (shopId: string) => {
    const updated = shops.map((shop) => {
      if (shop.id === shopId) {
        return {
          ...shop,
          status: shop.status === 'active' ? 'blocked' : 'active',
        } as Shop;
      }
      return shop;
    });
    onUpdateShops(updated);
  };

  // Handle edit shop save
  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShop) {
      const updated = shops.map((shop) => {
        if (shop.id === editingShop.id) {
          return {
            ...shop,
            name: shopFormData.name,
            ownerName: shopFormData.ownerName,
            ownerEmail: shopFormData.ownerEmail,
            logoUrl: shopFormData.logoUrl,
            bwPrice: Number(shopFormData.bwPrice),
            colorPrice: Number(shopFormData.colorPrice),
            printerName: shopFormData.printerName,
          };
        }
        return shop;
      });
      onUpdateShops(updated);
    } else {
      // Create new shop
      const shopId = shopFormData.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (shops.some((s) => s.id === shopId)) {
        alert('Shop ID already exists!');
        return;
      }
      const newShop: Shop = {
        id: shopId,
        name: shopFormData.name,
        ownerName: shopFormData.ownerName,
        ownerEmail: shopFormData.ownerEmail,
        logoUrl: shopFormData.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
        bwPrice: Number(shopFormData.bwPrice),
        colorPrice: Number(shopFormData.colorPrice),
        paperPrices: { A4: 0, A3: 5, Letter: 1 },
        status: 'active',
        createdAt: new Date().toISOString(),
        revenue: 0,
        printerStatus: 'online',
        printerName: shopFormData.printerName,
        qrCode: `${shopId}-qr-code`,
      };
      onUpdateShops([...shops, newShop]);
    }
    setShowShopModal(false);
    setEditingShop(null);
  };

  const handleOpenEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setShopFormData({
      id: shop.id,
      name: shop.name,
      ownerName: shop.ownerName,
      ownerEmail: shop.ownerEmail,
      logoUrl: shop.logoUrl,
      bwPrice: shop.bwPrice,
      colorPrice: shop.colorPrice,
      printerName: shop.printerName || 'Standard Printer',
    });
    setShowShopModal(true);
  };

  const handleDeleteShop = (shopId: string) => {
    if (confirm(`Are you sure you want to delete ${shopId}? This action cannot be undone.`)) {
      onUpdateShops(shops.filter((s) => s.id !== shopId));
    }
  };

  // Add Coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponFormData.code.toUpperCase().trim();
    if (coupons.some((c) => c.code === code)) {
      alert('Coupon code already exists!');
      return;
    }
    const newCoupon: Coupon = {
      code,
      discountPercent: Number(couponFormData.discountPercent),
      isActive: couponFormData.isActive,
    };
    onUpdateCoupons([...coupons, newCoupon]);
    setShowCouponModal(false);
    setCouponFormData({ code: '', discountPercent: 10, isActive: true });
  };

  const toggleCouponStatus = (code: string) => {
    onUpdateCoupons(
      coupons.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCoupon = (code: string) => {
    onUpdateCoupons(coupons.filter((c) => c.code !== code));
  };

  // Ticket status toggle
  const toggleTicketStatus = (id: string) => {
    onUpdateTickets(
      tickets.map((t) => (t.id === id ? { ...t, status: t.status === 'open' ? 'resolved' : 'open' } : t))
    );
  };

  return (
    <div id="super-admin-panel" className="flex flex-col md:flex-row min-h-[500px] bg-slate-50 flex-1">
      {/* Sidebar Navigation */}
      <aside id="admin-sidebar" className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm leading-tight">Super Admin</h2>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">SaaS Operations</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Analytics Dashboard
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'shops'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              Manage Shops
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'orders'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Platform Orders
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'coupons'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Percent className="w-4 h-4" />
              Manage Coupons
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'support'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              Support System
              {tickets.filter((t) => t.status === 'open').length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {tickets.filter((t) => t.status === 'open').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              Global Settings
            </button>
          </nav>
        </div>

        {/* User Badging */}
        <div className="border-t border-slate-100 pt-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm border border-slate-200">
              AD
            </div>
            <div className="truncate">
              <h4 className="font-bold text-slate-800 text-xs truncate">Super User</h4>
              <span className="text-[10px] text-slate-400 font-medium truncate">{settings.superAdminEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Top welcome status bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">QR Print SaaS Engine</h1>
            <p className="text-slate-500 text-xs">A centralized node control to observe platform tenants, queues, and configuration.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Dynamic Inner Panels */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Gross SaaS GMV</span>
                  <span className="text-2xl font-black text-slate-900">₹{totalGrossRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Platform Revenue ({commissionPercent}%)</span>
                  <span className="text-2xl font-black text-blue-600">₹{saasEarnings.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Tenant Shops</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{shops.length}</span>
                    <span className="text-[10px] text-green-600 font-bold">{activeShops.length} Active</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Store className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">Total Print Volume</span>
                  <span className="text-2xl font-black text-slate-900">{totalSaaSVolume} pages</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Charts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Tenant Sales Performance</h3>
                  <span className="text-slate-400 text-xs">Gross earnings per shop</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shopRevenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Alerts and Active Users */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-4">SaaS System Pulse</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="p-1 bg-amber-50 text-amber-600 rounded mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-slate-900 block font-semibold">1 Critical Printer Alert</strong>
                        <span>abcxerox reported paper jam/error.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="p-1 bg-blue-50 text-blue-600 rounded mt-0.5">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-slate-900 block font-semibold">Automatic UPI Verification</strong>
                        <span>PhonePe merchant callbacks are responsive.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>SaaS License:</span>
                    <span className="font-bold text-slate-800">Unlimited Tenant Mode</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Sandbox Storage:</span>
                    <span className="font-semibold text-slate-800">Client-Side Synced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Global Orders */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Recent Platform Orders</h3>
                <span className="text-slate-400 text-xs">{orders.length} orders tracked globally</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Tenant Shop</th>
                      <th className="px-6 py-4">Document</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={`global-ord-${order.id}`} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{order.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{order.shopName}</td>
                        <td className="px-6 py-4 max-w-[180px] truncate" title={order.fileName}>{order.fileName}</td>
                        <td className="px-6 py-4 uppercase font-semibold text-slate-500">{order.colorMode} ({order.paperSize})</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.printStatus === 'completed' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {order.printStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">₹{order.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shops' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                />
              </div>

              <button
                id="create-shop-btn"
                onClick={() => {
                  setEditingShop(null);
                  setShopFormData({
                    id: '',
                    name: '',
                    ownerName: '',
                    ownerEmail: '',
                    logoUrl: '',
                    bwPrice: 2,
                    colorPrice: 10,
                    printerName: 'HP LaserJet Pro M404dn',
                  });
                  setShowShopModal(true);
                }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                Register New Tenant
              </button>
            </div>

            {/* Shop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops
                .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((shop) => (
                  <div key={`shop-card-${shop.id}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="p-6 border-b border-slate-100 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img src={shop.logoUrl} alt={shop.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                          <div>
                            <h4 className="font-bold text-slate-900 leading-tight">{shop.name}</h4>
                            <span className="text-slate-400 text-xs">/{shop.id}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          shop.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {shop.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 pt-2">
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span className="font-medium text-slate-800">{shop.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Owner Email:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[150px]">{shop.ownerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>B&W / Color Base:</span>
                          <span className="font-medium text-slate-800">₹{shop.bwPrice} / ₹{shop.colorPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Earnings:</span>
                          <span className="font-bold text-blue-600">₹{shop.revenue.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleOpenEditModal(shop)}
                        className="text-[11px] bg-white border border-slate-200 hover:border-slate-300 font-semibold py-1.5 rounded-lg text-slate-700 transition text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleShopStatus(shop.id)}
                        className={`text-[11px] font-semibold py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1 border ${
                          shop.status === 'active'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {shop.status === 'active' ? (
                          <>
                            <Ban className="w-3.5 h-3.5" />
                            Block
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteShop(shop.id)}
                        className="text-[11px] bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 font-semibold py-1.5 rounded-lg text-center transition flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-slate-900 text-sm">Centralized Orders Audit List</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search order ID or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Shop Tenant</th>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Customer Phone</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Print Status</th>
                    <th className="px-6 py-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders
                    .filter((o) => o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customerPhone.includes(searchQuery))
                    .map((order) => (
                      <tr key={`global-ord-t-${order.id}`} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{order.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{order.shopName}</td>
                        <td className="px-6 py-4 truncate max-w-[150px]" title={order.fileName}>{order.fileName}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">{order.customerPhone}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.printStatus === 'completed'
                              ? 'bg-slate-100 text-slate-700'
                              : order.printStatus === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {order.printStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">₹{order.totalPrice}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Global Promo Coupons</h3>
              <button
                onClick={() => setShowCouponModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                Add Coupon
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Promo Code</th>
                    <th className="px-6 py-4">Discount Rate</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon) => (
                    <tr key={`cpn-${coupon.code}`} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 tracking-wider">{coupon.code}</td>
                      <td className="px-6 py-4 text-slate-800 font-bold">{coupon.discountPercent}% Off</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          coupon.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => toggleCouponStatus(coupon.code)}
                          className="px-2 py-1 text-[10px] border border-slate-200 rounded hover:bg-slate-50 text-slate-600 font-semibold"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          className="px-2 py-1 text-[10px] bg-red-50 hover:bg-red-100 rounded text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-sm">Tenant Support Tickets</h3>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={`tck-${ticket.id}`} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{ticket.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{ticket.subject}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase self-start sm:self-auto ${
                      ticket.status === 'open' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{ticket.message}</p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                    <div className="text-[10px] text-slate-400 space-x-3">
                      <span>Submitted by: <strong className="text-slate-600">{ticket.customerName}</strong> ({ticket.shopName})</span>
                      <span>•</span>
                      <span>Date: {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => toggleTicketStatus(ticket.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                        ticket.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {ticket.status === 'open' ? 'Mark Resolved' : 'Re-open Ticket'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Global Configuration</h3>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => onUpdateSettings({ ...settings, platformName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">SaaS Commission Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.commissionPercent}
                    onChange={(e) => onUpdateSettings({ ...settings, commissionPercent: Number(e.target.value) })}
                    className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                  <span className="text-slate-500 text-xs">Fee taken from every customer xerox order processed.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Super Admin Email Address</label>
                <input
                  type="email"
                  value={settings.superAdminEmail}
                  onChange={(e) => onUpdateSettings({ ...settings, superAdminEmail: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-6">
              <h4 className="font-bold text-slate-900 text-xs mb-3">Pricing Plan Tiers (For Sandbox Verification)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {settings.pricingPlans.map((plan, i) => (
                  <div key={`pln-cfg-${i}`} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="font-bold text-slate-800 text-xs block">{plan.name}</span>
                    <span className="text-sm font-black text-blue-600 block">₹{plan.price}/month</span>
                    <ul className="text-[10px] text-slate-500 list-disc pl-4 space-y-1">
                      {plan.features.slice(0, 3).map((f, fi) => (
                        <li key={fi}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shop Edit / Add Modal */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              {editingShop ? 'Modify Print Tenant' : 'Register New Tenant'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">Enter shop specific settings below.</p>

            <form onSubmit={handleSaveShop} className="space-y-4">
              {!editingShop && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unique Shop ID (URL path)*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apexprint"
                    value={shopFormData.id}
                    onChange={(e) => setShopFormData({ ...shopFormData, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shop Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Digital Print Lab"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner Name*</label>
                  <input
                    type="text"
                    required
                    value={shopFormData.ownerName}
                    onChange={(e) => setShopFormData({ ...shopFormData, ownerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner Email*</label>
                  <input
                    type="email"
                    required
                    value={shopFormData.ownerEmail}
                    onChange={(e) => setShopFormData({ ...shopFormData, ownerEmail: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">B&W Price (₹ / page)*</label>
                  <input
                    type="number"
                    required
                    min="0.5"
                    step="0.5"
                    value={shopFormData.bwPrice}
                    onChange={(e) => setShopFormData({ ...shopFormData, bwPrice: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color Price (₹ / page)*</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={shopFormData.colorPrice}
                    onChange={(e) => setShopFormData({ ...shopFormData, colorPrice: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Printer Hardware Device Model</label>
                <input
                  type="text"
                  required
                  value={shopFormData.printerName}
                  onChange={(e) => setShopFormData({ ...shopFormData, printerName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Logo URL (Optional)</label>
                <input
                  type="url"
                  value={shopFormData.logoUrl}
                  onChange={(e) => setShopFormData({ ...shopFormData, logoUrl: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 relative">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Create Coupon Code</h3>
            <p className="text-slate-500 text-xs mb-6">Create global discount coupons valid across shops.</p>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coupon Code*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON25"
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Rate (%)*</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="100"
                  value={couponFormData.discountPercent}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discountPercent: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="coupon-active-chk"
                  checked={couponFormData.isActive}
                  onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="coupon-active-chk" className="text-xs text-slate-600 font-semibold uppercase">Activate instantly</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
