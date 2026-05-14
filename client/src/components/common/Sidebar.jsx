import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiShoppingBag, FiList, FiSettings, FiLogOut, FiGrid, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const studentLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/menu', icon: <FiGrid />, label: 'Menu' },
    { to: '/my-orders', icon: <FiShoppingBag />, label: 'My Orders' },
    { to: '/profile', icon: <FiSettings />, label: 'Profile' },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/owner/orders', icon: <FiShoppingBag />, label: 'Order Queue' },
    { to: '/owner/menu', icon: <FiList />, label: 'Manage Menu' },
    { to: '/owner/verify', icon: <FiCheckCircle />, label: 'Verify Students' },
    { to: '/owner/reports', icon: <FiBarChart2 />, label: 'Reports' },
  ];

  const links = user?.role === 'canteenOwner' ? ownerLinks : studentLinks;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">🍽️ <span>Canteen</span>Hub</div>
      <ul className="sidebar-nav">
        {links.map(link => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
        <li style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="nav-link btn btn-link p-0 d-flex align-items-center">
            <span className="nav-icon"><FiLogOut /></span>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
