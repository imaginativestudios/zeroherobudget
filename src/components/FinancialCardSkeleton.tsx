import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FinancialCardSkeleton = () => {
  return (
    <Card className="h-full flex flex-col shadow-elegant">
      <CardHeader className="pb-2 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between p-4 sm:p-5 pt-0">
        {/* Amount skeleton */}
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 mb-2" />
        
        {/* Trend section skeleton */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-28 sm:w-36" />
        </div>
        
        {/* Insight skeleton */}
        <div className="mt-3 p-2 bg-muted/50 rounded-md">
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        
        {/* Link skeleton */}
        <Skeleton className="h-3 w-36 mt-auto pt-3" />
      </CardContent>
    </Card>
  );
};
