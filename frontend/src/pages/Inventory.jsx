import { inventoryData } from '../data/mockData';
import { Search, Filter, Plus } from 'lucide-react';

const Inventory = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'var(--success)';
      case 'Low Stock': return 'var(--warning)';
      case 'Out of Stock': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track stock levels and manage product catalog.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '0.5rem 1rem', 
            borderRadius: '8px', 
            flex: 1,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search products..." 
              style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '0.75rem', outline: 'none', width: '100%' }} 
            />
          </div>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            color: 'white', 
            padding: '0 1.5rem', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Product Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Price</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Stock Level</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.category}</td>
                <td style={{ padding: '1rem' }}>{item.price}</td>
                <td style={{ padding: '1rem' }}>{item.stock}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    color: getStatusColor(item.status), 
                    background: `color-mix(in srgb, ${getStatusColor(item.status)} 15%, transparent)`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: `1px solid color-mix(in srgb, ${getStatusColor(item.status)} 30%, transparent)`
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default Inventory;
