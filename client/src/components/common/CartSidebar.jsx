import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, updateQty, removeItem, clearCart, totalAmount } = useCart();
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ menuItem: i.menuItem, quantity: i.quantity }));
      await placeOrder({ items: orderItems, specialInstructions: instructions });
      toast.success('Order placed successfully! 🎉');
      clearCart();
      setInstructions('');
      setIsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setLoading(false);
  };

  return (
    <>
      {isOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} onClick={() => setIsOpen(false)} />}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>Your Cart</h2>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.3rem' }}><FiX /></button>
        </div>
        {items.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🛒</div><h3>Cart is empty</h3><p>Browse the menu to add items</p></div>
        ) : (
          <>
            {items.map(item => (
              <div className="cart-item" key={item.menuItem}>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price} each</div>
                </div>
                <div className="cart-qty">
                  <button onClick={() => updateQty(item.menuItem, item.quantity - 1)}><FiMinus /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.menuItem, item.quantity + 1)}><FiPlus /></button>
                  <button onClick={() => removeItem(item.menuItem)} style={{ color: 'var(--accent)' }}><FiTrash2 /></button>
                </div>
              </div>
            ))}
            <div className="form-group mb-3" style={{ marginTop: 16 }}>
              <label className="form-label">Special Instructions</label>
              <input className="form-input form-control" placeholder="Any special requests..." value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>
            <div className="cart-total">
              <div className="cart-total-row"><span>Total</span><span>₹{totalAmount}</span></div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleOrder} disabled={loading}>
              {loading ? 'Placing...' : 'Place Order'}
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={clearCart}>Clear Cart</button>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
