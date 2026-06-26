import React, { useState, useEffect } from 'react';
import SimulatedBrowser from './components/SimulatedBrowser';
import LandingPage from './components/LandingPage';
import SuperAdminPanel from './components/SuperAdminPanel';
import ShopPanel from './components/ShopPanel';
import CustomerPortal from './components/CustomerPortal';
import { Shop, Order, Coupon, SystemSettings, SupportTicket } from './types';
import {
  INITIAL_SHOPS,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_TICKETS,
} from './mockData';
import { Shield, Store, QrCode, Lock, Key, AlertTriangle, ArrowLeft, Cloud } from 'lucide-react';
import { isConfigured } from './firebase';
import { firebaseService } from './firebaseService';

export default function App() {
  // Navigation State (simulated URL)
  const [currentUrl, setCurrentUrl] = useState<string>('yourdomain.com');

  // Multi-Tenant Shared Data states (Synced to localStorage)
  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('qr_print_saas_shops');
    return saved ? JSON.parse(saved) : INITIAL_SHOPS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('qr_print_saas_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('qr_print_saas_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('qr_print_saas_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('qr_print_saas_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  // Track if Firebase initial load is completed
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState<boolean>(false);

  // Authentication states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(true); // pre-authenticate for seamless sandbox play
  const [loggedInShopId, setLoggedInShopId] = useState<string | null>('mrxprint'); // pre-authenticate for demo shop

  // Initial Firebase Load
  useEffect(() => {
    if (isConfigured) {
      const loadFirebaseData = async () => {
        try {
          const remoteShops = await firebaseService.getShops();
          if (remoteShops && remoteShops.length > 0) {
            setShops(remoteShops);
          } else {
            // Seed Firestore with initial shops
            for (const s of INITIAL_SHOPS) {
              await firebaseService.saveShop(s);
            }
          }

          const remoteOrders = await firebaseService.getOrders();
          if (remoteOrders && remoteOrders.length > 0) {
            setOrders(remoteOrders);
          } else {
            // Seed Firestore with initial orders
            for (const o of INITIAL_ORDERS) {
              await firebaseService.saveOrder(o);
            }
          }

          const remoteCoupons = await firebaseService.getCoupons();
          if (remoteCoupons && remoteCoupons.length > 0) {
            setCoupons(remoteCoupons);
          } else {
            // Seed coupons
            for (const c of INITIAL_COUPONS) {
              await firebaseService.saveCoupon(c);
            }
          }

          const remoteSettings = await firebaseService.getSettings();
          if (remoteSettings) {
            setSettings(remoteSettings);
          } else {
            await firebaseService.saveSettings(INITIAL_SETTINGS);
          }

          const remoteTickets = await firebaseService.getTickets();
          if (remoteTickets && remoteTickets.length > 0) {
            setTickets(remoteTickets);
          } else {
            for (const t of INITIAL_TICKETS) {
              await firebaseService.saveTicket(t);
            }
          }
        } catch (error) {
          console.error('Error seeding/loading Firebase data:', error);
        } finally {
          setIsFirebaseLoaded(true);
        }
      };
      loadFirebaseData();
    } else {
      setIsFirebaseLoaded(true);
    }
  }, []);

  // Sync to local storage and Firebase
  useEffect(() => {
    localStorage.setItem('qr_print_saas_shops', JSON.stringify(shops));
    if (isConfigured && isFirebaseLoaded) {
      shops.forEach((shop) => {
        firebaseService.saveShop(shop);
      });
    }
  }, [shops, isFirebaseLoaded]);

  useEffect(() => {
    localStorage.setItem('qr_print_saas_orders', JSON.stringify(orders));
    if (isConfigured && isFirebaseLoaded) {
      orders.forEach((order) => {
        firebaseService.saveOrder(order);
      });
    }
  }, [orders, isFirebaseLoaded]);

  useEffect(() => {
    localStorage.setItem('qr_print_saas_coupons', JSON.stringify(coupons));
    if (isConfigured && isFirebaseLoaded) {
      coupons.forEach((coupon) => {
        firebaseService.saveCoupon(coupon);
      });
    }
  }, [coupons, isFirebaseLoaded]);

  useEffect(() => {
    localStorage.setItem('qr_print_saas_settings', JSON.stringify(settings));
    if (isConfigured && isFirebaseLoaded) {
      firebaseService.saveSettings(settings);
    }
  }, [settings, isFirebaseLoaded]);

  useEffect(() => {
    localStorage.setItem('qr_print_saas_tickets', JSON.stringify(tickets));
    if (isConfigured && isFirebaseLoaded) {
      tickets.forEach((ticket) => {
        firebaseService.saveTicket(ticket);
      });
    }
  }, [tickets, isFirebaseLoaded]);

  // Handle register a new shop from Landing Page
  const handleRegisterShop = (
    newShopData: Omit<Shop, 'revenue' | 'createdAt' | 'qrCode' | 'status' | 'printerStatus' | 'printerName'>
  ) => {
    const newShop: Shop = {
      ...newShopData,
      status: 'active',
      createdAt: new Date().toISOString(),
      revenue: 0,
      printerStatus: 'online',
      printerName: 'Generic USB Counter Printer',
      qrCode: `${newShopData.id}-qr-code`,
    };
    setShops((prev) => [...prev, newShop]);
    setLoggedInShopId(newShop.id); // auto-login the owner session for their brand-new shop!
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    
    // Add transaction to shop total revenue if already paid
    if (newOrder.paymentStatus === 'paid') {
      setShops((prevShops) =>
        prevShops.map((s) => {
          if (s.id === newOrder.shopId) {
            return {
              ...s,
              revenue: s.revenue + newOrder.totalPrice,
            };
          }
          return s;
        })
      );
    }
  };

  // Helper Login Handlers
  const [adminEmail, setAdminEmail] = useState('admin@qrprintsaas.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [shopEmail, setShopEmail] = useState('alex@mrxprint.com');
  const [shopPassword, setShopPassword] = useState('password123');

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === settings.superAdminEmail && adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
    } else {
      alert('Invalid super admin credentials. Try preloaded defaults!');
    }
  };

  const handleShopLoginSubmit = (e: React.FormEvent, shopId: string) => {
    e.preventDefault();
    const targetShop = shops.find((s) => s.id === shopId);
    if (targetShop && shopEmail === targetShop.ownerEmail && shopPassword === 'password123') {
      setLoggedInShopId(shopId);
    } else {
      alert(`Invalid shop credentials. Note: Owner email is ${targetShop?.ownerEmail} and password is "password123"`);
    }
  };

  // ROUTER CONTROLLER
  const renderRouterView = () => {
    // 1. LANDING WEBSITE
    if (currentUrl === 'yourdomain.com') {
      return (
        <LandingPage
          shops={shops}
          onRegisterShop={handleRegisterShop}
          onNavigate={setCurrentUrl}
        />
      );
    }

    // 2. SUPER ADMIN PANEL
    if (currentUrl === 'admin.yourdomain.com') {
      if (!isAdminLoggedIn) {
        return (
          <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 min-h-[500px]">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Super Admin Portal</h2>
                <p className="text-slate-400 text-xs mt-1">Please log in to manage your SaaS operations.</p>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-left">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-left">Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-md shadow-blue-100"
                >
                  Sign In to Control Center
                </button>
              </form>

              <button
                onClick={() => {
                  setAdminEmail('admin@qrprintsaas.com');
                  setAdminPassword('admin123');
                }}
                className="text-xs text-blue-600 hover:underline block mx-auto font-medium"
              >
                Autofill Demo Credentials
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="flex-1 flex flex-col">
          {/* Admin quick session controller */}
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 flex justify-between items-center text-xs font-semibold text-blue-800">
            <span>Logged in as Super Admin ({settings.superAdminEmail})</span>
            <button
              onClick={() => setIsAdminLoggedIn(false)}
              className="text-blue-600 hover:underline"
            >
              Logout Admin
            </button>
          </div>
          <SuperAdminPanel
            shops={shops}
            orders={orders}
            coupons={coupons}
            settings={settings}
            tickets={tickets}
            onUpdateShops={setShops}
            onUpdateCoupons={setCoupons}
            onUpdateSettings={setSettings}
            onUpdateTickets={setTickets}
            onNavigate={setCurrentUrl}
          />
        </div>
      );
    }

    // 3. SHOP DASHBOARD (yourdomain.com/shop/{shop-id})
    if (currentUrl.startsWith('yourdomain.com/shop/')) {
      const shopId = currentUrl.split('/shop/')[1];
      const matchingShop = shops.find((s) => s.id === shopId);

      if (!matchingShop) {
        return (
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-slate-800">Tenant Shop Not Found</h2>
            <p className="text-slate-500 text-xs mt-1 mb-6">The requested shop link is invalid or has been decommissioned.</p>
            <button
              onClick={() => setCurrentUrl('yourdomain.com')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
            >
              Return to Landing Page
            </button>
          </div>
        );
      }

      // If not authenticated for this specific shop
      if (loggedInShopId !== shopId) {
        return (
          <div className="flex-1 bg-slate-50 flex items-center justify-center p-6 min-h-[500px]">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-sm w-full text-center space-y-6">
              <div className="flex justify-center mb-2">
                <img src={matchingShop.logoUrl} alt={matchingShop.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{matchingShop.name} Dashboard</h2>
                <p className="text-slate-400 text-xs mt-1">Please authenticate with your designated merchant email.</p>
              </div>

              <form onSubmit={(e) => handleShopLoginSubmit(e, shopId)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-left">Owner Email Address</label>
                  <input
                    type="email"
                    required
                    value={shopEmail}
                    onChange={(e) => setShopEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-left">Password</label>
                  <input
                    type="password"
                    required
                    value={shopPassword}
                    onChange={(e) => setShopPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition shadow-md shadow-blue-100"
                >
                  Enter Shop Dashboard
                </button>
              </form>

              <button
                onClick={() => {
                  setShopEmail(matchingShop.ownerEmail);
                  setShopPassword('password123');
                }}
                className="text-xs text-blue-600 hover:underline block mx-auto font-medium"
              >
                Autofill Pre-configured Owner
              </button>
            </div>
          </div>
        );
      }

      const updateShopInState = (updatedShop: Shop) => {
        setShops((prev) => prev.map((s) => (s.id === updatedShop.id ? updatedShop : s)));
      };

      return (
        <div className="flex-1 flex flex-col">
          {/* Shop session status bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex justify-between items-center text-xs font-semibold text-slate-700">
            <span>Owner Session Active: <strong>{matchingShop.ownerEmail}</strong></span>
            <button
              onClick={() => setLoggedInShopId(null)}
              className="text-rose-600 hover:underline"
            >
              Sign Out Shop
            </button>
          </div>
          <ShopPanel
            shop={matchingShop}
            orders={orders}
            tickets={tickets}
            onUpdateShop={updateShopInState}
            onUpdateOrders={setOrders}
            onUpdateTickets={setTickets}
            onNavigate={setCurrentUrl}
          />
        </div>
      );
    }

    // 4. CUSTOMER UPLOAD WEBSITE (yourdomain.com/{shop-id})
    const shopId = currentUrl.split('yourdomain.com/')[1];
    const matchingShop = shops.find((s) => s.id === shopId);

    if (matchingShop) {
      if (matchingShop.status === 'blocked') {
        return (
          <div className="flex-1 bg-rose-50/50 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Print Portal Suspended</h2>
            <p className="text-slate-600 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              This printing location (<strong>{matchingShop.name}</strong>) has been blocked or suspended by the platform administrator due to policy compliance or unpaid SaaS subscriptions.
            </p>
            <button
              onClick={() => setCurrentUrl('yourdomain.com')}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Return to SaaS Home
            </button>
          </div>
        );
      }

      return (
        <CustomerPortal
          shop={matchingShop}
          orders={orders}
          coupons={coupons}
          onAddOrder={handleAddOrder}
          onNavigate={setCurrentUrl}
        />
      );
    }

    // Default Fallback
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">404 - Page Not Found</h2>
        <button
          onClick={() => setCurrentUrl('yourdomain.com')}
          className="mt-4 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
        >
          Return Home
        </button>
      </div>
    );
  };

  return (
    <SimulatedBrowser
      currentUrl={currentUrl}
      onChangeUrl={setCurrentUrl}
      shops={shops}
    >
      {renderRouterView()}
    </SimulatedBrowser>
  );
}
