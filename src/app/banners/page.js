"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { bannerService } from '@/services/bannerService';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    image: '', title: '', subtitle: '', buttonText: '', link: '', order: 0
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getAllBanners();
      setBanners(res.data || res.banners || res || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) {
      setFormData({
        image: banner.image || '',
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        buttonText: banner.buttonText || '',
        link: banner.link || '',
        order: banner.order || 0
      });
    } else {
      setFormData({ image: '', title: '', subtitle: '', buttonText: '', link: '', order: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner._id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      handleCloseModal();
      fetchBanners();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannerService.deleteBanner(id);
        fetchBanners();
      } catch (err) {
        alert('Failed to delete banner');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Banners Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-foreground/50">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-foreground/50">No banners found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group">
              <div className="h-48 bg-background relative flex items-center justify-center border-b border-border">
                {banner.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null}
                <div className={`absolute inset-0 items-center justify-center ${banner.image ? 'hidden' : 'flex'}`}>
                  <ImageIcon className="text-foreground/20" size={48} />
                </div>
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded shadow-sm border border-border">
                  Order: {banner.order}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-foreground mb-1 truncate">{banner.title || 'Untitled Banner'}</h3>
                <p className="text-sm text-foreground/70 mb-4 line-clamp-2 flex-1">{banner.subtitle || 'No subtitle provided.'}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-full truncate max-w-[150px]">
                    {banner.buttonText || 'No Button'}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(banner)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="bannerForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Banner Image URL *</label>
                  <input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="https://example.com/banner.jpg" />
                  <p className="text-xs text-foreground/50 mt-1">Image is required for banners.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="Summer Sale" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Subtitle</label>
                    <input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="Up to 50% off" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Button Text</label>
                    <input value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="Shop Now" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Button Link</label>
                    <input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="/category/sale" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Display Order</label>
                    <input value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" />
                    <p className="text-xs text-foreground/50 mt-1">Lower numbers appear first.</p>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-background/50">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-border/50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="bannerForm" className="px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
