import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaTrophy, FaWallet, FaUser } from 'react-icons/fa';

const Footer = () => {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = path === to;
    return (
      <Link to={to} className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>
        <div className={`transition-transform duration-300 ${isActive ? '-translate-y-2 scale-110' : ''}`}>
           <Icon className={`text-2xl ${isActive ? 'drop-shadow-md' : ''}`} />
        </div>
        <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-light'}`}>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto h-[calc(70px+env(safe-area-inset-bottom,0px))] bg-white border-t border-gray-200 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(10px+env(safe-area-inset-bottom,0px))]">
      <NavItem to="/home" icon={FaHome} label="หน้าหลัก" />
      <NavItem to="/bet" icon={FaTicketAlt} label="แทงหวย" />
      <NavItem to="/results" icon={FaTrophy} label="ผลรางวัล" />
      <NavItem to="/wallet" icon={FaWallet} label="ฝาก/ถอน" />
      <NavItem to="/profile" icon={FaUser} label="โปรไฟล์" />
    </nav>
  );
};

export default Footer;
