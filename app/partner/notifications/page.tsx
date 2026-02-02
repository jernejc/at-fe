'use client';

import { BellOff } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="flex-1">
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <h1 className="font-bold text-3xl mb-2">Notifications</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Stay updated on campaign activity and partner communications.
        </p>

        {/* Empty state */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center min-h-[300px]">
          <BellOff className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
        </div>
      </div>
    </div>
  );
}
