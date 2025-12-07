import { dashboardData } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag, Activity } from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
        <Icon size={24} />
      </div>
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem', 
        fontSize: '0.875rem', 
        color: isPositive ? 'var(--success)' : 'var(--danger)',
        background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        padding: '0.25rem 0.5rem',
        borderRadius: '20px'
      }}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </span>
    </div>
    <div>
      <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Store Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, here's what's happening today.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <select className="glass-panel" style={{ padding: '0.5rem 1rem', color: 'white', outline: 'none' }}>
             <option>Today</option>
             <option>This Week</option>
             <option>This Month</option>
           </select>
           <button className="btn-primary">Export Report</button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <MetricCard title="Total Sales" value={dashboardData.metrics[0].value} change={dashboardData.metrics[0].change} isPositive={dashboardData.metrics[0].isPositive} icon={DollarSign} />
        <MetricCard title="Foot Traffic" value={dashboardData.metrics[1].value} change={dashboardData.metrics[1].change} isPositive={dashboardData.metrics[1].isPositive} icon={Users} />
        <MetricCard title="Conversion Rate" value={dashboardData.metrics[2].value} change={dashboardData.metrics[2].change} isPositive={dashboardData.metrics[2].isPositive} icon={Activity} />
        <MetricCard title="Avg. Transaction" value={dashboardData.metrics[3].value} change={dashboardData.metrics[3].change} isPositive={dashboardData.metrics[3].isPositive} icon={ShoppingBag} />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Sales Trend</h3>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px' }}>
           <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Sales by Category</h3>
           <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-card)', border: 'none' }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
