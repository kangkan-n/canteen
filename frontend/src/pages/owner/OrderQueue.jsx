import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import toast from 'react-hot-toast';

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    getAllOrders(params).then(res => { setOrders(res.data.data.orders); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);
  useEffect(() => { const interval = setInterval(fetchOrders, 15000); return () => clearInterval(interval); }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const nextStatus = { placed: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' };
  const statusEmoji = { placed: '🆕', confirmed: '✅', preparing: '👨‍🍳', ready: '🔔', delivered: '📦', cancelled: '❌' };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Order Queue</h1><p>Manage incoming orders</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s ? `${statusEmoji[s]} ${s}` : '🍽️ All'}
          </button>
        ))}
      </div>
      {loading ? <div className="loader"><div className="spinner"></div></div> : orders.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No orders</h3></div>
      ) : (
        <div className="grid-2">
          {orders.map(order => (
            <div className="order-card slide-up" key={order._id} style={{ borderLeft: `3px solid ${order.status === 'placed' ? 'var(--info)' : order.status === 'preparing' ? '#a855f7' : order.status === 'ready' ? 'var(--success)' : 'var(--border)'}` }}>
              <div className="order-header">
                <span className="order-number">{statusEmoji[order.status]} #{order.orderNumber}</span>
                <span className={`badge badge-${order.status === 'cancelled' ? 'danger' : order.status === 'ready' ? 'success' : 'warning'}`}>{order.status}</span>
              </div>
              <p style={{ fontSize: '0.88rem', marginBottom: 8 }}>👤 <strong>{order.student?.name}</strong> {order.student?.rollNumber && `(${order.student.rollNumber})`}</p>
              {order.student?.phone && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>📞 {order.student.phone}</p>}
              <div className="order-items">
                {order.items.map((item, i) => <div className="order-item-row" key={i}><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>)}
              </div>
              {order.specialInstructions && <p style={{ fontSize: '0.82rem', color: 'var(--primary)', margin: '8px 0' }}>📝 {order.specialInstructions}</p>}
              <div className="order-footer">
                <span style={{ fontWeight: 700 }}>₹{order.totalAmount}</span>
                {nextStatus[order.status] && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatus(order._id, nextStatus[order.status])}>
                    Mark as {nextStatus[order.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderQueue;
