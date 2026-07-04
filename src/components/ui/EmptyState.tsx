'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'No data found',
  description = 'There is nothing to display at the moment.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-5">
        <Inbox className="w-10 h-10 text-primary/30" />
      </div>
      <h3 className="font-playfair text-xl font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text/50 max-w-md">{description}</p>
    </div>
  );
}
