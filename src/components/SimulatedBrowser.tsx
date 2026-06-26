import React, { useState } from 'react';
import { Shield, Store, User, Globe, ArrowLeft, ArrowRight, RotateCw, Copy, Check, Cloud, Database } from 'lucide-react';
import { Shop } from '../types';
import { isConfigured } from '../firebase';

interface SimulatedBrowserProps {
  currentUrl: string;
  onChangeUrl: (url: string) => void;
  children: React.ReactNode;
  shops: Shop[];
}

export default function SimulatedBrowser({ currentUrl, onChangeUrl, children, shops }: SimulatedBrowserProps) {
  const [copied, setCopied] = useState(false);
  const activeShops = shops.filter(s => s.status === 'active');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="simulated-browser-container" className="flex flex-col min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      {/* Super Admin Control Bar (The Role Switcher Toolbar) */}
      <div id="role-switcher-toolbar" className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-medium border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-semibold text-slate-300">SaaS Sandbox Controller:</span>
          <span className="text-slate-400">Interact with the tabs or simulated URLs below to switch roles</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Landing Page */}
          <button
            id="switch-landing"
            onClick={() => onChangeUrl('yourdomain.com')}
            className={`px-2.5 py-1 rounded transition-all duration-150 flex items-center gap-1.5 ${
              currentUrl === 'yourdomain.com'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            SaaS Landing
          </button>

          {/* Super Admin */}
          <button
            id="switch-admin"
            onClick={() => onChangeUrl('admin.yourdomain.com')}
            className={`px-2.5 py-1 rounded transition-all duration-150 flex items-center gap-1.5 ${
              currentUrl === 'admin.yourdomain.com'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Super Admin
          </button>

          {/* Shop Dashboard dropdown */}
          <div className="relative group">
            <button
              id="switch-shop-trigger"
              className={`px-2.5 py-1 rounded transition-all duration-150 flex items-center gap-1.5 ${
                currentUrl.includes('/shop/')
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Shop Dashboard ▾
            </button>
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-48 hidden group-hover:block z-50">
              {shops.map((shop) => (
                <button
                  key={`switch-shop-dash-${shop.id}`}
                  onClick={() => onChangeUrl(`yourdomain.com/shop/${shop.id}`)}
                  className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{shop.name}</span>
                  {shop.status === 'blocked' && (
                    <span className="text-[9px] bg-red-950 text-red-400 px-1 py-0.5 rounded">Blocked</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Upload Portal dropdown */}
          <div className="relative group">
            <button
              id="switch-customer-trigger"
              className={`px-2.5 py-1 rounded transition-all duration-150 flex items-center gap-1.5 ${
                (!currentUrl.includes('/shop/') && currentUrl !== 'yourdomain.com' && currentUrl !== 'admin.yourdomain.com')
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer Portal ▾
            </button>
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-48 hidden group-hover:block z-50">
              {activeShops.map((shop) => (
                <button
                  key={`switch-customer-portal-${shop.id}`}
                  onClick={() => onChangeUrl(`yourdomain.com/${shop.id}`)}
                  className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <span className="truncate">{shop.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Browser Frame */}
      <div id="browser-window" className="flex flex-col flex-1 bg-white border border-slate-200 shadow-lg overflow-hidden">
        {/* Browser Address Bar Area */}
        <div id="browser-address-bar-area" className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-4 select-none">
          {/* Window Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => onChangeUrl('yourdomain.com')}
              className="p-1 hover:bg-slate-200 hover:text-slate-600 rounded transition"
              title="Go Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1 text-slate-300 cursor-not-allowed">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-slate-200 hover:text-slate-600 rounded transition">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Address Input */}
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-600 shadow-inner max-w-2xl mx-auto gap-2">
            <span className="text-slate-400 text-xs">https://</span>
            <span className="font-medium text-slate-800 select-all truncate">{currentUrl}</span>
            <button
              onClick={copyToClipboard}
              className="ml-auto text-slate-400 hover:text-slate-600 p-0.5 rounded"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Cloud className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                <span>Firebase Cloud</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200" title="Firebase variables not set, falling back to fully functional Local Storage.">
                <Database className="w-3.5 h-3.5 text-amber-500" />
                <span>Local Storage Mode</span>
              </span>
            )}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>SSL Secure</span>
            </div>
          </div>
        </div>

        {/* Browser Screen Content */}
        <div id="browser-viewport" className="flex-1 overflow-y-auto bg-white flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
