import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FootballDailySkeleton = () => {
  return (
    <div className="mb-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* League groups skeleton */}
      {Array.from({ length: 3 }).map((_, leagueIndex) => (
        <div key={leagueIndex} className="mb-6">
                      {/* League header skeleton */}
            <div className="flex items-center mb-3">
              <Skeleton className="h-6 w-6 mr-2" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16 ml-2" />
            </div>

            {/* Match cards grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, matchIndex) => (
                <div key={matchIndex} className="bg-gray-50 p-4 space-y-4 rounded-lg">
                  {/* League info skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-20" />
                  </div>

                  {/* Teams skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>

                  {/* Time skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* Odds skeleton */}
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
        </div>
      ))}
    </div>
  );
};

export default FootballDailySkeleton; 