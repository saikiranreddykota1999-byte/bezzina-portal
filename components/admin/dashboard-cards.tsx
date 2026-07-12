'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeIn } from '@/lib/motion';
import {
  Package, ShoppingBag, Users, TrendingUp, Warehouse, MessageSquare,
} from 'lucide-react';
import { adminCardClass, adminStatCardClass, adminSubtextClass } from '@/components/admin/admin-styles';

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
          className={`${adminStatCardClass} p-5`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={adminSubtextClass}>{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--admin-navy)]">{card.value}</p>
              <p className={`mt-1 text-xs ${adminSubtextClass}`}>{card.change}</p>
            </div>
            <card.icon className="h-5 w-5 text-[var(--admin-accent)]" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function RevenueChartPlaceholder() {
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68];

  return (
    <div className={`mt-8 ${adminCardClass} p-6`}>
      <h2 className="text-lg font-semibold text-[var(--admin-navy)]">Revenue Analytics</h2>
      <p className={`mt-1 ${adminSubtextClass}`}>Placeholder until pricing and checkout are enabled.</p>
      <div className="mt-8 flex h-48 items-end gap-2">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t bg-[var(--admin-primary)]/80"
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          />
        ))}
      </div>
    </div>
  );
}
