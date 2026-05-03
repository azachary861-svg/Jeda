import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { isAdminRole, isDriverRole } from '@/lib/auth/portal';
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  let role: string | null = null;
  let userEmail: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      userEmail = user?.email ?? null;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        role = profile?.role ?? null;
      }
    } catch {
      role = null;
      userEmail = null;
    }
  }

  const userInitial = userEmail?.slice(0, 2).toUpperCase() ?? 'GU';

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketplaceHeader
        isLoggedIn={Boolean(userEmail)}
        isAdmin={isAdminRole(role)}
        isDriver={isDriverRole(role)}
        userInitial={userInitial}
      />
      {children}
    </div>
  );
}
