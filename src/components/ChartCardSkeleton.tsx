import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartCardSkeleton = () => {
  return (
    <Card className="shadow-royal overflow-hidden h-full">
      <CardHeader className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40 sm:w-48" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0">
        <div className="h-[350px] sm:h-[400px] flex flex-col items-center justify-center gap-4">
          {/* Chart area skeleton */}
          <Skeleton className="h-48 w-48 rounded-full" />
          
          {/* Legend skeleton */}
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        
        {/* Insight skeleton */}
        <div className="mt-4">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
};
