import React from 'react';
import { Users, FileText, MessageSquare, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Notes',
      value: '5,678',
      icon: FileText,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Feedback Messages',
      value: '89',
      icon: MessageSquare,
      color: 'bg-yellow-500',
      change: '+23%'
    },
    {
      title: 'Growth Rate',
      value: '15.3%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5%'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-sm text-gray-500">John Doe joined the platform</p>
            </div>
            <span className="text-sm text-gray-400">2 hours ago</span>
          </div>

          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New note created</p>
              <p className="text-sm text-gray-500">Machine Learning study notes uploaded</p>
            </div>
            <span className="text-sm text-gray-400">4 hours ago</span>
          </div>

          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New feedback received</p>
              <p className="text-sm text-gray-500">User feedback about the note generation feature</p>
            </div>
            <span className="text-sm text-gray-400">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;