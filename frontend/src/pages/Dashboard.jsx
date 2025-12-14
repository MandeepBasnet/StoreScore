
import { dashboardData } from '../data/mockData'; // Ensure this exists or mock locally if needed
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Trophy, TrendingUp, Users, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KPIChart = () => {
  // Mock KPI History Data
  const data = [
    { day: 'Mon', score: 28.5, target: 28.0 },
    { day: 'Tue', score: 29.0, target: 28.0 },
    { day: 'Wed', score: 27.5, target: 28.0 },
    { day: 'Thu', score: 28.2, target: 28.0 },
    { day: 'Fri', score: 29.5, target: 28.0 },
    { day: 'Sat', score: 30.0, target: 28.0 },
    { day: 'Sun', score: 29.2, target: 28.0 },
  ];

  return (
    <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
          <YAxis domain={[20, 35]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--text-main)' }}
          />
          <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Daily Score" />
          {/* Visual line for Target could be added as ReferenceLine if imported, or just implied */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const ActionCard = ({ title, icon: Icon, color, path, nav }) => (
  <div 
    onClick={() => nav(path)}
    className="glass-panel"
    style={{ 
      padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
      justifyContent: 'space-between', height: '160px', transition: 'transform 0.2s',
      borderLeft: `4px solid ${color}`
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}20`, color: color }}>
        <Icon size={24} />
      </div>
      <ArrowRight size={20} color="var(--text-muted)" />
    </div>
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Access {title}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Store Performance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your daily success and streaks.</p>
      </div>

      {/* Hero Section: Achievements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Streak Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'linear-gradient(135deg, rgba(0, 86, 179, 0.1), rgba(255, 199, 44, 0.1))' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255, 199, 44, 0.4)'
          }}>
            <Trophy size={48} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Current Streak</h3>
            <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, margin: '0.5rem 0', color: 'var(--text-main)' }}>5 <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Days</span></div>
            <p style={{ color: 'var(--text-muted)' }}>Keep it up! You're crushing it.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
             <TrendingUp size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
             <div style={{ fontSize: '2rem', fontWeight: 700 }}>28.5</div>
             <p style={{ color: 'var(--text-muted)' }}>Avg Score</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
             <Calendar size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
             <div style={{ fontSize: '2rem', fontWeight: 700 }}>12</div>
             <p style={{ color: 'var(--text-muted)' }}>Days Met</p>
          </div>
        </div>

      </div>

      {/* KPI Trend Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>KPI Performance Trend</h3>
          <select style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '4px' }}>
            <option>Last 7 Days</option>
            <option>This Month</option>
          </select>
        </div>
        <KPIChart />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <ActionCard title="Daily Entry" icon={Target} color="#3b82f6" path="/kpi" nav={navigate} />
          <ActionCard title="Set Targets" icon={TrendingUp} color="#10b981" path="/set-targets" nav={navigate} />
          <ActionCard title="Add Manager" icon={Users} color="#8b5cf6" path="/add-manager" nav={navigate} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
