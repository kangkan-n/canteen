import { useState, useEffect } from 'react';
import { getMyOrders, cancelOrder } from '../../services/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    getMyOrders(params).then(res => { setOrders(res.data.data.orders); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId, { reason: 'Cancelled by student' });
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  const statusBadge = (s) => {
    const map = { placed: 'warning', confirmed: 'warning', preparing: 'info', ready: 'success', delivered: 'info', cancelled: 'danger' };
    return `badge badge-${map[s] || 'info'}`;
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>My Orders</h1><p>Track and manage your orders</p></div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      {loading ? <div className="loader"><div className="spinner"></div></div> : orders.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📦</div><h3>No orders found</h3></div>
      ) : (
        <div className="grid-2">
          {orders.map(order => (
            <div className="order-card slide-up" key={order._id}>
              <div className="order-header">
                <span className="order-number">#{order.orderNumber}</span>
                <span className={statusBadge(order.status)}>{order.status}</span>
              </div>
              <div className="order-items">
                {order.items.map((item, i) => (
                  <div className="order-item-row" key={i}><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>
                ))}
              </div>
              {order.specialInstructions && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '8px 0' }}>📝 {order.specialInstructions}</p>}
              {order.expectedDeliveryTime && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0' }}>🕐 Expected: {new Date(order.expectedDeliveryTime).toLocaleTimeString()}</p>}
              <div className="order-footer">
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{new Date(order.createdAt).toLocaleString()}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, fontFamily: 'Outfit' }}>₹{order.totalAmount}</span>
                  {!['ready', 'delivered', 'cancelled'].includes(order.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order._id)}>Cancel</button>
                  )}
                </div>
              </div>
              {order.status === 'cancelled' && order.cancellationReason && (
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 8 }}>Reason: {order.cancellationReason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
