import React, { useState, useRef } from 'react';
import { Shop, Order, Coupon } from '../types';
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Printer,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  RefreshCw,
  QrCode
} from 'lucide-react';

interface CustomerPortalProps {
  shop: Shop;
  orders: Order[];
  coupons: Coupon[];
  onAddOrder: (newOrder: Order) => void;
  onNavigate: (url: string) => void;
}

export default function CustomerPortal({
  shop,
  orders,
  coupons,
  onAddOrder,
  onNavigate,
}: CustomerPortalProps) {
  // Step navigation: 'upload' | 'checkout' | 'tracking'
  const [step, setStep] = useState<'upload' | 'checkout' | 'tracking'>('upload');
  
  // File state
  const [file, setFile] = useState<{ name: string; size: string; type: string; pages: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Print parameter states
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Letter'>('A4');
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw');
  const [copies, setCopies] = useState<number>(1);
  const [manualPages, setManualPages] = useState<number>(1);

  // Coupon promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'phonepe' | 'paytm' | 'cash'>('phonepe');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Track active order placed
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Computed Prices
  const baseRate = colorMode === 'bw' ? shop.bwPrice : shop.colorPrice;
  const extraRate = paperSize === 'A4' ? 0 : paperSize === 'A3' ? shop.paperPrices.A3 : shop.paperPrices.Letter;
  const pricePerPage = baseRate + extraRate;
  const estimatedPages = file ? file.pages : manualPages;
  const rawTotal = pricePerPage * estimatedPages * copies;
  
  // Apply coupon discount if any
  const discountAmount = appliedCoupon ? (rawTotal * appliedCoupon.discountPercent) / 100 : 0;
  const grandTotal = Math.max(0, rawTotal - discountAmount);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      processUploadedFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  // Convert real file upload to sandbox file object
  const processUploadedFile = (uploadedFile: File) => {
    const ext = uploadedFile.name.split('.').pop()?.toUpperCase() || 'PDF';
    const sizeMB = (uploadedFile.size / (1024 * 1024)).toFixed(1);
    
    // Simulate page count guessing
    let guessedPages = 1;
    if (ext === 'PDF') {
      guessedPages = Math.floor(2 + Math.random() * 8); // guess 2-10 pages
    } else if (ext === 'DOCX') {
      guessedPages = Math.floor(1 + Math.random() * 4); // guess 1-5 pages
    }

    setFile({
      name: uploadedFile.name,
      size: `${sizeMB} MB`,
      type: ext,
      pages: guessedPages,
    });
  };

  // Preloaded sample files to facilitate rapid sandbox evaluation
  const handleLoadSampleFile = (type: 'invoice' | 'thesis' | 'id') => {
    if (type === 'invoice') {
      setFile({ name: 'Tax_Invoice_June.pdf', size: '1.2 MB', type: 'PDF', pages: 2 });
    } else if (type === 'thesis') {
      setFile({ name: 'Masters_Thesis_Draft_v4.docx', size: '14.8 MB', type: 'DOCX', pages: 32 });
    } else if (type === 'id') {
      setFile({ name: 'National_Identity_Scan.png', size: '2.5 MB', type: 'PNG', pages: 1 });
    }
  };

  // Coupon Verification
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = promoCode.toUpperCase().trim();
    const found = coupons.find((c) => c.code === code);
    
    if (found) {
      if (found.isActive) {
        setAppliedCoupon(found);
      } else {
        setCouponError('This coupon code is expired/disabled.');
      }
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  // Start Payment simulation
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone) {
      alert('Please enter a valid phone number for tracking!');
      return;
    }

    if (paymentMethod === 'cash') {
      createFinalOrder('pending');
    } else {
      // Simulate UPI checkout window
      setIsPaying(true);
      setTimeout(() => {
        setIsPaying(false);
        setPaymentCompleted(true);
        setTimeout(() => {
          createFinalOrder('paid');
        }, 1500);
      }, 3000); // 3 seconds merchant spinner
    }
  };

  // Store final order in shared data state
  const createFinalOrder = (payStatus: 'paid' | 'pending') => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const estTime = estimatedPages > 5 ? `${Math.ceil(estimatedPages * 0.5)} mins` : '2 mins';
    
    const newOrder: Order = {
      id: newOrderId,
      shopId: shop.id,
      shopName: shop.name,
      customerPhone,
      fileName: file ? file.name : 'Quick_Manual_Scan_File.pdf',
      fileType: file ? file.type : 'PDF',
      fileSize: file ? file.size : '1.0 MB',
      paperSize,
      colorMode,
      copies,
      totalPrice: grandTotal,
      paymentMethod,
      paymentStatus: payStatus,
      printStatus: 'queued',
      createdAt: new Date().toISOString(),
      estimatedTime: estTime,
    };

    onAddOrder(newOrder);
    setActiveOrderId(newOrderId);
    setStep('tracking');
    setPaymentCompleted(false);
  };

  // Get active placed order state for tracking updates
  const trackedOrder = orders.find((o) => o.id === activeOrderId);

  // Return to upload
  const handleReset = () => {
    setFile(null);
    setCopies(1);
    setManualPages(1);
    setAppliedCoupon(null);
    setPromoCode('');
    setStep('upload');
  };

  return (
    <div id="customer-portal-view" className="flex-1 bg-slate-50 flex flex-col justify-between">
      {/* Customer Header */}
      <header id="customer-header" className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={shop.logoUrl} alt={shop.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight">{shop.name}</h1>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
              Accepting Print Orders
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('yourdomain.com')}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 transition"
        >
          SaaS Home
        </button>
      </header>

      {/* Main Form content wrapper */}
      <div className="max-w-md w-full mx-auto p-4 md:p-6 space-y-6 flex-1">
        {step === 'upload' && (
          <div className="space-y-6 animate-fade-in">
            {/* Step progress */}
            <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-2xl shadow-md">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100">Step 1 of 2</span>
                <h2 className="font-extrabold text-sm tracking-tight">Upload & Set Parameters</h2>
              </div>
              <Printer className="w-5 h-5 opacity-80" />
            </div>

            {/* Drag & Drop upload container */}
            <div
              id="file-drop-zone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center bg-white ${
                dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              />

              {file ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    {file.type === 'PDF' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm truncate max-w-[220px] mx-auto">{file.name}</h4>
                    <p className="text-slate-400 text-xs">{file.size} • {file.pages} pages estimated</p>
                  </div>
                  <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200 inline-block uppercase">
                    Ready to configure
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Drag & drop files here</h4>
                    <p className="text-slate-400 text-xs mt-1">Supports PDF, DOCX, PNG, JPG (Max 50MB)</p>
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg transition inline-block">
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Sandbox Quick evaluation files loader */}
            {!file && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Sandbox Demo Files (No download required)</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleLoadSampleFile('invoice')}
                    className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 border border-slate-200 p-2 rounded-xl transition font-medium flex flex-col items-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    2-page PDF
                  </button>
                  <button
                    onClick={() => handleLoadSampleFile('thesis')}
                    className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 border border-slate-200 p-2 rounded-xl transition font-medium flex flex-col items-center gap-1"
                  >
                    <FileCode className="w-4 h-4" />
                    32-page Word
                  </button>
                  <button
                    onClick={() => handleLoadSampleFile('id')}
                    className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 border border-slate-200 p-2 rounded-xl transition font-medium flex flex-col items-center gap-1"
                  >
                    <ImageIcon className="w-4 h-4" />
                    ID Photo
                  </button>
                </div>
              </div>
            )}

            {/* Print Parameter Configurations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Configure Printout</h3>

              {/* Color Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Color Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setColorMode('bw')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      colorMode === 'bw'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Black & White (₹{shop.bwPrice}/p)
                  </button>
                  <button
                    onClick={() => setColorMode('color')}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      colorMode === 'color'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Color (₹{shop.colorPrice}/p)
                  </button>
                </div>
              </div>

              {/* Paper Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Paper Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['A4', 'A3', 'Letter'] as const).map((size) => {
                    const extra = size === 'A4' ? 0 : size === 'A3' ? shop.paperPrices.A3 : shop.paperPrices.Letter;
                    return (
                      <button
                        key={`size-${size}`}
                        onClick={() => setPaperSize(size)}
                        className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center ${
                          paperSize === size
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{size}</span>
                        <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                          {extra === 0 ? 'Base' : `+₹${extra}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pages & Copies Sizers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                  />
                </div>

                {!file ? (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Manual Pages count</label>
                    <input
                      type="number"
                      min="1"
                      value={manualPages}
                      onChange={(e) => setManualPages(Math.max(1, Number(e.target.value)))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">Estimated Pages</label>
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500 font-bold">
                      {file.pages} pages
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next checkout button */}
            <button
              onClick={() => {
                if (!file && manualPages <= 0) {
                  alert('Please configure pages count or upload a file.');
                  return;
                }
                setStep('checkout');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition-all"
            >
              Confirm Print Parameters (₹{grandTotal})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="space-y-6 animate-fade-in">
            {/* Step progress header */}
            <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-2xl shadow-md">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100">Step 2 of 2</span>
                <h2 className="font-extrabold text-sm tracking-tight">Checkout & Pay Shop</h2>
              </div>
              <Clock className="w-5 h-5 opacity-80" />
            </div>

            {/* Bill Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Bill Summary</h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Document Details:</span>
                  <span className="font-bold text-slate-800 max-w-[180px] truncate">{file ? file.name : 'Manual Document'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color Mode selection:</span>
                  <span className="capitalize font-semibold text-slate-800">{colorMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paper Size selection:</span>
                  <span className="font-semibold text-slate-800">{paperSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Print calculations:</span>
                  <span className="font-semibold text-slate-800">{estimatedPages} pages × {copies} copies</span>
                </div>
                <div className="flex justify-between">
                  <span>Base rate per page:</span>
                  <span className="font-semibold text-slate-800">₹{pricePerPage}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-semibold bg-green-50 px-2 py-1.5 rounded-lg border border-green-100">
                    <span>Promo Applied ({appliedCoupon.code}):</span>
                    <span>-{appliedCoupon.discountPercent}% (₹{discountAmount.toFixed(1)})</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-slate-800 font-bold text-xs uppercase">Total Amount Due</span>
                <span className="text-xl font-black text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coupon codes trigger */}
            {!appliedCoupon && (
              <form onSubmit={handleApplyCoupon} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Promo Coupon Code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-bold tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-slate-100 hover:bg-slate-200 font-bold text-xs py-2 px-4 rounded-xl transition text-slate-700"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && <p className="text-rose-600 text-xs font-semibold pl-2">{couponError}</p>}

            {/* Merchant Payment Methods Selection */}
            <form onSubmit={handlePlaceOrder} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Select Payment Method</h3>

              <div className="space-y-2.5">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'phonepe' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'phonepe'}
                    onChange={() => setPaymentMethod('phonepe')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <div className="text-left text-xs">
                    <strong className="text-slate-800 block font-bold">PhonePe UPI Gateway</strong>
                    <span className="text-slate-400">Scan and authorize immediately.</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'paytm' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'paytm'}
                    onChange={() => setPaymentMethod('paytm')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  <div className="text-left text-xs">
                    <strong className="text-slate-800 block font-bold">Paytm Business UPI</strong>
                    <span className="text-slate-400">Direct wallet verification.</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Printer className="w-5 h-5 text-slate-500" />
                  <div className="text-left text-xs">
                    <strong className="text-slate-800 block font-bold">Cash at Counter</strong>
                    <span className="text-slate-400">Pay when retrieving your prints.</span>
                  </div>
                </label>
              </div>

              {/* Customer Phone tracking detail */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">Customer Phone Number* (For pickup alert)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              {/* Place Order Execution Button */}
              <button
                type="submit"
                disabled={isPaying || paymentCompleted}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 transition disabled:opacity-55"
              >
                {isPaying ? 'Processing UPI Request...' : paymentCompleted ? 'Payment Confirmed!' : `Authorize Payment (₹${grandTotal})`}
              </button>
            </form>

            <button
              onClick={() => setStep('upload')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 block text-center mt-2 mx-auto"
            >
              ← Back to parameters
            </button>
          </div>
        )}

        {/* Live Order Tracking and Progress Screen */}
        {step === 'tracking' && trackedOrder && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl text-center space-y-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Order Placed Successfully</span>
                <h2 className="text-xl font-black text-slate-900 mt-1">Tracking Code: {trackedOrder.id}</h2>
                <p className="text-xs text-slate-400 mt-1">Please keep this tab open. The status refreshes dynamically.</p>
              </div>

              {/* Visual Multi-step state tracking queue */}
              <div className="relative pt-4 max-w-sm mx-auto">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[80%] h-0.5 bg-slate-100 z-0"></div>
                {/* Simulated dynamic filling */}
                <div
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0 transition-all duration-500"
                  style={{
                    width:
                      trackedOrder.printStatus === 'queued'
                        ? '30%'
                        : trackedOrder.printStatus === 'printing'
                        ? '65%'
                        : trackedOrder.printStatus === 'completed'
                        ? '100%'
                        : '0%',
                  }}
                ></div>

                <div className="flex justify-between items-center relative z-10 text-center">
                  <div className="flex flex-col items-center">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md">
                      1
                    </span>
                    <span className="text-[9px] font-bold text-slate-700 mt-1">Queued</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                      trackedOrder.printStatus === 'printing' || trackedOrder.printStatus === 'completed'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      2
                    </span>
                    <span className="text-[9px] font-bold text-slate-700 mt-1">Printing</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition ${
                      trackedOrder.printStatus === 'completed'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      3
                    </span>
                    <span className="text-[9px] font-bold text-slate-700 mt-1">Ready!</span>
                  </div>
                </div>
              </div>

              {/* Pickup Estimation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div className="text-left border-r border-slate-200 pr-2 space-y-0.5">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Estimated Pickup</span>
                  <strong className="text-slate-800 text-sm font-black flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {trackedOrder.printStatus === 'completed' ? 'Printed!' : trackedOrder.estimatedTime}
                  </strong>
                </div>

                <div className="text-left pl-2 space-y-0.5">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Payment Status</span>
                  <strong className={`text-sm font-black uppercase ${trackedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-500'}`}>
                    {trackedOrder.paymentStatus}
                  </strong>
                </div>
              </div>

              {/* Dynamic instruction string */}
              <div className="text-xs text-slate-500 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-left">
                {trackedOrder.printStatus === 'queued' && (
                  <p>
                    Your print request is currently **queued** at the printer. Payment has been verified. You may head over to the counter.
                  </p>
                )}
                {trackedOrder.printStatus === 'printing' && (
                  <p className="flex items-center gap-2 text-blue-800 font-medium">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    Our printer is actively processing your documents right now! It will be ready in under a minute.
                  </p>
                )}
                {trackedOrder.printStatus === 'completed' && (
                  <p className="text-green-800 font-semibold">
                    🎉 Your document has been successfully printed! Please show order code **{trackedOrder.id}** to collect your print. Thank you!
                  </p>
                )}
                {trackedOrder.printStatus === 'cancelled' && (
                  <p className="text-rose-800 font-semibold">
                    ❌ This order has been cancelled by the shop owner. If payment was made, check with counter for immediate cash/UPI refund.
                  </p>
                )}
              </div>

              {/* Developer sandboxing tip */}
              <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-4 text-xs text-left">
                <span className="font-extrabold uppercase text-[9px] block mb-1">💡 Sandbox Testing Guide:</span>
                Switch to the <strong className="font-bold underline cursor-pointer" onClick={() => onNavigate(`yourdomain.com/shop/${shop.id}`)}>Shop Panel Dashboard</strong> using the controller bar above, click **"Start"** or **"Done"** on this order, and switch back to see this screen update live!
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 rounded-xl transition"
                >
                  Print another document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment simulated loading spinner overlays */}
      {isPaying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center max-w-sm w-full mx-4">
            <div className="relative mb-6">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
              <Smartphone className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">SaaS UPI Integration</span>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">Simulating PhonePe Merchant Checkout</h3>
            <p className="text-xs text-slate-500">Processing direct bank network settlement. Please do not close this window...</p>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-inner mt-6 flex items-center justify-center max-w-[150px] mx-auto">
              <QrCode className="w-28 h-28 text-slate-700" />
            </div>
          </div>
        </div>
      )}

      {paymentCompleted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow border border-emerald-200 mb-6 animate-scale-up">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Instant Settlement</span>
            <h3 className="font-extrabold text-emerald-800 text-base mb-2">UPI Transaction Success!</h3>
            <p className="text-xs text-emerald-600">Merchant settlement successful. Forwarding to print queue...</p>
          </div>
        </div>
      )}
    </div>
  );
}
