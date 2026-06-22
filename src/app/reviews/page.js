"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, X, Edit2, Trash2, Star, MessageSquare } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { productService } from '@/services/productService'; // to fetch products for the dropdown

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]); // for the dropdown
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    name: '',
    rating: 5,
    comment: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewRes, productRes] = await Promise.all([
        reviewService.getAllReviews(),
        productService.getAllProducts()
      ]);
      setReviews(reviewRes.data || reviewRes.reviews || reviewRes || []);

      // Extract products cleanly (handling the wrapped products case if needed)
      let prodList = productRes.data || productRes.products || productRes || [];
      if (prodList.length === 1 && prodList[0].products && Array.isArray(prodList[0].products)) {
        prodList = prodList[0].products;
      }
      setProducts(prodList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (review = null) => {
    setEditingReview(review);
    if (review) {
      setFormData({
        productId: review.productId || '',
        productName: review.productName || '',
        name: review.name || review.userName || '',
        rating: review.rating || 5,
        comment: review.comment || ''
      });
    } else {
      setFormData({ productId: '', productName: '', name: '', rating: 5, comment: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If a productId is selected, auto-fill the productName from the products list
      let finalData = { ...formData, rating: Number(formData.rating) };
      if (finalData.productId) {
        const selectedProduct = products.find(p => p._id === finalData.productId || p.id === finalData.productId);
        if (selectedProduct) {
          finalData.productName = selectedProduct.name;
        }
      }

      if (editingReview) {
        await reviewService.updateReview(editingReview._id, finalData);
      } else {
        await reviewService.createReview(finalData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save review');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewService.deleteReview(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Reviews Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Review
        </button>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-foreground/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-48 text-foreground/50">Loading reviews...</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-background/50 border-b border-border text-sm text-foreground/60 uppercase">
                  <th className="p-4 font-semibold">Reviewer</th>
                  <th className="p-4 font-semibold">Rating</th>
                  <th className="p-4 font-semibold">Comment</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((review) => (
                  <tr key={review._id} className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors">
                    <td className="p-4 text-foreground font-medium">{review.name || review.userName || 'Anonymous'}</td>
                    <td className="p-4 text-primary font-medium flex items-center gap-1 mt-2.5">
                      {review.rating} <Star size={14} className="fill-current" />
                    </td>
                    <td className="p-4 text-foreground/70 max-w-[250px] truncate" title={review.comment}>
                      {review.comment || <span className="italic text-foreground/40">No comment</span>}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handleOpenModal(review)} className="text-blue-500 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(review._id)} className="text-red-500 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-foreground/50">No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && reviews.length > itemsPerPage && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-foreground/60">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, reviews.length)} of {reviews.length} reviews
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
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(reviews.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(reviews.length / itemsPerPage)}
                className="px-3 py-1.5 border border-border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-background transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{editingReview ? 'Edit Review' : 'Add New Review'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="reviewForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Reviewer Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="John Doe" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Rating (1-5) *</label>
                    <input required type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Link to Product (Optional)</label>
                    <select value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
                      <option value="">-- Select a product --</option>
                      {products.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-foreground/50 mt-1">If not selected, you can type a manual product name below.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Product Name (Override)</label>
                    <input type="text" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="Leave blank to use selected product name" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Comment</label>
                    <textarea value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} rows="4" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" placeholder="User review goes here..."></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-background/50">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-border/50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="reviewForm" className="px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
