import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

// Initial Mock Data (Presentation ke liye Real Layout)
const INITIAL_TABLES = [
  { id: 'T-01', seats: 2, status: 'Available', zone: 'Indoor Main' },
  { id: 'T-02', seats: 4, status: 'Occupied', customer: 'Julien', zone: 'Indoor Main', orderId: 'ORD-101' },
  { id: 'T-03', seats: 6, status: 'Reserved', customer: 'Dr. Raymond', time: '19:30', zone: 'Terrace' },
  { id: 'T-04', seats: 2, status: 'Occupied', customer: 'Sarah', zone: 'Indoor Main', orderId: 'ORD-102' },
  { id: 'T-05', seats: 4, status: 'Available', zone: 'Terrace' },
  { id: 'VIP-1', seats: 8, status: 'Available', zone: 'Terrace' },
];

const INITIAL_MENU = [
  { id: 'M-01', name: 'Truffle Wagyu Ribeye', category: 'Mains', price: 6800, description: 'Premium Wagyu beef with black truffle sauce', available: true },
  { id: 'M-02', name: 'Yuzu Basil Smash', category: 'Beverages', price: 2800, description: 'Fresh refreshing mocktail with yuzu and basil', available: true },
  { id: 'M-03', name: 'Hokkaido Scallops Crudo', category: 'Starters', price: 3925, description: 'Fresh scallops with citrus dressing', available: true },
  { id: 'M-04', name: 'Molten Chocolate Cake', category: 'Desserts', price: 1800, description: 'Warm chocolate cake with vanilla ice cream', available: true },
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-101',
    tableId: 'T-02',
    customer: 'Julien',
    status: 'Active',
    items: [
      { id: 'M-01', name: 'Truffle Wagyu Ribeye', price: 6800, quantity: 1 },
      { id: 'M-02', name: 'Yuzu Basil Smash', price: 2800, quantity: 1 },
    ],
    subtotal: 9600,
  },
  {
    id: 'ORD-102',
    tableId: 'T-04',
    customer: 'Sarah',
    status: 'Active',
    items: [
      { id: 'M-03', name: 'Hokkaido Scallops Crudo', price: 3925, quantity: 1 },
    ],
    subtotal: 3925,
  },
];

export const DataProvider = ({ children }) => {
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // 1. Table Book/Reserve Action
  const bookTable = (tableId, customerName, time) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: 'Reserved', customer: customerName, time }
          : t
      )
    );
  };

  // 2. Create New Order (NewOrderScreen se call hoga)
  const createOrder = (tableId, customerName, items) => {
    const newOrderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id: newOrderId,
      tableId,
      customer: customerName || 'Walk-in Guest',
      status: 'Active',
      items,
      subtotal,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update Table status to Occupied
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: 'Occupied', customer: customerName, orderId: newOrderId }
          : t
      )
    );

    return newOrderId;
  };

  // 3. Clear/Checkout Order & Free Up Table (BillingScreen se call hoga)
  const checkoutOrder = (orderId, tableId) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'Completed' } : ord))
    );

    if (tableId) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, status: 'Available', customer: null, orderId: null }
            : t
        )
      );
    }
  };

  // 4. Add/Update Menu Item
  const addMenuItem = (newItem) => {
    const itemToAdd = {
      ...newItem,
      id: `M-${Math.floor(10 + Math.random() * 90)}`,
      price: Number(newItem.price) || 0,
    };
    setMenu((prev) => [itemToAdd, ...prev]);
  };

  return (
    <DataContext.Provider
      value={{
        tables,
        menu,
        orders,
        bookTable,
        createOrder,
        checkoutOrder,
        addMenuItem,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);