type DestinationDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DestinationDetailPage({ params }: DestinationDetailPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Destinasi: {slug.replace(/-/g, ' ')}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Halaman destinasi tersedia untuk SEO marketplace dan pengelompokan paket per wilayah.
      </p>
      <div className="mt-4 rounded-lg border bg-white p-4 text-sm text-slate-600">
        Konten detail destinasi dapat dihubungkan ke data CMS/internal admin.
      </div>
    </main>
  );
}
