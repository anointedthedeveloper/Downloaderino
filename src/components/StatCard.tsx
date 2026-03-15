import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface border border-border-subtle rounded-2xl p-5 hover:border-primary/30 transition-all shadow-sm group"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon size={20} className="text-primary" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="font-bold text-lg leading-none">{value}</p>
    </motion.div>
  );
};
