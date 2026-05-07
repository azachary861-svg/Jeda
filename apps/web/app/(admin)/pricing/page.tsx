import { createClient } from '@/lib/supabase/server';
import { createPricingRuleAction, togglePricingRuleAction } from '@/actions/admin';

export default async function PricingPage() {
  const supabase = await createClient();

  const [{ data: rules }, { data: regions }, { data: packages }] = await Promise.all([
    supabase
      .from('pricing_rules')
      .select('id,name,rule_type,multiplier,start_date,end_date,priority,is_active,region_id,package_id')
      .order('priority', { ascending: false })
      .limit(200),
    supabase.from('regions').select('id,display_name,name').order('display_name', { ascending: true }).limit(50),
    supabase.from('packages').select('id,name').order('name', { ascending: true }).limit(100),
  ]);

  const regionMap = new Map((regions ?? []).map((region) => [region.id, region.display_name ?? region.name]));
  const packageMap = new Map((packages ?? []).map((pkg) => [pkg.id, pkg.name]));

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Dynamic Pricing Rules</h1>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Buat Rule Baru</h2>
        <form action={createPricingRuleAction} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input name="name" required placeholder="Peak season" className="rounded border px-2 py-1.5 text-sm" />
          <input name="ruleType" required placeholder="seasonal" className="rounded border px-2 py-1.5 text-sm" />
          <input name="multiplier" required type="number" step="0.01" min="0.5" max="3" defaultValue="1.00" className="rounded border px-2 py-1.5 text-sm" />
          <input name="priority" required type="number" min="0" max="100" defaultValue="10" className="rounded border px-2 py-1.5 text-sm" />
          <select name="regionId" className="rounded border px-2 py-1.5 text-sm">
            <option value="">Semua region</option>
            {(regions ?? []).map((region) => (
              <option key={region.id} value={region.id}>{region.display_name ?? region.name}</option>
            ))}
          </select>
          <select name="packageId" className="rounded border px-2 py-1.5 text-sm">
            <option value="">Semua paket</option>
            {(packages ?? []).map((pkg) => (
              <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
            ))}
          </select>
          <input name="startDate" type="date" className="rounded border px-2 py-1.5 text-sm" />
          <input name="endDate" type="date" className="rounded border px-2 py-1.5 text-sm" />
          <select name="isActive" defaultValue="true" className="rounded border px-2 py-1.5 text-sm">
            <option value="true">active</option>
            <option value="false">inactive</option>
          </select>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Simpan Rule</button>
        </form>
      </section>

      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(rules ?? []).map((rule) => (
            <div key={rule.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-2">
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-xs text-slate-500">
                  {rule.rule_type} • priority {rule.priority} • {rule.start_date ?? '-'} s/d {rule.end_date ?? '-'}
                </p>
                <p className="text-xs text-slate-500">
                  region: {rule.region_id ? (regionMap.get(rule.region_id) ?? rule.region_id) : 'all'} • package: {rule.package_id ? (packageMap.get(rule.package_id) ?? rule.package_id) : 'all'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-medium">x{rule.multiplier}</p>
                  <p className="text-xs text-slate-500">{rule.is_active ? 'active' : 'inactive'}</p>
                </div>
                <form action={togglePricingRuleAction}>
                  <input type="hidden" name="ruleId" value={rule.id} />
                  <input type="hidden" name="isActive" value={rule.is_active ? 'false' : 'true'} />
                  <button className="rounded border px-2 py-1 text-xs">
                    {rule.is_active ? 'Disable' : 'Enable'}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
