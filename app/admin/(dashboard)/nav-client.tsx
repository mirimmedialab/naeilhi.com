'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  School,
  FileText,
  Award,
  BookOpen,
  UserCog,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

const ALL_TABS: Array<{
  href: string;
  label: string;
  Icon: LucideIcon;
  adminOnly: boolean;
}> = [
  { href: '/admin', label: '대시보드', Icon: BarChart3, adminOnly: true },
  { href: '/admin/universities', label: '대학 관리', Icon: School, adminOnly: true },
  { href: '/admin/applications', label: '신청 관리', Icon: FileText, adminOnly: false },
  { href: '/admin/completions', label: '수료 관리', Icon: Award, adminOnly: false },
  { href: '/admin/courses', label: '과정 정보', Icon: BookOpen, adminOnly: true },
  { href: '/admin/users', label: '계정 관리', Icon: UserCog, adminOnly: true },
];

export function AdminNav({ role }: { role: 'admin' | 'operator' }) {
  const pathname = usePathname();
  const tabs = ALL_TABS.filter((t) => !t.adminOnly || role === 'admin');

  return (
    <nav className="max-w-6xl mx-auto px-4 lg:px-6 flex gap-1 overflow-x-auto scroll-hide">
      {tabs.map(({ href, label, Icon }) => {
        // /admin 은 정확 매치, 나머지는 startsWith
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2',
              active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function RoleBadge({
  role,
  name,
}: {
  role: 'admin' | 'operator';
  name: string;
}) {
  const config = ROLES[role];
  const badgeClass =
    role === 'admin'
      ? 'bg-gradient-to-br from-rose-500 to-red-600'
      : 'bg-gradient-to-br from-blue-500 to-indigo-600';
  const Icon = role === 'admin' ? ShieldCheck : UserCog;

  return (
    <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
      <div className={`w-6 h-6 rounded-md ${badgeClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div className="text-left leading-tight">
        <p className="text-[9px] font-bold tracking-wider text-slate-500">{config.shortLabel}</p>
        <p className="text-xs font-semibold text-slate-900 max-w-[120px] truncate">{name}</p>
      </div>
    </div>
  );
}
