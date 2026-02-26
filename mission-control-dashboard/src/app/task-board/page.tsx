'use client';

// Simple placeholder - will be implemented properly after debugging
import Link from "next/link";

export default function TaskBoardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📋 Task Board</h1>
        <p className="text-slate-400">Task management coming soon</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold mb-2">Under Maintenance</h2>
        <p className="text-slate-400 mb-6">
          The task board is being upgraded to connect to live data.
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Link 
            href="/lpo" 
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium"
          >
            📄 LPO Data
          </Link>
          <Link 
            href="/sku-list" 
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium"
          >
            📋 SKU List
          </Link>
        </div>
      </div>
    </div>
  );
}
