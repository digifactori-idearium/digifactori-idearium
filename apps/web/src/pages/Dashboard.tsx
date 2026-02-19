import { House } from 'lucide-react';
import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Rooms <House />
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Users</h2>
          <p className="text-2xl font-bold mt-2 dark:text-black">120</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
          <p className="text-2xl font-bold mt-2 dark:text-black">45</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Revenue</h2>
          <p className="text-2xl font-bold mt-2 dark:text-black">$3,200</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
