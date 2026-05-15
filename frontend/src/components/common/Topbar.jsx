import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FiShoppingCart } from 'react-icons/fi';

const Topbar = () => {
  const { user } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  return (
    <div className="topbar">
      <div className="page-header">
        <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p>{user?.role === 'student' ? (user?.isVerified ? 'Verified Student' : '⚠️ Account not verified') : 'Canteen Owner'}</p>
      </div>
      <div className="topbar-right">
        {user?.role === 'student' && (
          <div className="notification-bell" onClick={() => setCartOpen(true)}>
            <FiShoppingCart size={22} />
            {totalItems > 0 && <span className="notification-count">{totalItems}</span>}
          </div>
        )}
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
      </div>
    </div>
  );
};

export default Topbar;
