import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Appointment } from '../../types';
import { 
  Calendar, Clock, ShieldCheck, User, Phone, CheckCircle2, 
  AlertCircle, ArrowRight, X, RotateCcw, Building2, Lock, Smartphone
} from 'lucide-react';

export const PatientPortalView: React.FC = () => {
  const { t, showToast, refreshData, setActiveModule } = useApp();

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('9811223344'); // Default prefill for Sunita Aggarwal
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [patientName, setPatientName] = useState('Sunita Aggarwal');
  const [uhid, setUhid] = useState('SH-2026-00101');

  // Booking Form State
  const [selectedDoctor, setSelectedDoctor] = useState('DOC-001');
  const [bookingDate, setBookingDate] = useState('2026-10-26');
  const [selectedSlot, setSelectedSlot] = useState('11:00 AM');
  const [bookingType, setBookingType] = useState<'routine' | 'special_referral'>('routine');
  const [symptomsNotes, setSymptomsNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  const availableSlots = [
    '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
    '11:30 AM', '12:00 PM', '12:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    setOtpSent(true);
    showToast('OTP code sent to +91 ' + mobileNumber + ' (Use 1234 for simulation)', 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === '1234' || enteredOtp.length === 4) {
      setIsLoggedIn(true);
      showToast('Authentication successful. Welcome to Swastik Patient Portal!', 'success');
    } else {
      showToast('Invalid OTP. Please enter 1234 to verify.', 'error');
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorName = selectedDoctor === 'DOC-001' ? 'Dr. Vandana Jain' : 'Dr. Ankit Jain';
      const department = selectedDoctor === 'DOC-001' ? 'Gynecology & Obstetrics' : 'Anesthesiology & Critical Care';

      const newAppt = StorageService.bookAppointment({
        uhid,
        patientName,
        patientMobile: mobileNumber,
        doctorId: selectedDoctor,
        doctorName,
        department,
        date: bookingDate,
        slotTime: selectedSlot,
        bookingType,
        bookingSource: 'online_portal',
        notes: symptomsNotes,
        instantConfirm: bookingType === 'routine'
      });

      refreshData();
      setBookingSuccess(newAppt);
      showToast(
        bookingType === 'routine' 
          ? 'Appointment confirmed instantly!' 
          : 'Appointment request submitted for staff coordination review.',
        'success'
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const myAppointments = StorageService.getAppointments().filter(
    a => a.patientMobile === mobileNumber || a.uhid === uhid
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Patient Portal Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Swastik Patient Portal • मरीज़ पोर्टल
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Online Appointments & Booking Service</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Book slots with Dr. Vandana Jain and Dr. Ankit Jain with instant OTP confirmation.
          </p>
        </div>
        <button
          onClick={() => setActiveModule('dashboard')}
          className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/20 transition"
        >
          <span>Return to Staff Console</span>
        </button>
      </div>

      {!isLoggedIn ? (
        /* Login Card with Mobile + OTP */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-md mx-auto space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 text-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Secure Patient Access</h3>
            <p className="text-xs text-slate-500 mt-1">
              Login with your registered mobile number using 2-Factor OTP
            </p>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9811223344"
                    className="w-full pl-12 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Sunita Aggarwal"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Send Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
                OTP sent to <b>+91 {mobileNumber}</b>. For testing simulation, enter <b>1234</b>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 4-Digit OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="1234"
                  className="w-full text-center tracking-widest text-xl font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Login</span>
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-xs text-slate-500 hover:underline"
              >
                Change mobile number
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Authenticated Patient Dashboard */
        <div className="space-y-6">
          
          {/* Patient Profile Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                {patientName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{patientName}</h3>
                <p className="text-xs text-slate-500">
                  Permanent UHID: <span className="font-mono font-bold text-teal-800">{uhid}</span> • +91 {mobileNumber}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              Sign Out
            </button>
          </div>

          {/* Booking Successful Banner */}
          {bookingSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    {bookingSuccess.status === 'confirmed' ? 'Appointment Confirmed!' : 'Appointment Submitted for Staff Review'}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Booking ID: <b>{bookingSuccess.id}</b> • Doctor: <b>{bookingSuccess.doctorName}</b> ({bookingSuccess.department}) on <b>{bookingSuccess.date}</b> at <b>{bookingSuccess.slotTime}</b>.
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    An SMS / WhatsApp notification has been queued for {mobileNumber}. Please report to Reception 15 minutes prior.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBookingSuccess(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Book New Appointment Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Book an OPD Appointment</h3>
              <p className="text-xs text-slate-500">
                Hybrid routing: Routine consultations are confirmed instantly; special or referral consultations are routed to clinical coordination review.
              </p>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Doctor Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Clinician</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="DOC-001">Dr. Vandana Jain (MD, DGO - Gynecology & Obstetrics)</option>
                    <option value="DOC-002">Dr. Ankit Jain (MD, DA - Anesthesiology & PAC)</option>
                  </select>
                </div>

                {/* Booking Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Type</label>
                  <select
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="routine">Routine Consultation (Instant Confirmation)</option>
                    <option value="special_referral">Specialist / External Referral (Staff Review)</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Slot Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Slot Time</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-semibold"
                  >
                    {availableSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms / Chief Complaints (Optional)</label>
                <textarea
                  rows={2}
                  value={symptomsNotes}
                  onChange={(e) => setSymptomsNotes(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  Confirm & Reserve Appointment
                </button>
              </div>
            </form>
          </div>

          {/* My Appointments List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Your Appointment History & Status</h3>
            {myAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No past or upcoming appointments found.</p>
            ) : (
              <div className="space-y-3">
                {myAppointments.map(appt => (
                  <div key={appt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{appt.doctorName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          appt.status === 'checked_in' ? 'bg-indigo-100 text-indigo-800' :
                          appt.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        {appt.department} • <b className="text-slate-800">{appt.date} at {appt.slotTime}</b>
                      </p>
                      {appt.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">Notes: {appt.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {['confirmed', 'pending_review'].includes(appt.status) && (
                        <button
                          onClick={() => {
                            StorageService.updateAppointmentStatus(appt.id, 'cancelled', patientName);
                            refreshData();
                            showToast('Appointment cancelled successfully.', 'info');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                        >
                          Cancel Slot
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
