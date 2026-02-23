import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { syncExternalResults } from '../../services/api';
import Loader from '../../components/Loader';

const ResultsManager = () => {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    const res = await syncExternalResults();
    setLoading(false);
    if (res.success) {
      alert(`Synced Successfully! Updated: ${res.updated} items`);
    } else {
      alert(`Sync Failed: ${res.error}`);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Results Management</h2>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
           <i className="fas fa-sync-alt"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sync External Results</h3>
        <p className="text-gray-500 mb-6 font-light">
           Automatically fetch latest lottery results from the external source.
        </p>
        <button
          onClick={handleSync}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition transform active:scale-95"
        >
          Run Sync Engine
        </button>
      </div>
    </div>
  );
};

export default ResultsManager;
