import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LeagueCardsSkeleton = ({ title = "Football Daily" }) => {
  return (
    <div className="mb-8">
      {/* Title skeleton */}
      {title && (
        <Skeleton className="h-6 w-32 mb-4" />
      )}

      {/* Horizontal scroll container */}
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-96">
            <div className="bg-gray-50 mb-4 h-[495px] flex flex-col rounded-lg">
              {/* League Header skeleton */}
              <div className="border-b border-gray-200 p-4 flex-shrink-0 bg-gray-100">
                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-24" />
                </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>

              {/* Odds Header skeleton */}
              <div className="flex items-center px-4 py-2 border-b border-gray-200 flex-shrink-0 bg-gray-100">
                <div className="flex-1">
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="w-14 h-3" />
                  <Skeleton className="w-14 h-3" />
                  <Skeleton className="w-14 h-3" />
                </div>
              </div>

              {/* Matches skeleton */}
              <div className="p-4 py-0 flex-1 overflow-y-auto">
                {Array.from({ length: 4 }).map((_, matchIndex) => (
                  <div key={matchIndex} className="mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    
                    {/* Team names skeleton */}
                    <div className="space-y-1 mb-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>

                    {/* Odds buttons skeleton */}
                    <div className="flex gap-1">
                      <Skeleton className="w-14 h-8" />
                      <Skeleton className="w-14 h-8" />
                      <Skeleton className="w-14 h-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueCardsSkeleton; 