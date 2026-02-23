"use client";

import { useState, useMemo, useEffect } from "react";
import { useLpoTable, useInsertLpoTable, useInsertLpoLineItems, useLpoLineItemsByPoNumber, useUpdateLpo, useUpdateLpoLineItem } from "../../hooks/useConvex";
import { useSession } from "next-auth/react";
import { Id } from "../../../convex/_generated/dataModel";

export const dynamic = 'force-dynamic';

interface LpoLineItem {
  _id: string;
  po_number: string;
  barcode: string;
  product_name: string;
  quantity_ordered: number;
  quantity_delivered?: number;
  unit_cost: number;
  amount_excl_vat: number;
  vat_pct: number;
  vat_amount: number;
  amount_incl_vat: number;
  amount_invoiced?: number;
  vat_amount_invoiced?: number;
  total_incl_vat_invoiced?: number;
}

export default function LpoPage() {
  const { data: session } = useSession();
  const lpos = useLpoTable();
  const updateLpo = useUpdateLpo();
  const updateLpoLineItem = useUpdateLpoLineItem();
  
  const [selectedLpoId, setSelectedLpoId] = useState<string | null>(null);
  const [selectedLpoNumber, setSelectedLpoNumber] = useState<string | null>(null);
  
  // Get line items for selected LPO
  const lineItemsData = useLpoLineItemsByPoNumber(selectedLpoNumber || "");
  const lineItems: LpoLineItem[] = lineItemsData || [];
  
  // Find the selected LPO
  const selectedLpo = lpos?.find(l => l._id === selectedLpoId);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    customer: "",
    delivery_date: "",
    status: "pending",
  });
  
  // Line items with editable delivery
  const [editLineItems, setEditLineItems] = useState<LpoLineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Load data when LPO is selected
  useEffect(() => {
    if (selectedLpo) {
      setEditForm({
        customer: selectedLpo.customer || "",
        delivery_date: selectedLpo.delivery_date || "",
        status: selectedLpo.status || "pending",
      });
    }
  }, [selectedLpo]);
  
  useEffect(() => {
    setEditLineItems(lineItems);
  }, [lineItems]);
  
  // Update line item delivery and auto-calculate amounts
  const updateEditLineItem = (index: number, field: string, value: any) => {
    const updated = [...editLineItems];
    (updated[index] as any)[field] = value;
    
    // Auto-calculate amounts when qty_delivered changes
    if (field === 'quantity_delivered') {
      const qty = parseFloat(value) || 0;
      const unitCost = updated[index].unit_cost;
      
      // amount_invoiced = qty_delivered * unit_cost (excl VAT)
      const amountExcl = qty * unitCost;
      // vat_amount_invoiced = amount_excl * 5%
      const vatAmt = amountExcl * 0.05;
      // total_incl_vat_invoiced = amount_excl + VAT
      const amountIncl = amountExcl + vatAmt;
      
      updated[index].amount_invoiced = amountExcl;
      updated[index].vat_amount_invoiced = vatAmt;
      updated[index].total_incl_vat_invoiced = amountIncl;
    }
    
    setEditLineItems(updated);
  };
  
  // Save invoice details
  const handleSaveInvoice = async () => {
    if (!selectedLpoId) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    
    try {
      console.log("Saving LPO ID:", selectedLpoId);
      console.log("Form data:", editForm);
      
      // Update LPO header
      await updateLpo({
        lpoId: selectedLpoId,
        customer: editForm.customer,
        delivery_date: editForm.delivery_date,
        status: editForm.status,
      });
      
      console.log("Header saved, updating line items...");
      
      // Update each line item
      for (const item of editLineItems) {
        if (item.quantity_delivered && item.quantity_delivered > 0) {
          console.log("Updating item:", item._id, item.quantity_delivered, item.amount_invoiced, item.vat_amount_invoiced, item.total_incl_vat_invoiced);
          await updateLpoLineItem({
            lineItemId: item._id,
            quantity_delivered: item.quantity_delivered,
            amount_invoiced: item.amount_invoiced,
            vat_amount_invoiced: item.vat_amount_invoiced,
            total_incl_vat_invoiced: item.total_incl_vat_invoiced,
          });
        }
      }
      
      console.log("All items saved!");
      setSaveSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        setSelectedLpoId(null);
        setSelectedLpoNumber(null);
        setSaveSuccess(false);
      }, 1500);
      
    } catch (error: any) {
      console.error("Failed to save:", error);
      setSaveError("Error: " + (error?.message || JSON.stringify(error) || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };
  
  // Calculate totals
  const totals = useMemo(() => {
    let orderedTotal = 0;
    let invoicedTotal = 0;
    let vatTotal = 0;
    let grandTotal = 0;
    
    for (const item of editLineItems) {
      orderedTotal += item.amount_incl_vat || 0;
      invoicedTotal += item.amount_invoiced || 0;
      vatTotal += item.vat_amount_invoiced || 0;
      grandTotal += item.total_incl_vat_invoiced || 0;
    }
    
    return { orderedTotal, invoicedTotal, vatTotal, grandTotal };
  }, [editLineItems]);
  
  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-amber-100 text-amber-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Sort LPOs by date
  const sortedLpos = useMemo(() => {
    if (!lpos) return [];
    return [...lpos].sort((a, b) => 
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  }, [lpos]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LPO Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400">Click an LPO to add invoice details</p>
        </div>
      </div>
      
      {/* LPO List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">PO Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">PO Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Value (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedLpos.map((lpo) => (
              <tr 
                key={lpo._id} 
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                onClick={() => { setSelectedLpoId(lpo._id); setSelectedLpoNumber(lpo.po_number); }}
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lpo.po_number}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.order_date ? new Date(lpo.order_date).toLocaleDateString('en-GB') : '-'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.delivery_date ? new Date(lpo.delivery_date).toLocaleDateString('en-GB') : '-'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.customer || <span className="text-amber-500 italic">Click to add</span>}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.supplier}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lpo.status)}`}>
                    {lpo.status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                  {lpo.total_incl_vat?.toLocaleString() || '0'}
                </td>
              </tr>
            ))}
            {sortedLpos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No LPOs yet. Upload an Excel file to add LPOs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Edit Modal */}
      {selectedLpoId && selectedLpo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">LPO: {selectedLpo.po_number}</h2>
                  <p className="text-gray-500 text-sm">Fill in details and click Save</p>
                </div>
                <button
                  onClick={() => { setSelectedLpoId(null); setSelectedLpoNumber(null); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Editable Header Fields */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                  <input
                    type="text"
                    value={editForm.customer}
                    onChange={(e) => setEditForm({...editForm, customer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={editForm.delivery_date}
                    onChange={(e) => setEditForm({...editForm, delivery_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="delivered">Delivered</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={selectedLpo.supplier || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Line Items Table - Fixed Height Scrollable */}
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 w-32">Barcode</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500">Product</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 w-20">Ordered</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 w-24">Unit Cost</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 w-28">Ordered Amt</th>
                    <th className="px-3 py-2 text-right font-medium text-blue-600 w-24">Qty Delivered</th>
                    <th className="px-3 py-2 text-right font-medium text-blue-600 w-28">Invoiced Amt</th>
                    <th className="px-3 py-2 text-right font-medium text-blue-600 w-24">VAT 5%</th>
                    <th className="px-3 py-2 text-right font-medium text-blue-600 w-28">Total + VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {editLineItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-3 py-2 text-gray-900 dark:text-white font-mono text-xs">{item.barcode}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white max-w-xs truncate">{item.product_name}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{item.quantity_ordered}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">AED {item.unit_cost.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">AED {(item.amount_incl_vat || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max={item.quantity_ordered}
                          value={item.quantity_delivered || ''}
                          onChange={(e) => {
                            const idx = editLineItems.findIndex(i => i._id === item._id);
                            if (idx >= 0) updateEditLineItem(idx, 'quantity_delivered', e.target.value);
                          }}
                          className="w-20 px-2 py-1 border border-blue-300 dark:border-blue-600 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-right font-medium"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          AED {(item.amount_invoiced || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          AED {(item.vat_amount_invoiced || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-blue-700 dark:text-blue-300 font-bold">
                          AED {(item.total_incl_vat_invoiced || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {editLineItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                        Loading line items...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              {/* Totals Row */}
              <div className="flex justify-end gap-8 mb-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Ordered Total</p>
                  <p className="text-lg font-bold">AED {totals.orderedTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">Invoiced Amt</p>
                  <p className="text-lg font-bold text-blue-600">AED {totals.invoicedTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600">VAT 5%</p>
                  <p className="text-lg font-bold text-blue-600">AED {totals.vatTotal.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-700">Total + VAT</p>
                  <p className="text-xl font-bold text-blue-700">AED {totals.grandTotal.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Error/Success Messages */}
              {saveError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="mb-3 p-2 bg-green-50 text-green-600 rounded-lg text-sm">
                  ✓ Saved successfully!
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Tip: Enter qty delivered → All amounts auto-calculate
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedLpoId(null); setSelectedLpoNumber(null); }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveInvoice}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Invoice Details'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
