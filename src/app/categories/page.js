"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, X, Edit2, Trash2, Tags, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '@/services/categoryService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [subcategories, setSubcategories] = useState([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      setCategories(res.data || res.categories || res || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setName(category.name || '');
      setImage(category.image || '');
      setSubcategories(category.subcategories || []);
    } else {
      setName('');
      setImage('');
      setSubcategories([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setError('');
  };

  const addSubcategory = () => {
    setSubcategories([...subcategories, { name: '', image: '' }]);
  };

  const updateSubcategory = (index, field, value) => {
    const updated = [...subcategories];
    updated[index][field] = value;
    setSubcategories(updated);
  };

  const removeSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, image, subcategories };
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert('Failed to delete category');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Categories Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-foreground/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-48 text-foreground/50">Loading categories...</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-background/50 border-b border-border text-sm text-foreground/60 uppercase">
                  <th className="p-4 font-semibold">Category Info</th>
                  <th className="p-4 font-semibold">Subcategories</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
                          {cat.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                          ) : null}
                          <Tags className={`text-foreground/30 ${cat.image ? 'hidden' : 'block'}`} size={20} />
                        </div>
                        <p className="font-semibold text-foreground">{cat.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories && cat.subcategories.length > 0 ? cat.subcategories.map((sub, i) => (
                          <span key={i} className="px-2.5 py-1 bg-background border border-border rounded-md text-xs font-medium text-foreground/80">
                            {sub.name}
                          </span>
                        )) : <span className="text-sm text-foreground/50 italic">None</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handleOpenModal(cat)} className="text-blue-500 hover:text-blue-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center p-8 text-foreground/50">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={handleCloseModal} className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="e.g. Electronics" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category Image URL</label>
                  <input type="text" value={image} onChange={e => setImage(e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground" placeholder="https://..." />
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-foreground">Subcategories</label>
                    <button type="button" onClick={addSubcategory} className="text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <Plus size={14} /> Add Subcategory
                    </button>
                  </div>
                  
                  {subcategories.length === 0 ? (
                    <p className="text-sm text-foreground/50 italic text-center py-4 bg-background rounded-lg border border-dashed border-border">No subcategories added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {subcategories.map((sub, index) => (
                        <div key={index} className="flex gap-3 items-start bg-background p-3 rounded-lg border border-border">
                          <div className="flex-1 space-y-3">
                            <input 
                              required
                              type="text" 
                              value={sub.name}
                              onChange={(e) => updateSubcategory(index, 'name', e.target.value)}
                              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" 
                              placeholder="Subcategory Name *" 
                            />
                            <input 
                              type="text" 
                              value={sub.image || ''}
                              onChange={(e) => updateSubcategory(index, 'image', e.target.value)}
                              className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground" 
                              placeholder="Subcategory Image URL (optional)" 
                            />
                          </div>
                          <button type="button" onClick={() => removeSubcategory(index)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors mt-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-background/50">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-border/50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="categoryForm" className="px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm">
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
