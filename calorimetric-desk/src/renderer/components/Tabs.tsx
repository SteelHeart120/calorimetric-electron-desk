import React, { useState } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

export interface TabItem {
  name: string;
  current: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  onTabChange: (tabName: string) => void;
  className?: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Tabs: React.FC<TabsProps> = ({ tabs, onTabChange, className = '' }) => {
  const currentTab = tabs.find((tab) => tab.current);

  return (
    <div className={className}>
      {/* Mobile dropdown */}
      <div className="sm:hidden">
        <select
          value={currentTab?.name || ''}
          onChange={(e) => onTabChange(e.target.value)}
          aria-label="Select a tab"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav aria-label="Tabs" className="-mb-px flex justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => onTabChange(tab.name)}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
                  'border-b-2 px-8 py-4 text-center text-sm font-medium transition-colors',
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
