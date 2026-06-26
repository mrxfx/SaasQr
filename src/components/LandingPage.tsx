import React, { useState } from 'react';
import { Store, Shield, ArrowRight, CheckCircle2, QrCode, FileText, Smartphone, Printer, Percent, Activity } from 'lucide-react';
import { Shop } from '../types';

interface LandingPageProps {
  shops: Shop[];
  onRegisterShop: (newShop: Omit<Shop, 'revenue' | 'createdAt' | 'qrCode' | 'status' | 'printerStatus' | 'printerName'>) => void;
  onNavigate: (url: string) => void;
}

export default function LandingPage({ shops, onRegisterShop, onNavigate }: LandingPageProps) {
  const [showRegModal, setShowRegModal] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    ownerName: '',
    ownerEmail: '',
    logoUrl: '',
    bwPrice: 2,
    colorPrice: 10,
    paperPriceA3: 5,
    paperPriceLetter: 1,
  });

  const [calcVolume, setCalcVolume] = useState(1500); // 1500 pages printed per month
  const [calcBwRatio, setCalcBwRatio] = useState(80); // 80% B&W, 20% Color

  const activeShopsCount = shops.filter(s => s.status === 'active').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.ownerName || !formData.ownerEmail) {
      alert('Please fill out all required fields.');
      return;
    }
    
    // Normalize shop ID
    const shopId = formData.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (shops.some(s => s.id === shopId)) {
      alert('This Shop ID is already taken. Please choose a unique identifier.');
      return;
    }

    onRegisterShop({
      id: shopId,
      name: formData.name,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      logoUrl: formData.logoUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop&q=80',
      bwPrice: Number(formData.bwPrice),
      colorPrice: Number(formData.colorPrice),
      paperPrices: {
        A4: 0,
        A3: Number(formData.paperPriceA3),
        Letter: Number(formData.paperPriceLetter),
      }
    });

    setShowRegModal(false);
    // Redirect to the newly created shop dashboard
    onNavigate(`yourdomain.com/shop/${shopId}`);
  };

  // Pricing calculator math
  const bwPages = (calcVolume * calcBwRatio) / 100;
  const colorPages = calcVolume - bwPages;
  const calculatedIncome = (bwPages * 2) + (colorPages * 10); // Standard B&W/Color pricing

  return (
    <div id="landing-page" className="flex flex-col flex-1 bg-white">
      {/* SaaS Navigation */}
      <header id="saas-header" className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">QR Print SaaS</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#calculator" className="hover:text-blue-600 transition">Earnings Calculator</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="#demo-shops" className="hover:text-blue-600 transition">Demo Shops</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            id="login-shop-dashboard"
            onClick={() => onNavigate('yourdomain.com/shop/mrxprint')}
            className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition px-3 py-2 rounded-lg"
          >
            Shop Login
          </button>
          <button
            id="register-shop-cta"
            onClick={() => setShowRegModal(true)}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition px-4 py-2.5 rounded-xl shadow-md shadow-blue-100"
          >
            Register Your Shop
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative px-6 py-20 md:py-32 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Activity className="w-3.5 h-3.5" />
            Empowering over {activeShopsCount} xerox & print shops worldwide
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            The Complete QR Code <br />
            <span className="text-blue-600 bg-clip-text">Printing Solution</span> for Shops
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Eliminate customer queues, cable-swapping, and Bluetooth pairing. Let customers scan, upload files, customize print properties, pay via UPI, and track their print status directly on their mobile phones!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-register-cta"
              onClick={() => setShowRegModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              id="hero-demo-cta"
              onClick={() => onNavigate('yourdomain.com/mrxprint')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl transition"
            >
              Test Customer Experience
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="max-w-4xl mx-auto mt-16 p-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 p-6 text-left">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scan & Print Instantly</h3>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Print shops display a unique QR Code on their counters. Customers scan it, select their PDFs or images, choose parameters, pay, and the printer does the rest automatically.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                No login required for customers
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Live print status & real-time queues
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Direct payments into shop owner UPI wallets
              </div>
            </div>
          </div>
          <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-md mb-4">
              <QrCode className="w-36 h-36 text-slate-900" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Interactive Sandbox</span>
            <span className="text-sm font-bold text-slate-800">Scan QR to Print Documents</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Why QR Print SaaS?</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Our modern cloud platform replaces outdated printing methods with a seamless, contactless, self-service SaaS portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Multi-Format Support</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Customers can upload PDFs, Word files (DOCX), or images (PNG/JPG) straight from their mobile devices with live page-count estimations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">UPI & Cash Payments</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Supports instantaneous checkout with PhonePe, Paytm, or simple Cash at Counter. Payments go directly to your designated merchant gateway.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Print Queue</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Shop owners receive real-time dashboard updates with ready-to-print file queues, custom parameters (color, double-sided, copies), and status controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="px-6 py-20 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-600 text-white rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-100 flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
                How much can your shop make with QR Print?
              </h2>
              <p className="text-blue-100 text-sm md:text-base mb-8 leading-relaxed">
                Our partners experience an average of **35% increase** in daily order volume by reducing counter waiting times and maximizing printer utilization efficiency.
              </p>

              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Monthly Printed Pages: <strong className="text-white text-sm">{calcVolume}</strong></span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="500"
                    value={calcVolume}
                    onChange={(e) => setCalcVolume(Number(e.target.value))}
                    className="w-full h-1.5 bg-blue-500 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Black & White Ratio: <strong className="text-white text-sm">{calcBwRatio}% B&W</strong></span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={calcBwRatio}
                    onChange={(e) => setCalcBwRatio(Number(e.target.value))}
                    className="w-full h-1.5 bg-blue-500 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col justify-center">
              <span className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Estimated Monthly Revenue</span>
              <span className="text-4xl md:text-5xl font-black text-white mb-4">₹{calculatedIncome.toLocaleString('en-IN')}</span>
              <div className="border-t border-white/20 pt-4 space-y-2 text-xs text-blue-100">
                <div className="flex justify-between">
                  <span>B&W Pages ({Math.round(bwPages)}):</span>
                  <span>₹{Math.round(bwPages * 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color Pages ({Math.round(colorPages)}):</span>
                  <span>₹{Math.round(colorPages * 10)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowRegModal(true)}
                className="mt-6 bg-white hover:bg-slate-50 text-blue-600 font-bold py-3 px-4 rounded-xl transition shadow-md"
              >
                Claim This Revenue Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Simple, Predictable Pricing</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Start free with basic setup and upgrade as your print business scales. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Starter Shop</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">₹299</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <p className="text-slate-500 text-xs mb-6">For small single-terminal copy shops starting to accept mobile print orders.</p>
              <ul className="space-y-3.5 mb-8 text-sm text-slate-600 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> 1 Shop Location</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Up to 500 orders/mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Standard QR Code</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Cash & UPI Payment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Email Support</li>
              </ul>
              <button
                onClick={() => setShowRegModal(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl transition"
              >
                Choose Plan
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-lg flex flex-col relative">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pro Multi-Print</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">₹799</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <p className="text-slate-500 text-xs mb-6">Perfect for multi-printer businesses and high-traffic copy outlets.</p>
              <ul className="space-y-3.5 mb-8 text-sm text-slate-600 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Up to 3 Locations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Unlimited Orders</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Custom QR Designs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Instant WhatsApp Alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Priority Printer APIs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> 24/7 Priority Support</li>
              </ul>
              <button
                onClick={() => setShowRegModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-md shadow-blue-100"
              >
                Choose Plan
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enterprise Network</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-slate-900">₹1,999</span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <p className="text-slate-500 text-xs mb-6">For college campuses, library systems, or franchise print networks.</p>
              <ul className="space-y-3.5 mb-8 text-sm text-slate-600 flex-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Unlimited Locations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Custom Branding & Domain</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Hardened Printer hardware</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Direct UPI Settlements</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4.5 h-4.5 text-blue-600" /> Advanced Analytics Reports</li>
              </ul>
              <button
                onClick={() => setShowRegModal(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl transition"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Active Shops List */}
      <section id="demo-shops" className="px-6 py-20 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Active Shops in the Sandbox</h2>
            <p className="text-slate-600 text-sm">Select an active shop below to instantly switch to its Customer Upload page or Shop Dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={`landing-shop-${shop.id}`} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-500 transition shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={shop.logoUrl} alt={shop.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{shop.name}</h4>
                      <span className="text-slate-400 text-xs">@{shop.id}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500 mb-6">
                    <div className="flex justify-between">
                      <span>B&W / Color Page:</span>
                      <span className="font-semibold text-slate-800">₹{shop.bwPrice} / ₹{shop.colorPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Printer Connected:</span>
                      <span className={`font-semibold uppercase ${shop.printerStatus === 'online' ? 'text-green-600' : shop.printerStatus === 'error' ? 'text-rose-600' : 'text-slate-400'}`}>
                        {shop.printerStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate(`yourdomain.com/${shop.id}`)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold py-2 rounded-lg text-slate-700 transition text-center"
                  >
                    Customer Portal
                  </button>
                  <button
                    onClick={() => onNavigate(`yourdomain.com/shop/${shop.id}`)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold py-2 rounded-lg text-slate-700 transition text-center"
                  >
                    Shop Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SaaS Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-6 border-t border-slate-800 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-white text-base">QR Print SaaS</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <button onClick={() => onNavigate('admin.yourdomain.com')} className="hover:text-white transition">Super Admin</button>
          </div>
          <div>
            © 2026 QR Print SaaS Inc. All rights reserved. Built with Vite & React.
          </div>
        </div>
      </footer>

      {/* Register Shop Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Create Your Print Shop</h3>
            <p className="text-slate-500 text-sm mb-6">Set up your local printing portal in the sandbox instantly.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unique Shop ID (URL path)*</label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="bg-slate-50 px-3 py-2 text-slate-400 text-sm border-r border-slate-200">yourdomain.com/</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apexprint"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="flex-1 px-3 py-2 text-sm outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shop Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Digital Print Lab"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Charles B"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Owner Email*</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. charlie@apex.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
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
                    value={formData.bwPrice}
                    onChange={(e) => setFormData({ ...formData, bwPrice: Number(e.target.value) })}
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
                    value={formData.colorPrice}
                    onChange={(e) => setFormData({ ...formData, colorPrice: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Paste an image address"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
                >
                  Register & Launch Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
