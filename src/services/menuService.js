import api from '../config/api';

export const getMenuItems = async () => {
  const { data } = await api.get('/menu-items');
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return data.menu_items || [];
};

export const createMenuItem = async (menuData) => {
  const payload = {
    name: menuData.name,
    price: parseFloat(menuData.price) || 0,
    category: menuData.category || 'Fast Food',
    available: menuData.available !== undefined ? menuData.available : true,
  };

  const { data } = await api.post('/menu-items', payload);
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return data.menu_item;
};

export const updateMenuItem = async (id, menuData) => {
  const payload = {
    name: menuData.name,
    price: parseFloat(menuData.price) || 0,
    category: menuData.category,
    available: menuData.available,
  };

  const { data } = await api.put(`/menu-items/${id}`, payload);
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return data.menu_item;
};

export const toggleMenuAvailability = async (id, available) => {
  const { data } = await api.put(`/menu-items/${id}`, { available });
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return data.menu_item;
};

export const deleteMenuItem = async (id) => {
  const { data } = await api.delete(`/menu-items/${id}`);
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return data;
};