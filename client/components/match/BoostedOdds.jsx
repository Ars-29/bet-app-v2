'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const BoostedOdds = () => {
    return (<div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Boosted Odds</h3>

        <Card className="bg-white">
            <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                        <span className="text-xs sm:text-sm text-gray-600">Both teams to score & over 3.5 goals in the match</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <span className="text-yellow-500 text-base sm:text-lg">⭐</span>
                        <div className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded font-bold text-sm sm:text-base">
                            5.00
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
    );
};

export default BoostedOdds;
