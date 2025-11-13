import { useState } from 'react';
import classNames from 'classnames';

export default function Tabs({ tabs, initialTab }) {
  const isInitialTabValid = tabs.find((it) => it.id === initialTab);
  const [activeTab, setActiveTab] = useState(isInitialTabValid ? initialTab : tabs[0].id);

  return (
    <div className="w-full">
      <div
        className="flex border-b border-gray-200 overflow-x-auto no-scrollbar flex-nowrap print:hidden"
        role="tablist"
        aria-orientation="horizontal">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={classNames(
              'px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div
                key={tab.id}
                id={`panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={tab.id}
                className="animate-slide-in">
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
}
