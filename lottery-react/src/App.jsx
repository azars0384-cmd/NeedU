// Update App.jsx with Admin Routes
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Bet from './pages/Bet';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Results from './pages/Results';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import GenericTable from './pages/admin/GenericTable';
import ResultsManager from './pages/admin/ResultsManager';

const schemas = {
  transactions: [
    { key: 'รหัสธุรกรรม', label: 'ID', readOnly: true },
    { key: 'รหัสผู้ใช้', label: 'User ID', readOnly: true },
    { key: 'ประเภท', label: 'Type', readOnly: true },
    { key: 'จำนวนเงิน', label: 'Amount' },
    { key: 'สถานะ', label: 'Status' },
    { key: 'ลิงก์สลิป', label: 'Slip', type: 'image' },
  ],
  users: [
    { key: 'รหัสผู้ใช้', label: 'User ID', readOnly: true },
    { key: 'ชื่อผู้ใช้', label: 'Username' },
    { key: 'ชื่อ-สกุล', label: 'Name' },
    { key: 'ยอดเงินคงเหลือ', label: 'Balance' },
    { key: 'สถานะ', label: 'Status', type: 'bool' },
  ],
  lotto: [
    { key: 'รหัสประเภทหวย', label: 'ID' },
    { key: 'ชื่อเต็ม', label: 'Name' },
    { key: 'เปิดใช้งาน', label: 'Active', type: 'bool' },
    { key: 'ลิงก์รูปภาพ', label: 'Image', type: 'image' },
  ]
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AuthGuard role="user" />}>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/bet" element={<Layout><Bet /></Layout>} />
          <Route path="/wallet" element={<Layout><Wallet /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/results" element={<Layout><Results /></Layout>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AuthGuard role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/transactions" element={<AdminLayout><GenericTable sheetName="Transactions" title="Transactions" schema={schemas.transactions} /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><GenericTable sheetName="Users" title="Users" schema={schemas.users} /></AdminLayout>} />
          <Route path="/admin/lottery-types" element={<AdminLayout><GenericTable sheetName="LotteryTypes" title="Lottery Types" schema={schemas.lotto} /></AdminLayout>} />
          <Route path="/admin/results" element={<AdminLayout><ResultsManager /></AdminLayout>} />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
