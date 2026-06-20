"use client";

import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

export default function Dashboard() {
  const statCards = [
    { title: 'Total Revenue', value: '$45,231.89', icon: DollarSign, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Total Orders', value: '1,234', icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Total Users', value: '4,567', icon: Users, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { title: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-foreground/60 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-6">Revenue Over Time</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--foreground)" opacity={0.5} />
              <YAxis stroke="var(--foreground)" opacity={0.5} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Orders Placeholder */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-foreground/60 uppercase">
                <th className="pb-3 font-semibold">Order ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: '#ORD-001', customer: 'Alice Smith', date: '2026-06-19', amount: '$120.00', status: 'Completed' },
                { id: '#ORD-002', customer: 'Bob Johnson', date: '2026-06-18', amount: '$45.50', status: 'Processing' },
                { id: '#ORD-003', customer: 'Charlie Brown', date: '2026-06-17', amount: '$89.99', status: 'Pending' },
              ].map((order, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-background/50 transition-colors">
                  <td className="py-4 font-medium text-primary">{order.id}</td>
                  <td className="py-4 text-foreground">{order.customer}</td>
                  <td className="py-4 text-foreground/70">{order.date}</td>
                  <td className="py-4 font-medium text-foreground">{order.amount}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
