import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-white/10 via-white/20 to-white/10 bg-[length:200%_100%]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Composants skeleton spécialisés
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-6", className)}>
      <Skeleton className="h-6 w-1/2" />
      <SkeletonText lines={3} />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function SkeletonImage({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("aspect-video w-full", className)} />
  );
}
