import { useState, useEffect } from 'react';
import { getMenuItems } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categories = ['all', 'breakfast', 'lunch', 'snacks', 'beverages', 'dinner', 'desserts'];
const categoryEmoji = { breakfast: '🌅', lunch: '🍛', snacks: '🍟', beverages: '☕', dinner: '🌙', desserts: '🍰' };

const MenuBrowser = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (search) params.search = search;
    setLoading(true);
    getMenuItems(params).then(res => { setItems(res.data.data.menuItems); setLoading(false); }).catch(() => setLoading(false));
  }, [category, search]);

  const handleAdd = (item) => {
    if (!user?.isVerified) { toast.error('Please verify your account first'); return; }
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Menu</h1><p>Browse delicious items and add to cart</p></div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input form-control" style={{ maxWidth: 300 }} placeholder="🔍 Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategory(cat)}>
              {cat === 'all' ? '🍽️ All' : `${categoryEmoji[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>
      </div>
      {loading ? <div className="loader"><div className="spinner"></div></div> : items.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🍽️</div><h3>No items found</h3><p>Try a different category or search</p></div>
      ) : (
        <div className="grid-3">
          {items.map(item => (
            <div className="menu-card slide-up" key={item._id} style={{ opacity: item.isAvailable ? 1 : 0.5 }}>
              <div className="menu-card-img">{categoryEmoji[item.category] || '🍽️'}</div>
              <div className="menu-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span className="menu-card-title">{item.name}</span>
                  <span className={`badge ${item.isVeg ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                </div>
                <p className="menu-card-desc">{item.description || 'Delicious item from our kitchen'}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>⏱ {item.preparationTime} min</div>
                <div className="menu-card-footer">
                  <span className="menu-card-price">₹{item.price}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAdd(item)} disabled={!item.isAvailable}>
                    {item.isAvailable ? '+ Add' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuBrowser;
