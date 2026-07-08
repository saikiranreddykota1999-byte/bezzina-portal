'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '@/lib/motion';
import {
  Package, ShoppingBag, Users, TrendingUp, Warehouse, MessageSquare,
} from 'lucide-react';

const cards = [
  { title: 'Total Products', value: '547+', icon: Package, change: '+12 this week' },
  { title: 'Orders', value: '—', icon: ShoppingBag, change: 'Placeholder until checkout' },
  { title: 'Customers', value: '—', icon: Users, change: 'Registration enabled' },
  { title: 'Fast Selling', value: '—', icon: TrendingUp, change: 'Track top movers' },
  { title: 'Low Stock', value: '—', icon: Warehouse, change: 'Inventory alerts' },
  { title: 'Suggestions', value: '—', icon: MessageSquare, change: 'Customer feedback' },
];

export function DashboardCards() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => (
        <motion.div
          key={card.title}
          variants={fadeIn}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.change}</p>
            </div>
            <card.icon className="h-5 w-5 text-orange-500" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function RevenueChartPlaceholder() {
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68];

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Analytics</h2>
      <p className="mt-1 text-sm text-slate-500">Placeholder until pricing and checkout are enabled.</p>
      <div className="mt-8 flex h-48 items-end gap-2">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-orange-500/80 dark:bg-orange-400/80"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
}
