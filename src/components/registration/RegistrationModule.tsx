import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Patient } from '../../types';
import { 
  UserPlus, Search, AlertCircle, QrCode, Printer, 
  CheckCircle2, ShieldAlert, ArrowRight, UserCheck, Stethoscope, BedDouble
} from 'lucide-react';

export const RegistrationModule: React.FC = () => {
  const { t, patients, refreshData, showToast, openPrintDoc, setActiveModule } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Patient Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Duplicate candidates
  const [duplicateMatches, setDuplicateMatches] = useState<Patient[]>([]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobile(val);
    if (val.length >= 4) {
      const duplicates = StorageService.checkDuplicatePatients(val, name);
      setDuplicateMatches(duplicates);
    } else {
      setDuplicateMatches([]);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (val.length >= 3) {
      const duplicates = StorageService.checkDuplicatePatients(mobile, val);
      setDuplicateMatches(duplicates);
    } else {
      setDuplicateMatches([]);
    }
  };

  const handleSubmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      showToast('Patient name and contact mobile are required.', 'error');
      return;
    }

    const saved = StorageService.savePatient({
      name: name.trim(),
      age: Number(age),
      gender,
      mobile: mobile.trim(),
      address: address.trim(),
      bloodGroup,
      emergencyContact: {
        name: emergencyName || 'Relative',
        relationship: emergencyRelation || 'Family',
        phone: emergencyPhone || mobile
      },
      allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
      history: medicalHistory ? medicalHistory.split(',').map(s => s.trim()) : []
    });

    refreshData();
    showToast(`Permanent UHID ${saved.uhid} successfully generated for ${saved.name}!`, 'success');
    
    // Reset form
    setName('');
    setMobile('');
    setAddress('');
    setAllergies('');
    setMedicalHistory('');
    setShowAddForm(false);
    setDuplicateMatches([]);

    // Prompt card print
    openPrintDoc({
      type: 'patient_card',
      title: 'Swastik Patient Identity Card',
      data: saved
    });
  };

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q) || p.mobile.includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <span>Patient Identity & Registration (UHID System)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            One Permanent Swastik UHID per patient • Duplicate detection engine • Label & QR Card Generation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UHID, Name, Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'New Registration'}</span>
          </button>
        </div>
      </div>

      {/* New Registration Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border-2 border-teal-500 shadow-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900">New Patient Identity Registration</h3>
              <p className="text-xs text-slate-500">Generates unique permanent Swastik Hospital UHID (e.g. SH-2026-00106)</p>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Auto UHID Sequence
            </span>
          </div>

          {/* Duplicate candidate warning box if match found */}
          {duplicateMatches.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Potential Duplicate Identity Detected ({duplicateMatches.length} existing record match)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Hospital Policy Rule: Verify existing UHID before creating duplicate cards. Do not silently merge records.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {duplicateMatches.map(dup => (
                  <div key={dup.uhid} className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{dup.name} ({dup.age} / {dup.gender})</p>
                      <p className="text-[11px] text-slate-500 font-mono">UHID: {dup.uhid} • Mob: {dup.mobile}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Opened existing patient profile for ${dup.name}`, 'info');
                        setSearchTerm(dup.uhid);
                        setShowAddForm(false);
                      }}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[10px]"
                    >
                      Use Existing
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitPatient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age in Years *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact No. *</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="10 digit mobile"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-rose-700"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Relative's phone"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, locality, town"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Person & Relationship</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Relationship (e.g. Spouse)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Drug Allergies (Comma separated)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 bg-rose-50/30 text-rose-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Significant Medical / Surgical History</label>
                <input
                  type="text"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Hypertension, previous C-section"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-md transition"
              >
                Create Permanent UHID & Generate Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registered Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-sm text-slate-900">
            Registered Hospital Patients Database ({filteredPatients.length})
          </h3>
          <span className="text-xs text-slate-500">Permanent Single-UHID Architecture</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Permanent UHID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Age / Gender</th>
                <th className="p-3">Mobile Contact</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Allergies / Alert</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(patient => (
                <tr key={patient.uhid} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {patient.uhid}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{patient.name}</td>
                  <td className="p-3 text-slate-600">{patient.age} yrs / {patient.gender}</td>
                  <td className="p-3 font-mono text-slate-700">{patient.mobile}</td>
                  <td className="p-3 font-bold text-rose-700">{patient.bloodGroup || '—'}</td>
                  <td className="p-3">
                    {patient.allergies && patient.allergies.length > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {patient.allergies.join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-400">None known</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Issue OPD Token */}
                      <button
                        onClick={() => {
                          StorageService.issueQueueToken(patient.uhid, patient.name, 'DOC-001', 'Dr. Vandana Jain');
                          refreshData();
                          showToast(`Issued OPD Token for ${patient.name} under Dr. Vandana Jain`, 'success');
                          setActiveModule('opd');
                        }}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold flex items-center gap-1"
                        title="Issue OPD Token for Dr. Vandana Jain"
                      >
                        <Stethoscope className="w-3 h-3" />
                        <span>Token</span>
                      </button>

                      {/* Print Card */}
                      <button
                        onClick={() => {
                          openPrintDoc({
                            type: 'patient_card',
                            title: 'Swastik Patient Identity Card',
                            data: patient
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                        title="Print Identity Card & Barcode"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
