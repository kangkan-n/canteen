import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyOrders } from '../../services/api';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(res => { setRecentOrders(res.data.data.orders.slice(0, 5)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusColor = (s) => `status-${s}`;

  return (
    <div className="fade-in">
      {!user?.isVerified && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><strong style={{ color: 'var(--primary)' }}>⚠️ Account Not Verified</strong><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>Visit the canteen to get your verification token</p></div>
          <Link to="/verify" className="btn btn-primary btn-sm">Verify Now</Link>
        </div>
      )}
      <div className="stats-grid">
        <div className="stat-card slide-up"><div className="stat-icon">📦</div><div className="stat-value">{recentOrders.length}</div><div className="stat-label">Recent Orders</div></div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}><div className="stat-icon">🔄</div><div className="stat-value">{recentOrders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length}</div><div className="stat-label">Active Orders</div></div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}><div className="stat-icon">✅</div><div className="stat-value">{recentOrders.filter(o => o.status === 'delivered').length}</div><div className="stat-label">Delivered</div></div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.3s' }}><div className="stat-icon">{user?.isVerified ? '🟢' : '🟡'}</div><div className="stat-value">{user?.isVerified ? 'Yes' : 'No'}</div><div className="stat-label">Verified</div></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Recent Orders</h2>
        <Link to="/my-orders" className="btn btn-secondary btn-sm">View All</Link>
      </div>
      {loading ? <div className="loader"><div className="spinner"></div></div> : recentOrders.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🍕</div><h3>No orders yet</h3><p>Browse the <Link to="/menu">menu</Link> to place your first order!</p></div>
      ) : (
        <div className="grid-2">
          {recentOrders.map(order => (
            <div className="order-card slide-up" key={order._id}>
              <div className="order-header"><span className="order-number">#{order.orderNumber}</span><span className={`badge badge-${order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'info' : 'warning'}`}>{order.status}</span></div>
              <div className="order-items">{order.items.map((item, i) => <div className="order-item-row" key={i}><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>)}</div>
              <div className="order-footer"><span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(order.createdAt).toLocaleString()}</span><span style={{ fontWeight: 700, fontFamily: 'Outfit' }}>₹{order.totalAmount}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
