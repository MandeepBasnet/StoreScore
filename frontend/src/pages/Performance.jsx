import { performanceData } from '../data/mockData';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';

const Performance = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Team Performance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time employee metrics and leaderboards.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {/* Top Performer Highlight */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(180deg, rgba(255,215,0,0.1), rgba(30,41,59,0.7))', border: '1px solid rgba(255,215,0,0.3)' }}>
           <div style={{ padding: '1rem', background: 'rgba(255,215,0,0.2)', borderRadius: '50%', marginBottom: '1rem', color: '#fbbf24' }}>
             <Trophy size={32} />
           </div>
           <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Sarah Johnson</h2>
           <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Top Sales Lead</p>
           <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>$15,400</div>
           <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Sales this Month</p>
        </div>

        {/* Stats Summary */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '2rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--primary)' }}>98%</div>
             <p style={{ color: 'var(--text-muted)' }}>Team Target Met</p>
           </div>
           <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }}></div>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent)' }}>363</div>
             <p style={{ color: 'var(--text-muted)' }}>Total Transactions</p>
           </div>
           <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }}></div>
           <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--success)' }}>4.7</div>
             <p style={{ color: 'var(--text-muted)' }}>Avg Customer Rating</p>
           </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--primary)" />
          Employee Leaderboard
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem', paddingLeft: '2rem', color: 'var(--text-muted)' }}>Rank</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Employee</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Transactions</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Rating</th>
              <th style={{ padding: '1rem', paddingRight: '2rem', textAlign: 'right', color: 'var(--text-muted)' }}>Sales Volume</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((employee, index) => (
              <tr key={employee.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', paddingLeft: '2rem' }}>
                   <span style={{ 
                     display: 'inline-flex', 
                     width: '24px', 
                     height: '24px', 
                     alignItems: 'center', 
                     justifyContent: 'center', 
                     background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.1)', 
                     borderRadius: '50%',
                     color: index < 3 ? 'black' : 'white',
                     fontWeight: 700,
                     fontSize: '0.75rem'
                   }}>
                     {index + 1}
                   </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {employee.name.charAt(0)}
                  </div>
                  {employee.name}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{employee.role}</td>
                <td style={{ padding: '1rem' }}>{employee.transactions}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                    <Star size={14} fill="#fbbf24" />
                    {employee.rating}
                  </span>
                </td>
                <td style={{ padding: '1rem', paddingRight: '2rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                  {employee.sales}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Performance;
