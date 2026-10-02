import api from '../config/api';

const INITIAL_ORDERS = [
  {
    id: 'ORD-101',
    table: 'T-02',
    customer: 'Julien M.',
    waiter: 'Elena S.',
    status: 'In Kitchen',
    time: '12 mins ago',
    items: [
      { name: 'Truffle Wagyu Ribeye', price: 6800, qty: 1 },
      { name: 'Yuzu Basil Smash', price: 2800, qty: 1 },
    ],
  },
  {
    id: 'ORD-102',
    table: 'T-04',
    customer: 'Walk-in Guest',
    waiter: 'Alex K.',
    status: 'Served',
    time: '25 mins ago',
    items: [
      { name: 'Zinger Burger Super', price: 1250, qty: 2 },
      { name: 'Fresh Mint Lemonade', price: 450, qty: 2 },
    ],
  },
  {
    id: 'ORD-103',
    table: 'T-01',
    customer: 'Sophia Chen',
    waiter: 'Elena S.',
    status: 'Completed',
    time: '45 mins ago',
    items: [
      { name: 'Classic Margherita Pizza', price: 2200, qty: 1 },
      { name: 'Iced Peach Tea', price: 650, qty: 1 },
    ],
  },
];

export const getOrders = async () => {
  try {
    const { data } = await api.get('/orders');
    return data && Array.isArray(data) && data.length > 0 ? data : INITIAL_ORDERS;
  } catch (error) {
    console.log('API /orders fetch error (using fallback):', error?.message);
    return INITIAL_ORDERS;
  }
};

export const createOrder = async (orderData) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return data;
  } catch (error) {
    console.log('API /orders create error (local fallback):', error?.message);
    return {
      id: `ORD-${Date.now().toString().slice(-3)}`,
      time: 'Just now',
      status: 'In Kitchen',
      ...orderData,
    };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return data;
  } catch (error) {
    console.log(`API /orders/${id}/status update error (local fallback):`, error?.message);
    return { id, status };
  }
};

export const checkoutOrder = async (id, paymentPayload) => {
  try {
    const { data } = await api.post(`/orders/${id}/checkout`, paymentPayload);
    return data;
  } catch (error) {
    console.log(`API /orders/${id}/checkout error (local fallback):`, error?.message);
    return { message: 'Checkout completed' };
  }
};
