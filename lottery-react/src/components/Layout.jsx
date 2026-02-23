import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Loader from './Loader';

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('th_lotto_user'));

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-kanit">
      <div className="w-full max-w-md mx-auto bg-white shadow-xl min-h-screen relative pb-20 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 p-4 bg-gray-50 min-h-[calc(100vh-140px)]">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
