type TeamMemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeamMemberDetailPage({ params }: TeamMemberDetailPageProps) {
  const { id } = await params;

  return (
    <main className="space-y-3">
      <h1 className="text-2xl font-semibold">Team Member Detail</h1>
      <p className="text-sm text-slate-500">Member ID: {id}</p>
      <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">
        Detail profil tim (driver/guide/photographer) dapat diperluas dengan histori trip, rating, dan status verifikasi.
      </div>
    </main>
  );
}
