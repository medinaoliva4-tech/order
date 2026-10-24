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
    <div className="space-y-4">
      <Bar className="h-8 w-40" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass space-y-3 p-5">
            <Bar className="h-4 w-2/3" />
            <Bar className="h-2.5 w-1/3" />
            <Bar className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Bar className="h-3 w-20" />
      <Bar className="h-8 w-52" />
      {[0, 1].map((i) => (
        <div key={i} className="glass space-y-3 p-5">
          <Bar className="h-4 w-28" />
          {[0, 1, 2].map((j) => <Bar key={j} className="h-3 w-full" />)}
        </div>
      ))}
    </div>
  );
}
