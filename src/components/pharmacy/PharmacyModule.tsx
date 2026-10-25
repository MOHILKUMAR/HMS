import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { InventoryItem } from '../../types';
import { Pill, AlertTriangle, Clock, Plus, CheckCircle2, ShoppingBag, X } from 'lucide-react';

export const PharmacyModule: React.FC = () => {
  const { refreshData, showToast, patients, currentUser } = useApp();

  const [inventory, setInventory] = useState<InventoryItem[]>(StorageService.getInventory());
  const [searchTerm, setSearchTerm] = useState('');

  // Dispense modal
  const [dispenseMed, setDispenseMed] = useState<InventoryItem | null>(null);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispenseUhid, setDispenseUhid] = useState('SH-2026-00101');

  // Receive Stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newCategory, setNewCategory] = useState<'tablet' | 'syrup' | 'injection' | 'consumable' | 'surgical_supply'>('tablet');
  const [newBatchNo, setNewBatchNo] = useState('');
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
  const [newStockQty, setNewStockQty] = useState(50);
  const [newMrp, setNewMrp] = useState(120);
  const [newSupplier, setNewSupplier] = useState('MedPlus Pharma Distributors');

  const handleOpenDispense = (med: InventoryItem) => {
    setDispenseMed(med);
    if (med.batches.length > 0) {
      setSelectedBatch(med.batches[0].batchNumber);
    }
    setDispenseQty(1);
  };

  const handleDispenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispenseMed || !selectedBatch) return;

    try {
      StorageService.dispenseMedicine(
        dispenseMed.id,
        selectedBatch,
        Number(dispenseQty),
        dispenseUhid,
        currentUser.name
      );

      setInventory(StorageService.getInventory());
      refreshData();
      showToast(`Dispensed ${dispenseQty} units of ${dispenseMed.name} from Batch ${selectedBatch}!`, 'success');
      setDispenseMed(null);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleReceiveStock = (e: React.FormEvent) => {
    e.preventDefault();
    const list = StorageService.getInventory();
    
    // Check if item exists or create new
    const existingIdx = list.findIndex(m => m.name.toLowerCase() === newMedName.toLowerCase());

    const newBatch = {
      batchNumber: newBatchNo || `BAT-${Date.now().toString().slice(-5)}`,
      expiryDate: newExpiry,
      currentStock: Number(newStockQty),
      mrp: Number(newMrp),
      purchaseRate: Number(newMrp) * 0.7,
      supplier: newSupplier
    };

    if (existingIdx >= 0) {
      list[existingIdx].batches.push(newBatch);
      list[existingIdx].totalStock += Number(newStockQty);
    } else {
      list.unshift({
        id: `MED-${Date.now()}`,
        name: newMedName,
        genericName: newMedName,
        category: newCategory,
        unit: 'Pack / Unit',
        totalStock: Number(newStockQty),
        reorderLevel: 25,
        batches: [newBatch]
      });
    }

    localStorage.setItem('swastik_inventory_v1', JSON.stringify(list));
    StorageService.logAudit(currentUser.name, 'STOCK_RECEIVE', 'Pharmacy', newBatch.batchNumber, `Received ${newStockQty} units of ${newMedName} from ${newSupplier}`);
    
    setInventory(StorageService.getInventory());
    refreshData();
    setShowStockModal(false);
    showToast(`Received ${newStockQty} units of ${newMedName} into pharmacy inventory!`, 'success');

    // Reset
    setNewMedName('');
    setNewBatchNo('');
  };

  const filteredInventory = inventory.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-amber-600" />
            <span>Pharmacy & Medical Consumables Inventory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Batch-level traceability • Expiry warnings • Prescription-linked dispensing • Stock decrements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search medicine / generic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 w-48"
          />

          <button
            onClick={() => setShowStockModal(true)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Receive Inward Stock</span>
          </button>
        </div>
      </div>

      {/* Stock Cards Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-900">Hospital Pharmacy Stock Catalog ({filteredInventory.length})</h3>
          <span className="text-xs text-slate-500">Live Batch & Lot Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Medicine / Supply Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Available Batches (Lot & Expiry)</th>
                <th className="p-3 text-center">Total Stock</th>
                <th className="p-3">Reorder Alert</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map(item => {
                const isLowStock = item.totalStock <= item.reorderLevel;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-500 italic">{item.genericName}</p>
                    </td>
                    <td className="p-3 uppercase text-[10px] font-semibold text-slate-600">
                      {item.category.replace('_', ' ')}
                    </td>
                    <td className="p-3 space-y-1">
                      {item.batches.map(b => {
                        const isExpiringSoon = new Date(b.expiryDate).getTime() - new Date().getTime() < 45 * 24 * 60 * 60 * 1000;
                        return (
                          <div key={b.batchNumber} className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono font-semibold text-slate-800">{b.batchNumber}</span>
                            <span className="text-slate-500">({b.currentStock} units)</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isExpiringSoon ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-slate-400'
                            }`}>
                              Exp: {b.expiryDate}
                            </span>
                            <span className="text-slate-700 font-bold">MRP ₹{b.mrp}</span>
                          </div>
                        );
                      })}
                    </td>
                    <td className="p-3 text-center font-bold text-sm">
                      <span className={isLowStock ? 'text-rose-700' : 'text-slate-900'}>
                        {item.totalStock} {item.unit}
                      </span>
                    </td>
                    <td className="p-3">
                      {isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Low Stock (&lt;={item.reorderLevel})
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold text-[11px]">Optimal</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenDispense(item)}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Dispense
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispense Medicine Modal */}
      {dispenseMed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Dispense Medicine</h3>
                <p className="text-xs text-slate-500">{dispenseMed.name}</p>
              </div>
              <button onClick={() => setDispenseMed(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleDispenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient UHID</label>
                <select
                  value={dispenseUhid}
                  onChange={e => setDispenseUhid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {patients.map(p => (
                    <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Batch / Lot *</label>
                <select
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-teal-800"
                >
                  {dispenseMed.batches.map(b => (
                    <option key={b.batchNumber} value={b.batchNumber}>
                      {b.batchNumber} (Stock: {b.currentStock}) - Exp: {b.expiryDate} - MRP ₹{b.mrp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity to Dispense *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={dispenseQty}
                  onChange={e => setDispenseQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-teal-900 text-[11px]">
                Dispensing will atomically decrement the selected batch inventory and record a pharmacy charge for UHID <b>{dispenseUhid}</b>.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setDispenseMed(null)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">
                  Confirm Dispense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Inward Purchase / Batch Intake</h3>
              <button onClick={() => setShowStockModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleReceiveStock} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medicine / Item Name *</label>
                  <input type="text" required value={newMedName} onChange={e => setNewMedName(e.target.value)} placeholder="e.g. Pantoprazole 40mg Tab" className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className="w-full px-3 py-2 rounded-xl border border-slate-300">
                    <option value="tablet">Tablet / Capsule</option>
                    <option value="syrup">Syrup / Suspension</option>
                    <option value="injection">Injection / Vial</option>
                    <option value="consumable">Consumable (Syringe, Cannula)</option>
                    <option value="surgical_supply">Surgical Supply</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch / Lot Number *</label>
                  <input type="text" required value={newBatchNo} onChange={e => setNewBatchNo(e.target.value)} placeholder="e.g. PAN-881B" className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input type="date" required value={newExpiry} onChange={e => setNewExpiry(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Received Quantity (Units) *</label>
                  <input type="number" required min={1} value={newStockQty} onChange={e => setNewStockQty(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit MRP (₹) *</label>
                  <input type="number" required min={1} value={newMrp} onChange={e => setNewMrp(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Distributor / Supplier Name</label>
                <input type="text" value={newSupplier} onChange={e => setNewSupplier(e.target.value)} placeholder="e.g. MedPlus Logistics" className="w-full px-3 py-2 rounded-xl border border-slate-300" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowStockModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl">Save Inward Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
