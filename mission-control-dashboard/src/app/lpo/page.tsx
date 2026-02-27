"use client";

import { useState, useMemo, useEffect } from "react";
import { useLpoTable, useInsertLpoTable, useInsertLpoLineItems, useLpoLineItemsByPoNumber, useUpdateLpo, useUpdateLpoLineItem, useLpoLineItemsTable } from "../../hooks/useConvex";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
  const allLineItems = useLpoLineItemsTable();
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
    commission_pct: 0,
    invoice_number: "",
    invoice_date: "",
  });
  
  // Line items with editable delivery
  const [editLineItems, setEditLineItems] = useState<LpoLineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  
  // Mutation for syncing brand performance
  const syncBrandPerformance = useMutation(api.mutations.syncBrandPerformance);
  
  // Load data when LPO is selected
  useEffect(() => {
    if (selectedLpo) {
      setEditForm({
        customer: selectedLpo.customer || "",
        delivery_date: selectedLpo.delivery_date || "",
        status: selectedLpo.status || "pending",
        commission_pct: selectedLpo.commission_pct || 0,
        invoice_number: (selectedLpo as any).invoice_number || "",
        invoice_date: (selectedLpo as any).invoice_date || "",
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
      // Calculate totals for commission
      const grandTotal = totals.grandTotal;
      const commissionPct = editForm.commission_pct || 0;
      const commissionAmount = grandTotal * (commissionPct / 100);
      
      console.log("Saving LPO ID:", selectedLpoId);
      console.log("Form data:", editForm);
      console.log("Commission:", commissionPct, "% =", commissionAmount);
      
      // Validate required invoice fields
      if (!editForm.invoice_number || !editForm.invoice_date) {
        setSaveError("Invoice Number and Invoice Date are required");
        setSaving(false);
        return;
      }
      
      // Update LPO header with commission and invoice details
      await updateLpo({
        lpoId: selectedLpoId,
        customer: editForm.customer,
        delivery_date: editForm.delivery_date,
        status: editForm.status,
        commission_pct: Number(commissionPct),
        commission_amount: Number(commissionAmount),
        invoice_number: editForm.invoice_number,
        invoice_date: editForm.invoice_date,
      });
      
      console.log("Header saved, updating line items...");
      
      // Update each line item - include ALL items (even 0 qty delivered)
      const lineItemsToSync = [];
      for (const item of editLineItems) {
        // Update line item in database
        console.log("Updating item:", item._id, item.quantity_delivered, item.amount_invoiced, item.vat_amount_invoiced, item.total_incl_vat_invoiced);
        await updateLpoLineItem({
          lineItemId: item._id,
          quantity_delivered: Number(item.quantity_delivered) || 0,
          amount_invoiced: Number(item.amount_invoiced) || 0,
          vat_amount_invoiced: Number(item.vat_amount_invoiced) || 0,
          total_incl_vat_invoiced: Number(item.total_incl_vat_invoiced) || 0,
          invoice_number: editForm.invoice_number || "",
          invoice_date: editForm.invoice_date || "",
        });
        
        // Collect ALL for brand performance sync (including 0 qty delivered)
        lineItemsToSync.push({
          barcode: item.barcode,
          product_name: item.product_name,
          quantity_ordered: item.quantity_ordered,
          quantity_delivered: Number(item.quantity_delivered) || 0,
          unit_cost: item.unit_cost,
          amount_incl_vat: item.amount_incl_vat,
          amount_invoiced: item.amount_invoiced || 0,
          vat_amount_invoiced: item.vat_amount_invoiced || 0,
          total_incl_vat_invoiced: item.total_incl_vat_invoiced || 0,
        });
      }
      
      // Sync to Brand Performance (only if user clicks sync button)
      if (showSyncConfirm && editForm.invoice_number && editForm.invoice_date && lineItemsToSync.length > 0) {
        console.log("Syncing to Brand Performance...");
        await syncBrandPerformance({
          po_number: selectedLpoNumber || "",
          invoice_number: editForm.invoice_number,
          invoice_date: editForm.invoice_date,
          lineItems: lineItemsToSync,
        });
        console.log("Brand Performance synced!");
      }
      
      console.log("All items saved!");
      setSaveSuccess(true);
      setShowSyncConfirm(false);
      
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
  
  // Calculate commission amount
  const commissionAmount = totals.grandTotal * (editForm.commission_pct / 100);
  
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

  // Calculate totals per LPO from line items
  const lpoTotals = useMemo(() => {
    const totals: Record<string, { invoicedAmt: number; commissionAmt: number }> = {};
    if (!allLineItems || !lpos) return totals;
    
    for (const lpo of lpos) {
      const items = allLineItems.filter((item: LpoLineItem) => item.po_number === lpo.po_number);
      const invoicedAmt = items.reduce((sum, item) => sum + (item.total_incl_vat_invoiced || 0), 0);
      const commissionAmt = invoicedAmt * ((lpo.commission_pct || 0) / 100);
      totals[lpo.po_number] = { invoicedAmt, commissionAmt };
    }
    return totals;
  }, [allLineItems, lpos]);

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
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">PO Number</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">PO Date</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-3 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">LPO Amount</th>
              <th className="px-3 py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">Invoiced Amt</th>
              <th className="px-3 py-3 text-right text-sm font-medium text-amber-600 dark:text-amber-400">Service Level %</th>
              <th className="px-3 py-3 text-right text-sm font-medium text-purple-600 dark:text-purple-400">Comm %</th>
              <th className="px-3 py-3 text-right text-sm font-medium text-purple-600 dark:text-purple-400">Comm Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedLpos.map((lpo) => {
              const totals = lpoTotals[lpo.po_number] || { invoicedAmt: 0, commissionAmt: 0 };
              
              return (
              <tr 
                key={lpo._id} 
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                onClick={() => { setSelectedLpoId(lpo._id); setSelectedLpoNumber(lpo.po_number); }}
              >
                <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{lpo.po_number}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{lpo.order_date ? new Date(lpo.order_date).toLocaleDateString('en-GB') : '-'}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{lpo.delivery_date ? new Date(lpo.delivery_date).toLocaleDateString('en-GB') : '-'}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{lpo.customer || <span className="text-amber-500 italic">Click to add</span>}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{lpo.supplier}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lpo.status)}`}>
                    {lpo.status || 'pending'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right text-gray-900 dark:text-white font-medium">
                  {lpo.total_incl_vat?.toLocaleString() || '0'}
                </td>
                <td className="px-3 py-3 text-right text-green-600 dark:text-green-400 font-medium">
                  {totals.invoicedAmt > 0 ? totals.invoicedAmt.toLocaleString() : '-'}
                </td>
                <td className="px-3 py-3 text-right">
                  {totals.invoicedAmt > 0 && lpo.total_incl_vat ? (
                    <span className={`font-medium ${
                      (totals.invoicedAmt / lpo.total_incl_vat) >= 1 
                        ? 'text-green-600 dark:text-green-400' 
                        : (totals.invoicedAmt / lpo.total_incl_vat) >= 0.8
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}>
                      {((totals.invoicedAmt / lpo.total_incl_vat) * 100).toFixed(1)}%
                    </span>
                  ) : '-'}
                </td>
                <td className="px-3 py-3 text-right text-purple-600 dark:text-purple-400">
                  {lpo.commission_pct ? `${lpo.commission_pct}%` : '-'}
                </td>
                <td className="px-3 py-3 text-right text-purple-600 dark:text-purple-400 font-medium">
                  {totals.commissionAmt > 0 ? totals.commissionAmt.toLocaleString() : '-'}
                </td>
              </tr>
              );
            })}
            {sortedLpos.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-gray-500">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                  <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Commission %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editForm.commission_pct || ''}
                    onChange={(e) => setEditForm({...editForm, commission_pct: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    value={editForm.invoice_number}
                    onChange={(e) => setEditForm({...editForm, invoice_number: e.target.value})}
                    className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    placeholder="INV-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    value={editForm.invoice_date}
                    onChange={(e) => setEditForm({...editForm, invoice_date: e.target.value})}
                    className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Commission Amount</label>
                  <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-purple-700 dark:text-purple-300 font-medium">
                    AED {commissionAmount.toFixed(2)}
                  </div>
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
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSyncConfirm}
                      onChange={(e) => setShowSyncConfirm(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span>Sync to Brand Performance</span>
                  </label>
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
