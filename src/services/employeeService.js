import api from '../config/api';

const mapEmployee = (e) => ({
  id: e.id,
  name: e.full_name || e.name || 'Staff Member',
  full_name: e.full_name,
  email: e.email,
  role: e.role,
  active: e.active !== undefined ? e.active : true,
});

export const getEmployees = async () => {
  const { data } = await api.get('/employees');
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return (data.employees || []).map(mapEmployee);
};

export const createEmployee = async (employeeData) => {
  const payload = {
    full_name: employeeData.name || employeeData.full_name,
    email: employeeData.email,
    role: employeeData.role,
    active: employeeData.active !== undefined ? employeeData.active : true,
  };

  const { data } = await api.post('/employees', payload);
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return mapEmployee(data.employee);
};

export const updateEmployee = async (id, employeeData) => {
  const payload = {
    full_name: employeeData.name || employeeData.full_name,
    email: employeeData.email,
    role: employeeData.role,
    active: employeeData.active,
  };

  const { data } = await api.put(`/employees/${id}`, payload);
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return mapEmployee(data.employee);
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/employees/${id}`);
  if (data.error || data.detail) throw new Error(data.error || data.detail);
  return data;
};