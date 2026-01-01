"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const MatchesPage = () => {
  const router = useRouter();
  
  // ✅ FIX: This page should not exist - redirect to home or show error
  // If you need a matches listing page, create it at /matches/list or similar
  // This was using a dummy slug "finland-poland" which caused errors
  
  return (
    <div className="bg-slate-100 min-h-screen p-4">
      <Card className="w-full border-gray-200 max-w-3xl mx-auto mt-8">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-medium text-xl mb-2">No Match Selected</p>
            <p className="text-gray-500 mb-6">
              Please select a match from the home page or use a valid match URL.
            </p>
            <Button onClick={() => router.push('/')} variant="default" size="lg">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchesPage;
