export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="skeleton mx-auto h-7 w-40 rounded-full" />
            <div className="skeleton mx-auto h-10 w-2/3 rounded" />
            <div className="skeleton mx-auto h-5 w-full max-w-xl rounded" />
            <div className="skeleton mx-auto mt-8 h-16 w-full max-w-2xl rounded-2xl" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-7 space-y-3">
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-8 w-72 max-w-full rounded" />
          <div className="skeleton h-4 w-80 max-w-full rounded" />
        </div>

        <section className="card mb-8 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-[4.6rem] rounded-xl" />
          ))}
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="card h-[360px] overflow-hidden">
              <div className="skeleton h-40 w-full" />
              <div className="space-y-3 p-6">
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
                <div className="skeleton h-16 w-full rounded" />
                <div className="skeleton h-10 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
