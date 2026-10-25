# SWASTIK HOSPITAL — Hospital Management System (HMS)

> **NABH-Ready Cloud Hospital Management Platform** for Swastik Hospital.
> Built as an integrated, modular web application combining clinical encounters, inpatient wards, emergency triage, operation theatre scheduling, diagnostics, pharmacy dispensing, centralized billing, and self-service patient portal.

---

## 🏥 Hospital Baseline Configuration

| Parameter | Confirmed Baseline | Implementation Detail |
|---|---|---|
| **Facility Profile** | Single site | 35 Beds across 5 wards (GM, GF, Semi-Private, Deluxe, ICU) |
| **OPD Planning Volume** | 25–50 patients / day | Token queue board with live status transitions |
| **Operation Theatres** | 1 Main OT suite | Comprehensive multi-resource conflict checking |
| **Named Clinicians** | Dr. Vandana Jain & Dr. Ankit Jain | Specialty consultation templates (Obstetric & PAC) |
| **Diagnostics** | In-house Radiology + Configurable Lab | In-house processing & external referral networks |
| **Pharmacy** | Batch & Lot Tracking | Expiry alerts, reorder levels, prescription decrement |
| **Billing Model** | Unified Itemized Self-Pay | Price snapshots, partial payments, UPI QR gateway |
| **Identity Hierarchy** | Single UHID architecture | Permanent `UHID`, `Encounter ID`, `Admission ID` |
| **Access & Portals** | Dual channel | Staff RBAC console + Patient Mobile OTP Portal |
| **Languages** | English & Hindi (द्विभाषी) | Instant UI and document template bilingual toggle |
| **Continuity** | Offline Outage Register | Controlled downtime register with post-restore audit |

---

## 🚀 Running the Web Application

### Prerequisites
- Node.js (v18+ recommended; currently running on Node v22.19.0)
- npm (v10+)

### Start Development Server
```powershell
cd "c:\Users\MOHIL KUMAR\Desktop\HMS"
npm run dev -- --host --port 3000
```
Open **[http://localhost:3001](http://localhost:3001)** (or http://localhost:3000) in any modern browser.

### Build Production Bundle
```powershell
npm run build
npm run preview
```

---

## 🌟 Modules & Features Implemented

1. **Patient Identity & Registration (UHID System)**
   - Permanent `UHID` (`SH-2026-XXXXX`).
   - Phone and name-based **duplicate detection engine** preventing silent record overwrites.
   - Temporary Emergency ID generation (`EMG-TMP-XXXX`) with post-stabilization reconciliation.
   - Branded Patient Identity Card with digital QR code and barcode.

2. **Patient Portal (Self-Service)**
   - Registered mobile OTP verification (enter `1234` for test simulation).
   - Hybrid appointment scheduling: routine slots confirm immediately; specialist/referral requests enter staff coordination review.
   - Appointment history, doctor selection, and policy-based slot cancellation.

3. **OPD Queue & Digital Consultation**
   - Doctor-specific token queue: `Waiting` ➔ `Called` ➔ `In Consultation` ➔ `Completed`.
   - Vitals recording (BP, Pulse, SpO2, Temperature, Weight).
   - **Dr. Vandana Jain Specialty Template**: Gravida, Para, Abortion, Living, LMP, EDD calculation, FHR, obstetric ultrasound findings.
   - **Dr. Ankit Jain Specialty Template**: Mallampati Class I–IV, ASA Physical Status Grade I–V/E, Airway assessment, NPO fasting hours, Anesthesia technique.
   - Prescriptions table with frequency, dosage, duration, and instructions.
   - Branded printable prescription layout.

4. **IPD Ward & 35-Bed Management**
   - Real-time interactive floor plan of all 35 beds across 5 wards:
     - General Ward (Male) — 10 beds (`GM-01` to `GM-10`)
     - General Ward (Female) — 10 beds (`GF-01` to `GF-10`)
     - Semi-Private Room — 8 beds (`SP-101A` to `SP-104B`)
     - Deluxe Suite — 4 private suites (`DP-201` to `DP-204`)
     - Intensive Care Unit (ICU) — 3 beds (`ICU-01` to `ICU-03`)
   - States: `Available`, `Occupied`, `Reserved`, `Cleaning/Blocked`, `Maintenance`.
   - Direct IPD Admission & Bed Transfer (with terminal cleaning release).
   - Inpatient Vitals charting and Medication Administration Record (MAR).
   - **Clinical Discharge Authorization** (physician sign-off strictly separate from financial billing settlement).
   - Printable IPD Discharge Summary.

5. **24x7 Emergency Trauma & Triage**
   - Triage categorization: **RED (Immediate)**, **YELLOW (Urgent)**, **GREEN (Non-urgent)**.
   - Rapid intake with temporary identity and emergency vitals.
   - Disposition tracking (Observation, IPD Admission, Transfer, Discharge).
   - Permanent UHID reconciliation modal.

6. **Operation Theatre (OT 1 Suite)**
   - Conflict checking engine: blocks overlapping reservations for OT Room 1, primary surgeon, or anesthesiologist Dr. Ankit Jain.
   - Surgical statuses: `Scheduled` ➔ `Preparation` ➔ `In Progress` ➔ `Completed`.
   - Pre-Op readiness checklist.

7. **In-House Radiology & Diagnostic Imaging**
   - Modalities supported: USG, Digital X-Ray, Color Doppler, CT Scan, MRI, Mammography.
   - Worklist pipeline with report drafting and authorized clinician PACS release.
   - Branded printable radiology findings report.

8. **Pathology & Laboratory Investigations**
   - Dual processing: In-house processing vs. external referral laboratories.
   - Barcode sample collection (`SPEC-2026-XXXX`).
   - Parameter entry with reference ranges and abnormal flagging.
   - Authorized pathologist sign-off and printable lab reports.

9. **Pharmacy & Medical Consumables Inventory**
   - Batch and lot tracking with purchase rates, MRP, and expiry dates.
   - Real-time alerts for low stock and items expiring within 45 days.
   - Prescription-linked dispensing that decrements batch-specific inventory.
   - Inward stock purchase entry modal.

10. **Centralized Billing & Cashier Desk**
    - Unified service catalog with price snapshotting on invoice creation.
    - Advance payments, itemized invoices, partial collections, and balance due tracking.
    - Dynamic UPI QR Code and card payment checkout simulation.
    - Role-restricted discount and refund approvals with mandatory audit logging.
    - Printable itemized invoice & official receipt.

11. **Staff Administration & RBAC**
    - 12 individual staff accounts across all departments (no shared accounts).
    - Shift rosters and attendance marking.
    - Segregation of duties permission matrix (e.g. reception cannot prescribe, cashier cannot release clinical reports).

12. **Operating Expenses & Grievance Tickets**
    - Operating expenses ledger with supplier invoice numbers and approval states.
    - Grievance & support tickets with priority, assigned department, and resolution logs.

13. **Manual Downtime Register (Outage Mode)**
    - Activated during internet/cloud interruptions.
    - Local offline register for OPD walk-ins, admissions, and collections.
    - Post-restoration duplicate detection and permanent UHID reconciliation.

14. **Reports & Audit Trail**
    - Daily department reports for OPD, IPD, OT, Diagnostics, and Revenue.
    - CSV export and print preview.
    - Traceable 180-day secure audit log recording operator identity, timestamp, module, action, and record ID.

15. **Bilingual Support (English & हिंदी)**
    - Instant header language toggle translating interface labels, statuses, and clinical terms.
