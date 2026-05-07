import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { AdminShell } from '@/components/admin/admin-shell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminResult = await requireAdmin();

  if (!adminResult.ok) {
    redirect(adminResult.code === 'UNAUTHORIZED' ? '/admin' : '/packages');
  }

  const profile = adminResult.profile;

  const menuSections: Array<{ title: string; items: Array<{ href: string; label: string; icon?: string; badge?: string; superAdminOnly?: boolean }> }> = [
    {
      title: 'Headquarters',
      items: [
        { href: '/dashboard', label: 'HQ Overview', icon: '◈' },
        { href: '/dispatch', label: 'Dispatch Center', icon: '◎', badge: '4' },
        { href: '/analytics', label: 'Analytics', icon: '▣', superAdminOnly: true },
      ],
    },
    {
      title: 'Operations',
      items: [
        { href: '/bookings', label: 'Bookings', icon: '◍' },
        { href: '/trips', label: 'Trips', icon: '✈' },
        { href: '/fleet', label: 'Fleet & Armada', icon: '⊡' },
        { href: '/team', label: 'Tim Lapangan', icon: '◉' },
        { href: '/verification', label: 'Verification', icon: '☑' },
      ],
    },
    {
      title: 'Revenue',
      items: [
        { href: '/finance', label: 'Finance', icon: '◦' },
        { href: '/packages-admin', label: 'Paket & Harga', icon: '❖' },
        { href: '/pricing', label: 'Pricing Rule', icon: '⊛' },
        { href: '/crm', label: 'CRM', icon: '◁', badge: '12' },
      ],
    },
    {
      title: 'Growth & AI',
      items: [
        { href: '/marketing', label: 'Marketing', icon: '◌' },
        { href: '/ai-agent', label: 'AI Agent', icon: '◍' },
        { href: '/settings', label: 'Settings', icon: '⚙' },
      ],
    },
  ];

  const visibleSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.superAdminOnly || profile.role === 'super_admin'),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <AdminShell
      roleLabel={profile.role === 'super_admin' ? 'Mas Shafly · Super Admin' : 'Regional Admin'}
      regionLabel={profile.region_id ?? 'HQ'}
      sections={visibleSections}
    >
      {children}
    </AdminShell>
  );
}
