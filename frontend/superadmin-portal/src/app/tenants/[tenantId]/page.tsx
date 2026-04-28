interface Props {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantDetailPage({ params }: Props) {
  const { tenantId } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Tenant Detail</h1>
      <p className="mt-2 text-gray-600">Tenant ID: {tenantId}</p>
    </main>
  );
}
