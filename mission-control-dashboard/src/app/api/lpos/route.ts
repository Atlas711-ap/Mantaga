import { NextResponse } from "next/server";

// Simple in-memory LPO store for demo
const lpos: Map<string, any> = new Map();

// Demo LPO data for February 2026
const demoLpos = [
  { id: '1', po_number: 'LPO-2026-001', customer: 'Talabat', order_date: '2026-02-01', delivery_date: '2026-02-03', status: 'completed', lpo_value_excl_vat: 15000, lpo_value_incl_vat: 16500 },
  { id: '2', po_number: 'LPO-2026-002', customer: 'Amazon', order_date: '2026-02-05', delivery_date: '2026-02-07', status: 'completed', lpo_value_excl_vat: 22500, lpo_value_incl_vat: 24750 },
  { id: '3', po_number: 'LPO-2026-003', customer: 'Noon', order_date: '2026-02-10', delivery_date: '2026-02-12', status: 'pending', lpo_value_excl_vat: 8500, lpo_value_incl_vat: 9350 },
  { id: '4', po_number: 'LPO-2026-004', customer: 'Careem', order_date: '2026-02-15', delivery_date: '2026-02-17', status: 'completed', lpo_value_excl_vat: 18200, lpo_value_incl_vat: 20020 },
  { id: '5', po_number: 'LPO-2026-005', customer: 'Talabat', order_date: '2026-02-20', delivery_date: '2026-02-22', status: 'in_progress', lpo_value_excl_vat: 12300, lpo_value_incl_vat: 13530 },
  // January data for comparison
  { id: '6', po_number: 'LPO-2026-006', customer: 'Amazon', order_date: '2026-01-05', delivery_date: '2026-01-07', status: 'completed', lpo_value_excl_vat: 45000, lpo_value_incl_vat: 49500 },
];

demoLpos.forEach(l => lpos.set(l.id, l));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // format: YYYY-MM
  
  const currentMonth = month || new Date().toISOString().slice(0, 7); // Default to current month
  
  // Filter LPOs by month
  const monthlyLpos = Array.from(lpos.values()).filter(l => 
    l.order_date.startsWith(currentMonth)
  );
  
  const totalExclVat = monthlyLpos.reduce((sum, l) => sum + (l.lpo_value_excl_vat || 0), 0);
  const totalInclVat = monthlyLpos.reduce((sum, l) => sum + (l.lpo_value_incl_vat || 0), 0);
  
  const byCustomer = monthlyLpos.reduce((acc, l) => {
    acc[l.customer] = (acc[l.customer] || 0) + (l.lpo_value_incl_vat || 0);
    return acc;
  }, {} as Record<string, number>);
  
  return NextResponse.json({
    month: currentMonth,
    total_lpos: monthlyLpos.length,
    total_value_excl_vat: totalExclVat,
    total_value_incl_vat: totalInclVat,
    by_customer: byCustomer,
    lpos: monthlyLpos
  });
}
