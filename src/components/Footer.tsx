import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-black">
              LUXE.
            </Link>
            <p className="mt-4 text-sm text-gray-500 max-w-xs">
              Premium fashion and lifestyle products curated for the modern individual. Quality meets elegance.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/shop" className="text-sm text-gray-500 hover:text-black">All Products</Link></li>
              <li><Link to="/categories/new-arrivals" className="text-sm text-gray-500 hover:text-black">New Arrivals</Link></li>
              <li><Link to="/categories/featured" className="text-sm text-gray-500 hover:text-black">Featured</Link></li>
              <li><Link to="/categories/sale" className="text-sm text-gray-500 hover:text-black">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-black">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-sm text-gray-500 hover:text-black">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-sm text-gray-500 hover:text-black">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="text-sm text-gray-500 hover:text-black">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-black">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-black">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-sm text-gray-500 hover:text-black">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} LuxeCommerce. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
