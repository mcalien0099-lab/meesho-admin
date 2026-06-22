"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, X, Edit2, Trash2, Image as ImageIcon, Upload, Pin } from 'lucide-react';
import { productService } from '@/services/productService';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
  
  // Form States
  const [formData, setFormData] = useState({
    name: '', category: 'General', price: '', originalPrice: '', image: '', description: '', sizes: '', gender: '', isPinned: false
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      let list = res.data || res.products || res || [];
      
      // Handle case where products were accidentally imported as a single document with a nested 'products' array
      if (list.length === 1 && list[0].products && Array.isArray(list[0].products)) {
        list = list[0].products;
      }
      
      setProducts(list);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError('');
      const res = await productService.importProducts(file);
      alert(res.message || 'Products imported successfully');
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to import products');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || 'General',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        image: product.image || '',
        description: product.description || '',
        sizes: product.sizes ? product.sizes.join(', ') : '',
        gender: product.gender || '',
        isPinned: !!product.isPinned
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'General', price: '', originalPrice: '', image: '', description: '', sizes: '', gender: '', isPinned: false });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
      } else {
        await productService.createProduct(payload);
      }
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handlePinToggle = async (product) => {
    try {
      await productService.updateProduct(product._id || product.id, { isPinned: !product.isPinned });
      fetchProducts();
    } catch (err) {
      alert('Failed to update pin status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Products Management</h1>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .sql"
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm disabled:opacity-50"
          >
            <Upload size={20} />
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-foreground/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-foreground/50">Loading products...</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-background/50 border-b border-border text-sm text-foreground/60 uppercase">
                  <th className="p-4 font-semibold">Product Info</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((product) => (
                  <tr key={product._id} className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                          ) : null}
                          <ImageIcon className={`text-foreground/30 ${product.image ? 'hidden' : 'block'}`} size={20} />
                        </div>
                        <div className="min-w-0 flex-1 max-w-[200px] sm:max-w-[300px]">
                          <p className="font-medium text-foreground truncate" title={product.name}>{product.name || 'Unnamed Product'}</p>
                          <p className="text-xs text-foreground/60">{product.gender} {product.isPinned && "• Pinned"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-foreground/70">{product.category || 'General'}</td>
                    <td className="p-4 text-foreground font-medium">
                      ₹{product.price || 0}
                      {product.originalPrice && <span className="ml-2 text-xs line-through text-foreground/50">₹{product.originalPrice}</span>}
                    </td>
                    <td className="p-4 text-foreground/70">⭐ {product.rating || 0}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handlePinToggle(product)} className={`${product.isPinned ? 'text-green-500 hover:text-green-600' : 'text-foreground/40 hover:text-foreground/70'} transition-colors`} title={product.isPinned ? "Unpin product" : "Pin product"}>
                        <Pin size={18} fill={product.isPinned ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => handleOpenModal(product)} className="text-blue-500 hover:text-blue-600 transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="text-red-500 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-foreground/50">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Controls */}
        {!loading && products.length > itemsPerPage && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-foreground/60">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)} of {products.length} products
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-background transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(products.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-background transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Product Name *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="Enter product name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category *</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                      <option value="General">General</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price (₹) *</label>
                    <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Original Price (₹)</label>
                    <input value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} type="number" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="0.00" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Image URL</label>
                    <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="https://example.com/image.jpg" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="Product description..."></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sizes (comma separated)</label>
                    <input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} type="text" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="S, M, L, XL" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                      <option value="">Select Gender</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2" />
                    <label htmlFor="isPinned" className="text-sm font-medium text-foreground">Pin to top of lists</label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-background/50">
              <button onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-border/50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="productForm" className="px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
