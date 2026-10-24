export default function PageHeader({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="min-w-0 truncate text-3xl font-light">{title}</h1>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}
