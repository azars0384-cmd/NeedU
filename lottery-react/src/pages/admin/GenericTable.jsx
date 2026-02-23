import React, { useEffect, useState } from 'react';
import { getAdminTableData, saveAdminRecord, deleteAdminRecord } from '../../services/api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const GenericTable = ({ sheetName, title, schema }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [sheetName]);

  const fetchData = async () => {
    setLoading(true);
    const res = await getAdminTableData(sheetName);
    if (res.success) setData(res.data.reverse());
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAdminRecord(sheetName, JSON.stringify(formData));
    setLoading(false);
    if (res.success) {
      setEditingItem(null);
      fetchData();
    } else {
      alert('Error saving data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    setLoading(true);
    const res = await deleteAdminRecord(sheetName, id);
    setLoading(false);
    if (res.success) fetchData();
  };

  const openEdit = (item = {}) => {
    setEditingItem(item);
    setFormData(item);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button onClick={() => openEdit({})} className="bg-brand-primary text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-brand-dark">+ Add New</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {schema.map(col => <th key={col.key} className="p-4 font-bold text-gray-600">{col.label}</th>)}
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {schema.map(col => (
                  <td key={col.key} className="p-4">
                    {col.type === 'image' ? <img src={row[col.key]} className="w-10 h-10 rounded-lg object-cover" /> :
                     col.type === 'bool' ? (row[col.key] ? <span className="text-green-500 font-bold">Active</span> : <span className="text-red-500">Inactive</span>) :
                     row[col.key]}
                  </td>
                ))}
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(row)} className="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                  <button onClick={() => handleDelete(row[schema[0].key])} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <Modal isOpen={true} onClose={() => setEditingItem(null)} title={formData[schema[0].key] ? 'Edit Item' : 'New Item'}>
          <div className="grid gap-4 text-left">
            {schema.map(col => (
              <div key={col.key}>
                <label className="block text-xs font-bold text-gray-500 mb-1">{col.label}</label>
                {col.type === 'bool' ? (
                   <select
                     className="w-full border p-2 rounded"
                     value={formData[col.key] || ''}
                     onChange={e => setFormData({...formData, [col.key]: e.target.value === 'true'})}
                   >
                     <option value="true">Active</option>
                     <option value="false">Inactive</option>
                   </select>
                ) : (
                   <input
                     type="text"
                     className="w-full border p-2 rounded"
                     value={formData[col.key] || ''}
                     onChange={e => setFormData({...formData, [col.key]: e.target.value})}
                     readOnly={col.readOnly}
                   />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setEditingItem(null)} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white rounded font-bold">Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GenericTable;
