// DEPRECATED: This debug component is no longer needed
// The new unified API service has better error handling and debug output

import React from 'react';

export const ApiDebugEnhanced: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Debug Component Deprecated</h1>
        <p className="text-muted-foreground">
          This debug component has been replaced by the new unified API service.
          Check the browser console for detailed API debug information when VITE_DEBUG=true.
        </p>
      </div>
    </div>
  );
};