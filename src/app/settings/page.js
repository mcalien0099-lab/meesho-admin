"use client";

import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, CreditCard, Smartphone, LayoutTemplate, Tag, Plus, Trash2 } from 'lucide-react';
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
    showPhonePe: true, showGPay: true, showPaytm: true, showAmazonPay: true, showBHIM: true, showWhatsApp: true, showCOD: true,
    phonepeOfferText: '', phonepeDiscountAmount: 0,
    gpayOfferText: '', gpayDiscountAmount: 0,
    paytmOfferText: '', paytmDiscountAmount: 0,
    amazonpayOfferText: '', amazonpayDiscountAmount: 0,
    bhimOfferText: '', bhimDiscountAmount: 0,
    offers: [],
    codAdvanceAmount: 0,
    metaPixelIds: [],
    googleAnalyticsIds: [],
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingService.getSettings();
      if (res.data || res.settings) {
        const fetchedData = res.data || res.settings;
        
          // Handle legacy COD_ADVANCE in offers if present, but also prefer the direct field if it exists
        let codAdvanceAmount = fetchedData.codAdvanceAmount || 0;
        let metaPixelIds = [];
        let googleAnalyticsIds = [];
        
        if (fetchedData.offers && Array.isArray(fetchedData.offers)) {
          const advanceOffer = fetchedData.offers.find(o => o && o.startsWith && o.startsWith('COD_ADVANCE:'));
          if (advanceOffer && codAdvanceAmount === 0) {
            codAdvanceAmount = Number(advanceOffer.split(':')[1]) || 0;
          }
          
          metaPixelIds = fetchedData.offers.filter(o => o && o.startsWith && o.startsWith('PIXEL_META:')).map(o => o.split(':')[1]);
          googleAnalyticsIds = fetchedData.offers.filter(o => o && o.startsWith && o.startsWith('PIXEL_GA:')).map(o => o.split(':')[1]);
          
          // Remove the legacy string from offers so it doesn't show up in the UI
          fetchedData.offers = fetchedData.offers.filter(o => !(o && o.startsWith && (o.startsWith('COD_ADVANCE:') || o.startsWith('PIXEL_'))));
        }
        
        setSettings({ ...settings, ...fetchedData, codAdvanceAmount, metaPixelIds, googleAnalyticsIds });
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
      
      const dataToSave = { ...settings };
      // Make sure we strip any legacy COD_ADVANCE or PIXEL from offers before saving
      dataToSave.offers = [...(dataToSave.offers || []).filter(o => o && !(o.startsWith('COD_ADVANCE:') || o.startsWith('PIXEL_')))];
      
      if (dataToSave.codAdvanceAmount > 0) {
        dataToSave.offers.push(`COD_ADVANCE:${dataToSave.codAdvanceAmount}`);
      }
      if (dataToSave.metaPixelIds && dataToSave.metaPixelIds.length > 0) {
        dataToSave.metaPixelIds.forEach(id => {
          if (id && id.trim()) dataToSave.offers.push(`PIXEL_META:${id.trim()}`);
        });
      }
      if (dataToSave.googleAnalyticsIds && dataToSave.googleAnalyticsIds.length > 0) {
        dataToSave.googleAnalyticsIds.forEach(id => {
          if (id && id.trim()) dataToSave.offers.push(`PIXEL_GA:${id.trim()}`);
        });
      }
      
      // Remove local fields from the payload so backend doesn't reject it
      delete dataToSave.codAdvanceAmount;
      delete dataToSave.metaPixelIds;
      delete dataToSave.googleAnalyticsIds;
      delete dataToSave.metaPixelId; // cleanup legacy
      delete dataToSave.googleAnalyticsId;
      
      await settingService.updateSettings(dataToSave);
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
            { id: 'offers', label: 'Global Offers', icon: Tag },
            { id: 'tracking', label: 'Tracking Pixels', icon: Smartphone }, // We reuse an icon
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
                  { id: 'showBHIM', label: 'BHIM UPI' },
                  { id: 'showWhatsApp', label: 'WhatsApp Pay' },
                  { id: 'showCOD', label: 'Cash on Delivery (COD)' }
                ].map((app) => (
                  <div key={app.id} className="flex flex-col gap-2 p-4 bg-background border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{app.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings[app.id]} onChange={e => handleChange(app.id, e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    {app.id === 'showCOD' && settings.showCOD && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <label className="text-xs font-medium text-foreground/70 block mb-1">COD Advance Amount (₹)</label>
                        <input 
                          type="number" 
                          value={settings.codAdvanceAmount || ''} 
                          onChange={e => handleChange('codAdvanceAmount', Number(e.target.value))} 
                          className="w-full bg-card border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" 
                          placeholder="Amount to collect online (e.g. 100)" 
                        />
                      </div>
                    )}
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

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-foreground mb-4">Global Offers</h2>
              <p className="text-sm text-foreground/60 mb-6">Add special offers like b1g1, b2g1, etc. that will be displayed across the app.</p>
              
              <div className="space-y-4 max-w-md">
                {(settings.offers || []).map((offer, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={offer} 
                      onChange={(e) => {
                        const newOffers = [...(settings.offers || [])];
                        newOffers[index] = e.target.value;
                        handleChange('offers', newOffers);
                      }} 
                      className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" 
                      placeholder="e.g. b1g1" 
                    />
                    <button 
                      onClick={() => {
                        const newOffers = (settings.offers || []).filter((_, i) => i !== index);
                        handleChange('offers', newOffers);
                      }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove Offer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    handleChange('offers', [...(settings.offers || []), '']);
                  }}
                  className="flex items-center gap-2 text-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <Plus size={18} />
                  Add Offer
                </button>
              </div>
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="p-6 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-foreground mb-4">Tracking Pixels</h2>
              <p className="text-sm text-foreground/60 mb-6">Add your tracking pixel IDs here. We will automatically inject the pixel code into your website.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Meta Pixels */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground">Meta Pixel IDs (Facebook)</label>
                    <button 
                      onClick={() => handleChange('metaPixelIds', [...(settings.metaPixelIds || []), ''])}
                      className="flex items-center gap-1 text-primary hover:bg-primary/10 px-2 py-1 rounded-md font-medium transition-colors text-xs"
                    >
                      <Plus size={14} /> Add Pixel
                    </button>
                  </div>
                  
                  {!(settings.metaPixelIds?.length > 0) && (
                    <p className="text-xs text-foreground/50">No Meta Pixels added yet.</p>
                  )}
                  
                  {(settings.metaPixelIds || []).map((pixel, index) => (
                    <div key={`meta-${index}`} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <input 
                          type="text" 
                          value={pixel} 
                          onChange={(e) => {
                            const newPixels = [...(settings.metaPixelIds || [])];
                            newPixels[index] = e.target.value;
                            handleChange('metaPixelIds', newPixels);
                          }} 
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" 
                          placeholder="e.g. 123456789012345" 
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newPixels = (settings.metaPixelIds || []).filter((_, i) => i !== index);
                          handleChange('metaPixelIds', newPixels);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-0.5"
                        title="Remove Pixel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <p className="text-[11px] text-foreground/50">Only enter the numeric ID, not the whole script.</p>
                </div>
                
                {/* Google Analytics / Pixels */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground">Google Analytics / Pixel IDs</label>
                    <button 
                      onClick={() => handleChange('googleAnalyticsIds', [...(settings.googleAnalyticsIds || []), ''])}
                      className="flex items-center gap-1 text-primary hover:bg-primary/10 px-2 py-1 rounded-md font-medium transition-colors text-xs"
                    >
                      <Plus size={14} /> Add Pixel
                    </button>
                  </div>
                  
                  {!(settings.googleAnalyticsIds?.length > 0) && (
                    <p className="text-xs text-foreground/50">No Google Pixels added yet.</p>
                  )}
                  
                  {(settings.googleAnalyticsIds || []).map((pixel, index) => (
                    <div key={`ga-${index}`} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <input 
                          type="text" 
                          value={pixel} 
                          onChange={(e) => {
                            const newPixels = [...(settings.googleAnalyticsIds || [])];
                            newPixels[index] = e.target.value;
                            handleChange('googleAnalyticsIds', newPixels);
                          }} 
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" 
                          placeholder="e.g. G-XXXXXXXXXX or AW-XXXXXXXX" 
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newPixels = (settings.googleAnalyticsIds || []).filter((_, i) => i !== index);
                          handleChange('googleAnalyticsIds', newPixels);
                        }}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-0.5"
                        title="Remove Pixel"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
