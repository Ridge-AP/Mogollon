// src/components/Topbar.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const routeTitles = {
  '/dashboard':     'Dashboard',
  '/admin':         'Admin Dashboard',
  '/inventory':     'Inventory',
  '/rfqs':          'RFQs',
  '/orders':        'Sales Orders',
  '/quotes':        'Sales Quotes',
  '/vmi':           'VMI Tools',
  '/ecommerce':     'E-Commerce Store',
  '/store':         'E-Commerce Store',
  '/sales':         'Sales Rep Portal',
  '/warehouse':     'Warehouse Dashboard',
  '/portal':        'Client Portal',
  '/vendor':        'Vendor Portal',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] || '';

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

      {/* Right-side controls */}
      <div className="flex items-center space-x-4">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
