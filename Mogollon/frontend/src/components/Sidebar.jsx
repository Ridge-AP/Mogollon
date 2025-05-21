// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Grid,
  Box,
  List,
  ShoppingCart,
  FileText,
  Users,
  ShoppingBag,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const ALL_NAV = [
  { label: 'Admin',      to: '/admin',     Icon: Settings },
  { label: 'Dashboard',  to: '/dashboard', Icon: Grid },
  { label: 'Inventory',  to: '/inventory', Icon: Box },
  { label: 'RFQs',       to: '/rfqs',      Icon: List },
  { label: 'Orders',     to: '/orders',    Icon: ShoppingCart },
  { label: 'Quotes',     to: '/quotes',    Icon: FileText },
  { label: 'VMI',        to: '/vmi',       Icon: Users },
  { label: 'E-Commerce', to: '/ecommerce', Icon: ShoppingBag },
];

const ROLE_PERMISSIONS = {
  admin:            ALL_NAV.map(item => item.to),
  'sales-rep':      ['/dashboard','/quotes','/orders'],
  'warehouse-staff':['/dashboard','/inventory','/rfqs'],
  'neighbor-client':['/dashboard','/ecommerce'],
  'other-client':   ['/dashboard','/portal'],
  vendor:           ['/dashboard','/rfqs'],
};

export default function Sidebar() {
  const { role, username: ctxUsername } = useAuth();
  const allowedRoutes = ROLE_PERMISSIONS[role] || [];
  const navItems = ALL_NAV.filter(item => allowedRoutes.includes(item.to));

  const [username, setUsername] = useState(ctxUsername || '');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Load username & avatar from API on mount
  useEffect(() => {
    async function loadProfile() {
      try {
       const { data } = await api.get('/profile/me/');
        setUsername(data.username);
        setAvatarUrl(data.avatar);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    }
    loadProfile();
  }, []);

  // Trigger file picker
  const handlePicClick = () => fileInputRef.current?.click();

  // Upload new avatar
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('avatar', file);

    try {
       const { data } = await api.patch('/profile/me/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(data.avatar);
    } catch (err) {
      console.error('Avatar upload failed', err);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Static app title */}
      <div className="h-16 flex items-center px-6 text-2xl font-bold text-gray-800">
        Mogollon
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ label, to, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition
               ${isActive ? 'bg-yellow-100 text-yellow-800 font-semibold' : ''}`
            }
          >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile & Logout */}
      <div className="px-4 py-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Avatar picker */}
          <div
            onClick={handlePicClick}
            className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-gray-500">
                {username?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{username}</p>
            <Link
              to="/logout"
              className="text-xs text-red-500 hover:underline"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
