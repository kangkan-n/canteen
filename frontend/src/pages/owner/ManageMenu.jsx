import { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } from '../../services/api';
import toast from 'react-hot-toast';

const ManageMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'snacks', preparationTime: '15', isVeg: true });

  const fetchItems = () => { setLoading(true); getMenuItems().then(res => { setItems(res.data.data.menuItems); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => { setForm({ name: '', description: '', price: '', category: 'snacks', preparationTime: '15', isVeg: true }); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) };
    try {
      if (editing) { await updateMenuItem(editing, data); toast.success('Item updated'); }
      else { await createMenuItem(data); toast.success('Item added'); }
      resetForm(); fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', price: String(item.price), category: item.category, preparationTime: String(item.preparationTime), isVeg: item.isVeg });
    setEditing(item._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await deleteMenuItem(id); toast.success('Deleted'); fetchItems(); } catch (err) { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try { await toggleAvailability(id); fetchItems(); } catch (err) { toast.error('Failed'); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div className="page-header" style={{ marginBottom: 0 }}><h1>Manage Menu</h1><p>{items.length} items</p></div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Item</button>
      </div>
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="modal-content">
            <div className="modal-header"><h2>{editing ? 'Edit Item' : 'Add New Item'}</h2><button className="modal-close" onClick={resetForm}>×</button></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3"><label className="form-label">Name</label><input className="form-input form-control" value={form.name} onChange={set('name')} required /></div>
              <div className="form-group mb-3"><label className="form-label">Description</label><input className="form-input form-control" value={form.description} onChange={set('description')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group mb-3"><label className="form-label">Price (₹)</label><input className="form-input form-control" type="number" value={form.price} onChange={set('price')} required min="0" /></div>
                <div className="form-group mb-3"><label className="form-label">Prep Time (min)</label><input className="form-input form-control" type="number" value={form.preparationTime} onChange={set('preparationTime')} min="1" /></div>
              </div>
              <div className="form-group mb-3"><label className="form-label">Category</label><select className="form-input form-control" value={form.category} onChange={set('category')}><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="snacks">Snacks</option><option value="beverages">Beverages</option><option value="dinner">Dinner</option><option value="desserts">Desserts</option></select></div>
              <div className="form-group mb-3"><label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.isVeg} onChange={set('isVeg')} /> Vegetarian</label></div>
              <div style={{ display: 'flex', gap: 12 }}><button className="btn btn-primary" type="submit">{editing ? 'Update' : 'Add'} Item</button><button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
      {loading ? <div className="loader"><div className="spinner"></div></div> : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Prep</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>{item.isVeg ? '🟢' : '🔴'}</span><strong>{item.name}</strong></div></td>
                  <td>{item.category}</td>
                  <td>₹{item.price}</td>
                  <td>{item.preparationTime}m</td>
                  <td><button className={`btn btn-sm ${item.isAvailable ? 'btn-success' : 'btn-danger'}`} onClick={() => handleToggle(item._id)}>{item.isAvailable ? 'Available' : 'Unavailable'}</button></td>
                  <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>Edit</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Del</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageMenu;
