"use client";

import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, CreditCard, Smartphone, LayoutTemplate } from 'lucide-react';
import { settingService } from '@/services/settingService';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    logoName: 'meesho', logoUrl: '', primaryColor: '#9f2089', accentColor: '#f43397',
    cartBannerUrl: '', cartBannerLink: '',
    upiGateway: 'paytm', upiId: '', razorpayUpiId: '', razorpayTr: '',
    showPhonePe: true, showGPay: true, showPaytm: true, showAmazonPay: true, showBHIM: true,
    phonepeOfferText: '', phonepeDiscountAmount: 0,
    gpayOfferText: '', gpayDiscountAmount: 0,
    paytmOfferText: '', paytmDiscountAmount: 0,
    amazonpayOfferText: '', amazonpayDiscountAmount: 0,
    bhimOfferText: '', bhimDiscountAmount: 0,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingService.getSettings();
      if (res.data || res.settings) {
        setSettings({ ...settings, ...(res.data || res.settings) });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await settingService.updateSettings(settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-foreground/50">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Settings</h1>
          <p className="text-sm text-foreground/60 mt-1">Configure your app branding, UPI settings, and gateway integrations.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}
      {success && <div className="text-green-500 text-sm bg-green-500/10 p-3 rounded-lg">{success}</div>}

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex flex-col gap-1 bg-card border border-border p-2 rounded-xl shadow-sm shrink-0">
          {[
            { id: 'branding', label: 'Branding & UI', icon: LayoutTemplate },
            { id: 'gateway', label: 'Payment Gateways', icon: CreditCard },
            { id: 'upi_visibility', label: 'UPI Visibility', icon: Smartphone },
            { id: 'upi_offers', label: 'UPI Offers', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground/70 hover:bg-background hover:text-foreground'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-foreground/50'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Forms */}
        <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden w-full">
          
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-foreground mb-4">Branding & App UI</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Logo Name</label>
                  <input type="text" value={settings.logoName} onChange={e => handleChange('logoName', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Logo URL</label>
                  <input type="text" value={settings.logoUrl} onChange={e => handleChange('logoUrl', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Primary Color</label>
                  <div className="flex gap-3">
                    <input type="color" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="w-10 h-10 rounded border border-border bg-background cursor-pointer" />
                    <input type="text" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground uppercase" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Accent Color</label>
                  <div className="flex gap-3">
                    <input type="color" value={settings.accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="w-10 h-10 rounded border border-border bg-background cursor-pointer" />
                    <input type="text" value={settings.accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground uppercase" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Cart Banner URL</label>
                  <input type="text" value={settings.cartBannerUrl} onChange={e => handleChange('cartBannerUrl', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="Image URL for cart banner..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Cart Banner Link</label>
                  <input type="text" value={settings.cartBannerLink} onChange={e => handleChange('cartBannerLink', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="/redirect-link" />
                </div>
              </div>
            </div>
          )}

          {/* Gateways Tab */}
          {activeTab === 'gateway' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-foreground mb-4">Payment & UPI Gateway</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Active UPI Gateway</label>
                  <select value={settings.upiGateway} onChange={e => handleChange('upiGateway', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                    <option value="paytm">Paytm</option>
                    <option value="razorpay">Razorpay</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Standard UPI ID</label>
                  <input type="text" value={settings.upiId} onChange={e => handleChange('upiId', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="merchant@upi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Razorpay UPI ID</label>
                  <input type="text" value={settings.razorpayUpiId} onChange={e => handleChange('razorpayUpiId', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="razorpay@upi" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Razorpay TR (Transaction Reference)</label>
                  <input type="text" value={settings.razorpayTr} onChange={e => handleChange('razorpayTr', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="TR..." />
                </div>
              </div>
            </div>
          )}

          {/* UPI Visibility Tab */}
          {activeTab === 'upi_visibility' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-foreground mb-4">UPI Apps Visibility</h2>
              <p className="text-sm text-foreground/60 mb-6">Toggle which UPI payment apps are visible to the user at checkout.</p>
              
              <div className="space-y-4 max-w-md">
                {[
                  { id: 'showPhonePe', label: 'PhonePe' },
                  { id: 'showGPay', label: 'Google Pay (GPay)' },
                  { id: 'showPaytm', label: 'Paytm' },
                  { id: 'showAmazonPay', label: 'Amazon Pay' },
                  { id: 'showBHIM', label: 'BHIM UPI' }
                ].map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                    <span className="text-sm font-medium text-foreground">{app.label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings[app.id]} onChange={e => handleChange(app.id, e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPI Offers Tab */}
          {activeTab === 'upi_offers' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-foreground mb-4">UPI App Offers & Discounts</h2>
              <p className="text-sm text-foreground/60 mb-6">Configure custom offer text and discount amounts for specific payment methods.</p>
              
              <div className="space-y-6">
                {[
                  { id: 'phonepe', label: 'PhonePe' },
                  { id: 'gpay', label: 'Google Pay' },
                  { id: 'paytm', label: 'Paytm' },
                  { id: 'amazonpay', label: 'Amazon Pay' },
                  { id: 'bhim', label: 'BHIM UPI' },
                ].map((app) => (
                  <div key={app.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-background border border-border rounded-xl">
                    <h3 className="md:col-span-2 text-sm font-bold text-foreground">{app.label} Settings</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground/70">Offer Text</label>
                      <input type="text" value={settings[`${app.id}OfferText`]} onChange={e => handleChange(`${app.id}OfferText`, e.target.value)} className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder={`e.g. Flat ₹50 off on ${app.label}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground/70">Discount Amount (₹)</label>
                      <input type="number" value={settings[`${app.id}DiscountAmount`]} onChange={e => handleChange(`${app.id}DiscountAmount`, Number(e.target.value))} className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
