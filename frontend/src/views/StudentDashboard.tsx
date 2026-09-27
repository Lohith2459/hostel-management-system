import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import confetti from 'canvas-confetti';
import {
  Home,
  Calendar,
  Send,
  Wrench,
  Utensils,
  CreditCard,
  Bell,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  ShieldCheck,
  Building2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  Fee, 
  LeaveRequest, 
  Complaint, 
  FoodMenu, 
  OfficialReceipt, 
  Notification, 
  Announcement 
} from '../types/index.js';
import { ReceiptModal } from '../components/ReceiptModal.js';
import { QRVerifyModal } from '../components/QRVerifyModal.js';

export const StudentDashboard: React.FC = () => {
  const { user, profile, tokenHeader } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'room' | 'attendance' | 'leaves' | 'complaints' | 'fees' | 'mess' | 'notices'>('room');
  const [loading, setLoading] = useState(true);

  // Room allocation
  const [myAllocation, setMyAllocation] = useState<any>(null);

  // Attendance
  const [attendance, setAttendance] = useState<{
    records: any[];
    stats: { total: number; present: number; absent: number; onLeave: number; percentage: number | null };
  } | null>(null);

  // Leaves & Complaints
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Fees & Payments
  const [fees, setFees] = useState<Fee[]>([]);
  const [payingFeeId, setPayingFeeId] = useState<string | null>(null);

  // Mess
  const [menu, setMenu] = useState<FoodMenu[]>([]);

  // Notices
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals
  const [receiptData, setReceiptData] = useState<OfficialReceipt | null>(null);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);

  // New forms
  const [newLeave, setNewLeave] = useState({
    type: 'NIGHT_OUT' as const,
    departureDate: '',
    expectedReturnDate: '',
    reason: '',
  });

  const [newComplaint, setNewComplaint] = useState({
    category: 'ELECTRICAL' as const,
    title: '',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [alcRes, attRes, lvRes, cmpRes, feeRes, menuRes, ancRes, notifRes] = await Promise.all([
        fetch('/api/allocations/my', { headers: tokenHeader() }),
        fetch('/api/attendance/my', { headers: tokenHeader() }),
        fetch('/api/leaves/my', { headers: tokenHeader() }),
        fetch('/api/complaints/my', { headers: tokenHeader() }),
        fetch('/api/finance/fees/my', { headers: tokenHeader() }),
        fetch('/api/mess/menu', { headers: tokenHeader() }),
        fetch('/api/announcements', { headers: tokenHeader() }),
        fetch('/api/announcements/notifications', { headers: tokenHeader() }),
      ]);

      const [alcJson, attJson, lvJson, cmpJson, feeJson, menuJson, ancJson, notifJson] = await Promise.all([
        alcRes.json(),
        attRes.json(),
        lvRes.json(),
        cmpRes.json(),
        feeRes.json(),
        menuRes.json(),
        ancRes.json(),
        notifRes.json(),
      ]);

      if (alcJson.success) setMyAllocation(alcJson.data);
      if (attJson.success) setAttendance(attJson.data);
      if (lvJson.success) setLeaves(lvJson.data);
      if (cmpJson.success) setComplaints(cmpJson.data);
      if (feeJson.success) setFees(feeJson.data);
      if (menuJson.success) setMenu(menuJson.data);
      if (ancJson.success) setAnnouncements(ancJson.data);
      if (notifJson.success) setNotifications(notifJson.data);
    } catch (err: any) {
      toast(err.message || 'Error loading resident student portal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.departureDate || !newLeave.expectedReturnDate || !newLeave.reason) {
      toast('Please complete all leave fields', 'error');
      return;
    }
    try {
      const res = await fetch('/api/leaves/apply', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify(newLeave),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      toast('Leave request submitted to warden for review', 'success');
      setNewLeave({ type: 'NIGHT_OUT', departureDate: '', expectedReturnDate: '', reason: '' });
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error applying for leave', 'error');
    }
  };

  const handleLodgeComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) {
      toast('Please enter ticket title and description', 'error');
      return;
    }
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify(newComplaint),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      toast('Maintenance ticket lodged successfully', 'success');
      setNewComplaint({ category: 'ELECTRICAL', title: '', description: '' });
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error lodging ticket', 'error');
    }
  };

  const handlePayFee = async (feeId: string) => {
    setPayingFeeId(feeId);
    try {
      const res = await fetch('/api/finance/pay/simulate', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({ feeId, paymentMethod: 'SIMULATION' }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore if confetti fails
      }

      toast('Fee paid! Official verified receipt generated.', 'success');
      
      // Auto-open official receipt
      if (json.data.receiptNumber) {
        handleViewReceipt(json.data.receiptNumber);
      }
      loadData();
    } catch (err: any) {
      toast(err.message || 'Payment simulation failed', 'error');
    } finally {
      setPayingFeeId(null);
    }
  };

  const handleViewReceipt = async (receiptNumber: string) => {
    try {
      const res = await fetch(`/api/finance/receipts/${receiptNumber}`, {
        headers: tokenHeader(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setReceiptData(json.data);
    } catch (err: any) {
      toast(err.message || 'Could not load official receipt', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Resident Student Portal</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Resident Scholar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {profile && 'admissionNumber' in profile ? `${profile.firstName} ${profile.lastName} (${profile.admissionNumber})` : user?.email} &bull; {profile && 'department' in profile ? profile.department : ''}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
          title="Refresh portal"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('room')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'room'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>My Room</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Attendance ({attendance?.stats.percentage !== null ? `${attendance?.stats.percentage}%` : 'N/A'})</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Leave / Outpass</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'complaints'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Complaints</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'fees'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Fees & Receipts</span>
        </button>

        <button
          onClick={() => setActiveTab('mess')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'mess'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Dining Menu</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'notices'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notices ({announcements.length})</span>
        </button>
      </div>

      {/* TAB 1: MY ROOM */}
      {activeTab === 'room' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Residential Allocation</h2>
          </div>

          {myAllocation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-slate-950 p-6 rounded-3xl border border-blue-500/30 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {myAllocation.hostel?.type} RESIDENCE
                </span>
                <h3 className="text-xl font-bold text-white">{myAllocation.hostel?.name}</h3>
                <p className="text-xs text-slate-400">{myAllocation.hostel?.address}</p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Block & Wing:</span>
                    <span className="font-semibold text-white">{myAllocation.block?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Room Number:</span>
                    <span className="font-semibold text-blue-400 font-mono text-sm">Room {myAllocation.room?.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bed Assignment:</span>
                    <span className="font-semibold text-white font-mono">Bed {myAllocation.bed?.bedNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Room Comfort:</span>
                    <span className="font-semibold text-white">{myAllocation.room?.type}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Allocation Security & Compliance</h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Single Active Allocation Policy: Verified Active</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Start Date: {new Date(myAllocation.allocation.startDate).toLocaleDateString()}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Allocation Notes: {myAllocation.allocation.notes || 'Standard Academic Year Term'}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Room Allocation Status:</span>
                  <span className="text-emerald-500 font-bold uppercase">{myAllocation.allocation.status}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              Data not available. You do not currently have an active bed allocation. Please contact the administrator.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resident Attendance Record</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nightly roll call ledger recorded by assigned warden</p>
            </div>
            {attendance?.stats.percentage !== null && (
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-500">{attendance?.stats.percentage}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Attendance Rate</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Sessions</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-lg">{attendance?.stats.total || 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Present</span>
              <span className="font-bold text-emerald-500 text-lg">{attendance?.stats.present || 0}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Absent</span>
              <span className="font-bold text-rose-500 text-lg">{attendance?.stats.absent || 0}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                  <th className="py-2.5 px-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {attendance?.records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3">{r.date}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : r.status === 'ABSENT'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">{r.markedBy}</td>
                    <td className="py-2.5 px-3 font-sans text-right text-slate-500">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE / OUTPASS */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Apply for Outpass / Leave</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Request permission from warden</p>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Pass Category</label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                >
                  <option value="DAY_PASS">Day Outpass (City Return)</option>
                  <option value="NIGHT_OUT">Night Out (Event/Home)</option>
                  <option value="VACATION">Vacation / Semester Break</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Departure Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newLeave.departureDate}
                  onChange={(e) => setNewLeave({ ...newLeave, departureDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Expected Return Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newLeave.expectedReturnDate}
                  onChange={(e) => setNewLeave({ ...newLeave, expectedReturnDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Reason & Destination</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Attending family wedding in Pune..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md cursor-pointer mt-3"
              >
                Submit Outpass Application
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">My Outpass History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Track warden review decisions and emergency remarks</p>

            <div className="space-y-3">
              {leaves.map((lv) => (
                <div
                  key={lv.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{lv.type}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lv.status === 'APPROVED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : lv.status === 'REJECTED'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}>
                        {lv.status}
                      </span>
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium">{lv.reason}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Dep: {new Date(lv.departureDate).toLocaleDateString()} &bull; Ret: {new Date(lv.expectedReturnDate).toLocaleDateString()}
                    </div>
                  </div>

                  {lv.reviewNotes && (
                    <div className="text-[11px] text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 max-w-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">Warden Remark:</span>
                      {lv.reviewNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Lodge Maintenance Ticket</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Request hostel repairs and service</p>

            <form onSubmit={handleLodgeComplaint} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Category</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                >
                  <option value="ELECTRICAL">Electrical (Lights, Fans, Sockets)</option>
                  <option value="PLUMBING">Plumbing (Taps, Showers, Drainage)</option>
                  <option value="CARPENTRY">Carpentry (Bed, Desk, Cupboard)</option>
                  <option value="CLEANLINESS">Cleanliness & Housekeeping</option>
                  <option value="FOOD">Dining / Mess Quality</option>
                  <option value="INTERNET">LAN / Wi-Fi Connectivity</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study lamp switch sparking"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue and room location..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md cursor-pointer mt-3"
              >
                File Repair Ticket
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">My Maintenance Tickets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Real-time status from technician assignment to resolution</p>

            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                      {c.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : c.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{c.description}</p>
                  {c.resolutionNotes && (
                    <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      Resolution Note: {c.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FEES & VERIFIED RECEIPTS */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Term Residential Fees</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Itemized invoices with safe simulated payment processing and official verified receipts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Academic Term
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {fee.term} {fee.academicYear}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        fee.status === 'PAID'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}>
                        {fee.status}
                      </span>

                      {fee.status !== 'PAID' ? (
                        <button
                          onClick={() => handlePayFee(fee.id)}
                          disabled={payingFeeId === fee.id}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {payingFeeId === fee.id ? 'Processing...' : `Pay ₹${fee.totalAmount.toLocaleString()} (Simulation)`}
                        </button>
                      ) : (
                        fee.payments && fee.payments.length > 0 && (
                          <button
                            onClick={() => handleViewReceipt(fee.payments![0].receiptNumber)}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Official Receipt</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-4 gap-4 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Room Rent</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">₹{fee.roomRent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mess Charges</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">₹{fee.messFee.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Maintenance</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">₹{fee.maintenanceFee.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Invoice</span>
                      <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">₹{fee.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MESS MENU */}
      {activeTab === 'mess' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hostel Dining & Meal Schedule</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Nutritional meal schedule across breakfast, lunch, and dinner</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const dayMeals = menu.filter((m) => m.dayOfWeek === day);
              return (
                <div
                  key={day}
                  className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm pb-1 border-b border-slate-200 dark:border-slate-800">
                    {day}
                  </h4>
                  {dayMeals.map((m) => (
                    <div key={m.id} className="pt-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        {m.mealType}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                        {m.itemsDescription}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: NOTICES */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Campus Notices & Direct Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Official administrative communications</p>

            <div className="space-y-3">
              {announcements.map((anc) => (
                <div
                  key={anc.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
                      {anc.priority} NOTICE
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{anc.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ReceiptModal
        receipt={receiptData}
        onClose={() => setReceiptData(null)}
        onOpenQR={(token) => setVerifyToken(token)}
      />

      <QRVerifyModal
        token={verifyToken}
        onClose={() => setVerifyToken(null)}
      />
    </div>
  );
};
