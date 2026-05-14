import { useState, useEffect } from 'react';
import { getOrderStats, getAllOrders } from '../../services/api';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    getOrderStats().then(res => setStats(res.data.data)).catch(() => {});
    getAllOrders().then(res => setRecentOrders(res.data.data.orders.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <div className="stat-card slide-up"><div className="stat-icon">📦</div><div className="stat-value">{stats.todayOrders || 0}</div><div className="stat-label">Today's Orders</div></div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}><div className="stat-icon">⏳</div><div className="stat-value">{stats.pendingOrders || 0}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}><div className="stat-icon">💰</div><div className="stat-value">₹{stats.todayRevenue || 0}</div><div className="stat-label">Today's Revenue</div></div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.3s' }}><div className="stat-icon">📊</div><div className="stat-value">₹{stats.totalRevenue || 0}</div><div className="stat-label">Total Revenue</div></div>
      </div>
      <h2 style={{ marginBottom: 16 }}>Recent Orders</h2>
      {recentOrders.length === 0 ? <div className="empty-state"><div className="empty-icon">📋</div><h3>No orders yet</h3></div> : (
        <div className="grid-2">
          {recentOrders.map(order => (
            <div className="order-card slide-up" key={order._id}>
              <div className="order-header">
                <span className="order-number">#{order.orderNumber}</span>
                <span className={`badge badge-${order.status === 'cancelled' ? 'danger' : order.status === 'ready' || order.status === 'delivered' ? 'success' : 'warning'}`}>{order.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>👤 {order.student?.name || 'Student'}</p>
              <div className="order-items">
                {order.items.map((item, i) => <div className="order-item-row" key={i}><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>)}
              </div>
              <div className="order-footer"><span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</span><span style={{ fontWeight: 700 }}>₹{order.totalAmount}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
