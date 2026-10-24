const Bar = ({ className }: { className: string }) => <div className={`skeleton ${className}`} />;

export function HabitCardSkeleton() {
  return (
    <div className="glass space-y-3 p-4">
      <div className="flex items-center gap-3">
        <Bar className="size-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Bar className="h-3.5 w-32" />
          <Bar className="h-2.5 w-20" />
        </div>
        <Bar className="size-10 rounded-xl" />
      </div>
      <Bar className="h-[86px] w-full" />
    </div>
  );
}

export function HabitsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Bar className="h-8 w-36" />
        <Bar className="h-9 w-40 rounded-full" />
      </div>
      <HabitCardSkeleton />
      <HabitCardSkeleton />
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Bar className="h-8 w-36" />
        <Bar className="size-10 rounded-full" />
      </div>
      <div className="glass divide-y divide-white/5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Bar className="h-3.5 w-1/2" />
              <Bar className="h-2.5 w-1/3" />
            </div>
            <Bar className="h-2.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PostersSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Bar className="h-8 w-40" />
        <Bar className="size-10 rounded-full" />
      </div>
      <Bar className="h-9 w-56 rounded-full" />
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <Bar className="aspect-[2/3] w-full rounded-xl" />
            <Bar className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
