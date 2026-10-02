import api from '../config/api';

const INITIAL_TABLES = [
  { id: '1', number: 'Table 1', table_number: 1, seats: 2, status: 'Available', area: 'Indoor', zone: 'Indoor' },
  { id: '2', number: 'Table 2', table_number: 2, seats: 4, status: 'Occupied', area: 'Indoor', zone: 'Indoor' },
  { id: '3', number: 'Table 3', table_number: 3, seats: 6, status: 'Reserved', area: 'Patio', zone: 'Patio' },
  { id: '4', number: 'Table 4', table_number: 4, seats: 4, status: 'Available', area: 'VIP', zone: 'VIP' },
];

export const getTables = async () => {
  try {
    const { data } = await api.get('/tables');
    const items = data?.tables || (Array.isArray(data) ? data : []);
    if (items.length > 0) {
      return items.map((t) => ({
        ...t,
        number: t.number || `Table ${t.table_number || t.id}`,
        area: t.zone || t.area || 'Indoor',
        seats: t.seats || 4,
        status: t.status || 'Available',
      }));
    }
    return INITIAL_TABLES;
  } catch (error) {
    console.log('API /tables fetch error:', error?.message);
    return INITIAL_TABLES;
  }
};

export const createTable = async (tableData) => {
  // Extract number from string like "Table 5" or int
  const rawNum = String(tableData.number || tableData.table_number || '1').replace(/[^0-9]/g, '');
  const parsedNum = parseInt(rawNum, 10) || Math.floor(Math.random() * 90) + 10;
  const parsedSeats = parseInt(tableData.seats, 10) || 4;

  const payload = {
    table_number: parsedNum,
    seats: parsedSeats,
    status: tableData.status || 'Available',
    zone: tableData.area || tableData.zone || 'Indoor',
  };

  try {
    const { data } = await api.post('/tables', payload);
    const created = data?.table || data;
    return {
      ...created,
      number: `Table ${created.table_number || parsedNum}`,
      area: created.zone || payload.zone,
    };
  } catch (error) {
    console.log('API /tables create fallback:', error?.message);
    return {
      id: Date.now().toString(),
      number: `Table ${parsedNum}`,
      seats: parsedSeats,
      status: payload.status,
      area: payload.zone,
    };
  }
};

export const updateTable = async (id, tableData) => {
  const rawNum = String(tableData.number || tableData.table_number || '1').replace(/[^0-9]/g, '');
  const parsedNum = parseInt(rawNum, 10) || 1;
  const parsedSeats = parseInt(tableData.seats, 10) || 4;

  const payload = {
    table_number: parsedNum,
    seats: parsedSeats,
    zone: tableData.area || tableData.zone || 'Indoor',
  };

  try {
    const { data } = await api.put(`/tables/${id}`, payload);
    const updated = data?.table || data;
    return {
      ...updated,
      number: `Table ${updated.table_number || parsedNum}`,
      area: updated.zone || payload.zone,
    };
  } catch (error) {
    console.log(`API /tables/${id} update fallback:`, error?.message);
    return { id, number: `Table ${parsedNum}`, seats: parsedSeats, area: payload.zone };
  }
};

export const updateTableStatus = async (id, status) => {
  try {
    const { data } = await api.put(`/tables/${id}`, { status });
    return data?.table || data;
  } catch (error) {
    console.log(`API /tables/${id} status fallback:`, error?.message);
    return { id, status };
  }
};

export const deleteTable = async (id) => {
  try {
    const { data } = await api.delete(`/tables/${id}`);
    return data;
  } catch (error) {
    console.log(`API /tables/${id} delete fallback:`, error?.message);
    return { message: 'Deleted' };
  }
};
