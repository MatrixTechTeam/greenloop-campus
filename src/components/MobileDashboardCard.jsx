// src/components/MobileDashboardCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const MobileDashboardCard = ({ icon: Icon, label, value, color, onClick, trend }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color.bg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={color.text} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.color}`}>
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
};

export default MobileDashboardCard;