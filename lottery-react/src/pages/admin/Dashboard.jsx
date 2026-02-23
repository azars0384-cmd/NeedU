import React, { useEffect, useState } from 'react';
import { getAdminStats, getDashboardChartData } from '../../services/api';
import Loader from '../../components/Loader';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const s = await getAdminStats();
      const c = await getDashboardChartData();
      if (s.success) setStats(s.data);
      if (c.success) setChartData(c.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const chartConfig = {
    labels: chartData?.trends?.labels || [],
    datasets: [
        { label: 'Deposit', data: chartData?.trends?.deposit || [], backgroundColor: '#10B981' },
        { label: 'Withdraw', data: chartData?.trends?.withdraw || [], backgroundColor: '#EF4444' }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase font-bold">Total Users</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase font-bold">Today Deposit</p>
            <h3 className="text-3xl font-bold text-green-500 mt-2">฿{(stats?.totalDeposits || 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase font-bold">Today Withdraw</p>
            <h3 className="text-3xl font-bold text-red-500 mt-2">฿{(stats?.totalWithdrawals || 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase font-bold">Total Bets</p>
            <h3 className="text-3xl font-bold text-blue-500 mt-2">฿{(stats?.totalBets || 0).toLocaleString()}</h3>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm h-80">
         <Bar data={chartConfig} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default Dashboard;
