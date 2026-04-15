import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'SUCCESS':
    case 'DEPLOYED':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'RUNNING':
    case 'IN_PROGRESS':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'PENDING':
    case 'QUEUED':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'FAILED':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'CANCELLED':
    case 'SKIPPED':
    case 'ROLLED_BACK':
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case 'SUCCESS':
    case 'DEPLOYED':
      return 'bg-emerald-400';
    case 'RUNNING':
    case 'IN_PROGRESS':
      return 'bg-blue-400 status-running';
    case 'PENDING':
    case 'QUEUED':
      return 'bg-amber-400';
    case 'FAILED':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
}
