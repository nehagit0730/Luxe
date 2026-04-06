import React from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';

export const Footer = () => {
  const { settings } = useSettingsStore();

  const columns = settings?.footer.columns || [
    {
      title: 'Shop',
      items: [
        { label: 'All Products', url: '/shop' },
        { label: 'New Arrivals', url: '/categories/new-arrivals' },
        { label: 'Featured', url: '/categories/featured' },
        { label: 'Sale', url: '/categories/sale' }
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Contact Us', url: '/contact' },
        { label: 'Shipping Info', url: '/shipping' },
        { label: 'Returns & Exchanges', url: '/returns' },
        { label: 'FAQ', url: '/faq' }
      ]
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-black">
              {settings?.general.logo ? (
                <img src={settings.general.logo} alt={settings.general.siteName} className="h-8 w-auto" />
              ) : (
                settings?.general.siteName || 'LUXE.'
              )}
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs">
              Premium fashion and lifestyle products curated for the modern individual. Quality meets elegance.
            </p>
          </div>
          {columns.map((column, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">{column.title}</h3>
              <ul className="mt-4 space-y-2">
                {column.items.map((item, j) => (
                  <li key={j}>
                    <Link to={item.url} className="text-sm text-gray-500 hover:text-black">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {settings?.footer.showAdminLogin && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">Admin</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/admin/login" className="text-sm text-gray-500 hover:text-black font-bold">
                    Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-gray-400">
            {settings?.footer.copyright || `© ${new Date().getFullYear()} LuxeCommerce. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};
