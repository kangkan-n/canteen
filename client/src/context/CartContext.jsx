import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.menuItem === menuItem._id);
      if (existing) {
        return prev.map(i => i.menuItem === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setItems(prev => prev.filter(i => i.menuItem !== menuItemId));
  }, []);

  const updateQty = useCallback((menuItemId, qty) => {
    if (qty <= 0) return removeItem(menuItemId);
    setItems(prev => prev.map(i => i.menuItem === menuItemId ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, totalAmount, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
