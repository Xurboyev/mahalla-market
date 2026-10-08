type Listing = { id: string; title: string; price: number | null; isFree: boolean };

async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${process.env.API_URL ?? 'http://localhost:4000'}/api/listings`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()).items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const items = await getListings();
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1 style={{ color: '#e8590c' }}>MahallaMarket</h1>
      <p>Mahallangizdagi e'lonlar</p>
      {items.length === 0 ? (
        <p>Hozircha e'lonlar yo'q.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {items.map((l) => (
            <li key={l.id} style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
              <strong>{l.title}</strong>
              <div>{l.isFree ? 'Tekin' : l.price != null ? `${l.price.toLocaleString('ru-RU')} so'm` : 'Kelishiladi'}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
