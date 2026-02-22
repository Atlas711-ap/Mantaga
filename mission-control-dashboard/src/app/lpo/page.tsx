"use client";

import { useState, useMemo } from "react";
import { useLpoTable, useInsertLpoTable, useInsertLpoLineItems, useLpoLineItemsByPoNumber, useUpdateLpoLineItemDelivery } from "../../hooks/useConvex";
import { useSession } from "next-auth/react";

export const dynamic = 'force-dynamic';

interface LpoLineItem {
  barcode: string;
  product_name: string;
  quantity_ordered: number;
  quantity_delivered?: number;
  unit_cost: number;
  amount_excl_vat: number;
  vat_pct: number;
  vat_amount: number;
  amount_incl_vat: number;
}

export default function LpoPage() {
  const { data: session } = useSession();
  const lpos = useLpoTable();
  const insertLpo = useInsertLpoTable();
  const insertLineItems = useInsertLpoLineItems();
  const updateDelivery = useUpdateLpoLineItemDelivery();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLpo, setSelectedLpo] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    po_number: "",
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    supplier: "",
    delivery_location: "",
    customer: "Talabat",
    brand: "",
    client: "",
    total_excl_vat: 0,
    total_vat: 0,
    total_incl_vat: 0,
  });
  
  const [lineItems, setLineItems] = useState<LpoLineItem[]>([]);
  
  // Add empty line item row
  const addLineItem = () => {
    setLineItems([...lineItems, {
      barcode: "",
      product_name: "",
      quantity_ordered: 0,
      quantity_delivered: 0,
      unit_cost: 0,
      amount_excl_vat: 0,
      vat_pct: 5,
      vat_amount: 0,
      amount_incl_vat: 0,
    }]);
  };
  
  // Update line item
  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    
    // Auto-calculate amounts
    if (field === 'quantity_ordered' || field === 'unit_cost' || field === 'vat_pct') {
      const qty = field === 'quantity_ordered' ? value : updated[index].quantity_ordered;
      const cost = field === 'unit_cost' ? value : updated[index].unit_cost;
      const vatPct = field === 'vat_pct' ? value : updated[index].vat_pct;
      
      const amountExcl = qty * cost;
      const vatAmount = amountExcl * (vatPct / 100);
      const amountIncl = amountExcl + vatAmount;
      
      updated[index].amount_excl_vat = amountExcl;
      updated[index].vat_amount = vatAmount;
      updated[index].amount_incl_vat = amountIncl;
    }
    
    setLineItems(updated);
  };
  
  // Remove line item
  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const totalExcl = lineItems.reduce((sum, item) => sum + item.amount_excl_vat, 0);
    const totalVat = lineItems.reduce((sum, item) => sum + item.vat_amount, 0);
    const totalIncl = lineItems.reduce((sum, item) => sum + item.amount_incl_vat, 0);
    
    setFormData({
      ...formData,
      total_excl_vat: totalExcl,
      total_vat: totalVat,
      total_incl_vat: totalIncl,
    });
  };
  
  // Create LPO
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      // Calculate totals first
      calculateTotals();
      
      // Insert LPO header
      const totals = {
        total_excl_vat: lineItems.reduce((sum, item) => sum + item.amount_excl_vat, 0),
        total_vat: lineItems.reduce((sum, item) => sum + item.vat_amount, 0),
        total_incl_vat: lineItems.reduce((sum, item) => sum + item.amount_incl_vat, 0),
      };
      
      const lpoId = await insertLpo({
        ...formData,
        ...totals,
        status: "pending",
      });
      
      // Insert line items
      for (const item of lineItems) {
        await insertLineItems({
          po_number: formData.po_number,
          ...item,
        });
      }
      
      // Reset form
      setFormData({
        po_number: "",
        order_date: new Date().toISOString().split('T')[0],
        delivery_date: "",
        supplier: "",
        delivery_location: "",
        customer: "Talabat",
        brand: "",
        client: "",
        total_excl_vat: 0,
        total_vat: 0,
        total_incl_vat: 0,
      });
      setLineItems([]);
      setShowCreateForm(false);
      
    } catch (error) {
      console.error("Failed to create LPO:", error);
      alert("Failed to create LPO");
    } finally {
      setCreating(false);
    }
  };
  
  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter & sort LPOs
  const sortedLpos = useMemo(() => {
    if (!lpos) return [];
    return [...lpos].sort((a, b) => 
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );
  }, [lpos]);
  
  // Stats
  const stats = useMemo(() => {
    if (!lpos) return { total: 0, pending: 0, partial: 0, complete: 0, totalValue: 0 };
    
    return {
      total: lpos.length,
      pending: lpos.filter(l => l.status === 'pending').length,
      partial: lpos.filter(l => l.status === 'partial').length,
      complete: lpos.filter(l => l.status === 'complete').length,
      totalValue: lpos.reduce((sum, l) => sum + (l.total_incl_vat || 0), 0),
    };
  }, [lpos]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LPO Tracking</h1>
          <p className="text-gray-500 dark:text-gray-400">Local Purchase Orders</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <span>+</span> New LPO
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Total LPOs</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Partial</p>
          <p className="text-2xl font-bold text-amber-600">{stats.partial}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Complete</p>
          <p className="text-2xl font-bold text-green-600">{stats.complete}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold">AED {stats.totalValue.toLocaleString()}</p>
        </div>
      </div>
      
      {/* LPO List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">PO Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Value (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedLpos.map((lpo) => (
              <tr key={lpo._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => setSelectedLpo(lpo.po_number)}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lpo.po_number}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(lpo.order_date).toLocaleDateString('en-GB')}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.customer}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.supplier}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lpo.delivery_date ? new Date(lpo.delivery_date).toLocaleDateString('en-GB') : '-'}</td>
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
                  No LPOs yet. Click "New LPO" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Create LPO Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Create New LPO</h2>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PO Number *</label>
                  <input
                    type="text"
                    value={formData.po_number}
                    onChange={(e) => setFormData({...formData, po_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="LPO-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Date *</label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="Talabat">Talabat</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Noon">Noon</option>
                    <option value="Careem">Careem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier *</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                    placeholder="Supplier Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Location</label>
                  <input
                    type="text"
                    value={formData.delivery_location}
                    onChange={(e) => setFormData({...formData, delivery_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Warehouse Location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brand Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Client Name"
                  />
                </div>
              </div>
              
              {/* Line Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-2 py-2 text-left">Barcode</th>
                        <th className="px-2 py-2 text-left">Product</th>
                        <th className="px-2 py-2 text-right">Qty</th>
                        <th className="px-2 py-2 text-right">Unit Cost</th>
                        <th className="px-2 py-2 text-right">VAT %</th>
                        <th className="px-2 py-2 text-right">Amount</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {lineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.barcode}
                              onChange={(e) => updateLineItem(index, 'barcode', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="SKU001"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.product_name}
                              onChange={(e) => updateLineItem(index, 'product_name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="Product Name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.quantity_ordered}
                              onChange={(e) => updateLineItem(index, 'quantity_ordered', parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.unit_cost}
                              onChange={(e) => updateLineItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-right"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.vat_pct}
                              onChange={(e) => updateLineItem(index, 'vat_pct', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            {item.amount_incl_vat.toFixed(2)}
                          </td>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => removeLineItem(index)}
                              className="text-red-500 hover:text-red-600"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                      {lineItems.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                            No items added yet. Click "Add Item" to add line items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-medium">AED {lineItems.reduce((s, i) => s + i.amount_excl_vat, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">VAT (5%):</span>
                    <span className="font-medium">AED {lineItems.reduce((s, i) => s + i.vat_amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>AED {lineItems.reduce((s, i) => s + i.amount_incl_vat, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setLineItems([]); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || lineItems.length === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create LPO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
