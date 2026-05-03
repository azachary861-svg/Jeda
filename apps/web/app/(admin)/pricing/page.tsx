import { createClient } from '@/lib/supabase/server';

export default async function PricingPage() {
  const supabase = await createClient();

  const { data: rules } = await supabase
    .from('pricing_rules')
    .select('id,name,rule_type,multiplier,start_date,end_date,priority,is_active')
    .order('priority', { ascending: false })
    .limit(200);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Dynamic Pricing Rules</h1>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(rules ?? []).map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-xs text-slate-500">{rule.rule_type} • priority {rule.priority}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">x{rule.multiplier}</p>
                <p className="text-xs text-slate-500">{rule.is_active ? 'active' : 'inactive'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
