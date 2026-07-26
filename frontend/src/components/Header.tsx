/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SidebarTab } from '../types';
import { Search, Bell, History, HelpCircle } from 'lucide-react';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  activeTab: SidebarTab;
  lowStockCount: number;
}

export default function Header({ searchValue, onSearchChange, activeTab, lowStockCount }: HeaderProps) {
  // Profiles mapping to active domains shown in the screenshot mockups
  const getProfile = () => {
    switch (activeTab) {
      case 'inventory':
        return {
          name: 'Admin User',
          role: 'Warehouse Manager',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6uWpDfEU1LLc8zHwOVWMrXpWOdfSvfRe4cAM-qkc3rT9e6vz7zns6J4w4uTLiAExWYU-9OWxkQwpy9ucDVEMQ_E0qRYH71DGjZn75LUU846TMLZ0y-NOtFi7vhSrkqorRbb9rbxKffbQkWzTIi7oJTzDD7TNCSqxLFKhDdGi80nPuBGTAjs-ch9paB7XNo2t4hnk5biX1SXf1h2cH_wfjNz8mLUj5HQ0erSDjadOzttqzG94KhZJ5GvrqH3pm0vVHCCyHhuPedims',
        };
      case 'purchase':
        return {
          name: 'James Wilson',
          role: 'Procurement Manager',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbHzXAli4mi3LZ6dnc0LONMwVPbaDwXje8VUnHCQjJ0cOBMQ8oMPXlB6uykjWlS-weALbVE7g-zgIJ4V6ZAYYx0o_aYHcB0BZsyp_Yq3LmpBNaU5K17Szo1oRGwAJPvSAQ2SdACxH6NbR80SYZrDa5uXtjwrpecP4ywEZG7bsNfq5H6R5h6eWjxxy_qCLd51M_O1v40M6xQV-rOuMUca1ynfzOIJdomzgb9dEGWpVALKJL5Z6rMelloRJ3yYfuEegCaSda4vW2_wYn',
        };
      case 'dashboard':
      default:
        return {
          name: 'Alex Sterling',
          role: 'Admin Specialist',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGLJPct950pIDIj-r_shtMhfpuaKzg4IENvzqdsh87tCyJTLe9LplkLXfmck26Wl84TsMwmAfIzxtahmCUqFua3mktsjeZHwLMP0lXr0Wq5Knw89WaSCGGRX662Ic0Oh2O6mXiq3mviNgEwMzyWd6jyVutua4wOsHxkytyhaHvnDW_khwfYmExyjpoCJ_oCKxPOhPYMJA6kBIoybsq4WOA9SnmnRePTohtxKTNPGH4fmPyntt72Tki6GpvWgzCLjjlZ1wuPmn2oVub',
        };
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'inventory':
        return 'Barcode or item search (e.g. Gandolla, Ink)...';
      case 'purchase':
        return 'Search purchase orders or vendors...';
      default:
        return 'Search orders, stock, or invoices...';
    }
  };

  const profile = getProfile();

  return (
    <header className="h-16 fixed top-0 right-0 z-40 bg-white border-b border-slate-200 flex items-center justify-between px-8 w-[calc(100%-240px)] select-none">
      {/* Search Input Widget */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#645efb] transition-colors"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-5 py-2 text-sm text-[#0b1c30] placeholder-slate-400 focus:outline-none focus:border-[#645efb] focus:bg-white focus:ring-2 focus:ring-[#645efb]/10 transition-all font-sans"
            placeholder={getPlaceholder()}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-[#0b1c30] font-sans"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Control Tools and Profile Details */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <button className="relative hover:bg-slate-100 p-2 rounded-full transition-all text-slate-500 hover:text-slate-800">
            <Bell size={20} />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-sans font-bold rounded-full flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* History button */}
          <button className="hover:bg-slate-100 p-2 rounded-full transition-all text-slate-500 hover:text-slate-800" title="History logs">
            <History size={20} />
          </button>

          {/* Help button */}
          <button className="hover:bg-slate-100 p-2 rounded-full transition-all text-slate-500 hover:text-slate-800" title="System assistance">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200"></div>

        {/* Dynamic Profile Widget */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right">
            <p className="font-sans font-semibold text-sm text-[#00236f] leading-none group-hover:text-[#645efb] transition-colors">
              {profile.name}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1 leading-none">
              {profile.role}
            </p>
          </div>
          <img
            src={profile.avatar}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>
    </header>
  );
}
