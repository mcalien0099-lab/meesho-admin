"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, X, ChevronDown, Check, Package, MapPin, Phone, User } from 'lucide-react';
import { orderService } from '@/services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders();
      setOrders(res.data || res.orders || res || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.status || 'Address Saved');
  };

  const handleCloseDetails = () => setSelectedOrder(null);

  const handleUpdateStatus = async () => {
    try {
      await orderService.updateOrderStatus(selectedOrder._id, statusUpdate);
      handleCloseDetails();
      fetchOrders(); // Refresh table
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Orders Management</h1>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">{error}</div>}

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-foreground placeholder:text-foreground/40"
            />
          </div>
          <div className="flex gap-3">
            <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground">
              <option value="">All Statuses</option>
              <option value="Address Saved">Address Saved</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-background/80 transition-colors text-foreground/80">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-48 text-foreground/50">Loading orders...</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-background/50 border-b border-border text-sm text-foreground/60 uppercase">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors">
                    <td className="p-4 font-medium text-primary">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-foreground">{order.name}</p>
                        <p className="text-xs text-foreground/60">{order.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-foreground">₹{order.amount ? order.amount.toFixed(2) : '0.00'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-orange-500/10 text-orange-500'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenDetails(order)} className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors flex items-center justify-end gap-1 w-full">
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-foreground/50">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border bg-background/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">Order Details</h2>
                <p className="text-sm text-foreground/60 mt-1">{selectedOrder._id} • {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={handleCloseDetails} className="p-2 text-foreground/60 hover:text-foreground hover:bg-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-background border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                    <User size={18} className="text-primary" /> Customer Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Name</span>
                      <span className="font-medium text-foreground">{selectedOrder.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Phone</span>
                      <span className="font-medium text-foreground">{selectedOrder.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-background border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                    <MapPin size={18} className="text-primary" /> Shipping Address
                  </h3>
                  <div className="text-sm text-foreground/80 leading-relaxed">
                    <p>{selectedOrder.streetAddress}</p>
                    <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Package size={18} className="text-primary" /> Order Items
                </h3>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-background/50 border-b border-border text-foreground/60">
                      <tr>
                        <th className="p-3 font-medium">Product</th>
                        <th className="p-3 font-medium text-center">Quantity</th>
                        <th className="p-3 font-medium text-right">Price</th>
                        <th className="p-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {selectedOrder.items && selectedOrder.items.map((item, i) => (
                        <tr key={i} className="hover:bg-background/30 transition-colors">
                          <td className="p-3 font-medium text-foreground">{item.productName}</td>
                          <td className="p-3 text-center text-foreground/80">{item.quantity}</td>
                          <td className="p-3 text-right text-foreground/80">₹{item.price ? item.price.toFixed(2) : '0.00'}</td>
                          <td className="p-3 text-right font-medium text-foreground">₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-background/30 border-t border-border">
                      <tr>
                        <td colSpan="3" className="p-4 text-right font-bold text-foreground">Total Amount:</td>
                        <td className="p-4 text-right font-bold text-primary text-lg">₹{selectedOrder.amount ? selectedOrder.amount.toFixed(2) : '0.00'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-background border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Update Status</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium">
                    <option value="Address Saved">Address Saved</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={handleUpdateStatus} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <Check size={16} /> Update Status
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
