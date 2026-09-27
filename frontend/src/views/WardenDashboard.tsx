import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  CalendarCheck,
  FileCheck,
  Wrench,
  UtensilsCrossed,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { 
  LeaveRequest, 
  Complaint, 
  FoodMenu, 
  FoodWastage, 
  WastagePrediction, 
  Visitor,
  AttendanceStatus 
} from '../types/index.js';

export const WardenDashboard: React.FC = () => {
  const { profile, tokenHeader } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'complaints' | 'mess' | 'visitors'>('attendance');
  const [loading, setLoading] = useState(true);

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Leaves & Complaints
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Mess & Wastage
  const [menu, setMenu] = useState<FoodMenu[]>([]);
  const [wastageLogs, setWastageLogs] = useState<FoodWastage[]>([]);
  const [prediction, setPrediction] = useState<WastagePrediction | null>(null);
  const [newWastage, setNewWastage] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'LUNCH' as const,
    mealsPrepared: 120,
    mealsServed: 110,
    mealsConsumed: 102,
    notes: '',
  });

  // Visitors
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [newVisitor, setNewVisitor] = useState({
    studentId: 'std-1',
    visitorName: '',
    relationship: 'Parent',
    phone: '',
  });

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const hostelId = (profile && 'assignedHostelId' in profile && profile.assignedHostelId) || 'hst-1';
      
      const [attRes, lvRes, cmpRes, menuRes, wstRes, predRes, visRes] = await Promise.all([
        fetch(`/api/attendance/hostel/${hostelId}?date=${attendanceDate}`, { headers: tokenHeader() }),
        fetch('/api/leaves/all', { headers: tokenHeader() }),
        fetch('/api/complaints/all', { headers: tokenHeader() }),
        fetch(`/api/mess/menu?hostelId=${hostelId}`, { headers: tokenHeader() }),
        fetch(`/api/mess/wastage?hostelId=${hostelId}`, { headers: tokenHeader() }),
        fetch(`/api/mess/prediction?hostelId=${hostelId}`, { headers: tokenHeader() }),
        fetch('/api/visitors', { headers: tokenHeader() }),
      ]);

      const [attJson, lvJson, cmpJson, menuJson, wstJson, predJson, visJson] = await Promise.all([
        attRes.json(),
        lvRes.json(),
        cmpRes.json(),
        menuRes.json(),
        wstRes.json(),
        predRes.json(),
        visRes.json(),
      ]);

      if (attJson.success) setAttendanceList(attJson.data.records || []);
      if (lvJson.success) setLeaves(lvJson.data);
      if (cmpJson.success) setComplaints(cmpJson.data);
      if (menuJson.success) setMenu(menuJson.data);
      if (wstJson.success) setWastageLogs(wstJson.data);
      if (predJson.success) setPrediction(predJson.data);
      if (visJson.success) setVisitors(visJson.data);
    } catch (err: any) {
      toast(err.message || 'Error fetching warden operations data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [attendanceDate]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const hostelId = (profile && 'assignedHostelId' in profile && profile.assignedHostelId) || 'hst-1';
      const items = attendanceList.map((item) => ({
        studentId: item.studentId,
        hostelId,
        date: attendanceDate,
        status: item.status,
      }));

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({ items }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      toast('Daily attendance roll call saved successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Error recording attendance', 'error');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleReviewLeave = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLeave) return;
    try {
      const res = await fetch(`/api/leaves/${selectedLeave.id}/review`, {
        method: 'PATCH',
        headers: tokenHeader(),
        body: JSON.stringify({ status, reviewNotes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast(`Leave request ${status.toLowerCase()}!`, 'success');
      setSelectedLeave(null);
      setReviewNotes('');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error reviewing leave', 'error');
    }
  };

  const handleUpdateComplaint = async (complaintId: string, status: any) => {
    const notes = prompt('Enter resolution or technician update note:');
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: tokenHeader(),
        body: JSON.stringify({ status, resolutionNotes: notes || 'Updated by Warden' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast('Complaint ticket updated', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error updating ticket', 'error');
    }
  };

  const handleAddWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hostelId = (profile && 'assignedHostelId' in profile && profile.assignedHostelId) || 'hst-1';
      const res = await fetch('/api/mess/wastage', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({
          ...newWastage,
          hostelId,
          mealsPrepared: Number(newWastage.mealsPrepared),
          mealsServed: Number(newWastage.mealsServed),
          mealsConsumed: Number(newWastage.mealsConsumed),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast('Meal waste logged successfully', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error logging food waste', 'error');
    }
  };

  const handleCheckInVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.visitorName || !newVisitor.phone) {
      toast('Please enter visitor name and phone', 'error');
      return;
    }
    try {
      const hostelId = (profile && 'assignedHostelId' in profile && profile.assignedHostelId) || 'hst-1';
      const res = await fetch('/api/visitors/checkin', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({
          ...newVisitor,
          hostelId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast('Visitor checked in', 'success');
      setNewVisitor({ studentId: 'std-1', visitorName: '', relationship: 'Parent', phone: '' });
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error checking in visitor', 'error');
    }
  };

  const handleCheckOutVisitor = async (visitorId: string) => {
    try {
      const res = await fetch(`/api/visitors/${visitorId}/checkout`, {
        method: 'PATCH',
        headers: tokenHeader(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast('Visitor check-out recorded', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error checking out visitor', 'error');
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length;
  const openComplaints = complaints.filter((c) => c.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hostel Operations Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              Resident Warden
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervising daily attendance, outpasses, maintenance repairs, and food dining efficiency.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
          title="Refresh operations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Leave / Outpass ({pendingLeaves})</span>
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
          <span>Complaints ({openComplaints})</span>
        </button>

        <button
          onClick={() => setActiveTab('mess')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'mess'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Mess & Waste AI</span>
        </button>

        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'visitors'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Visitor Log</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE ROLL CALL */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Evening Roll Call</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mark resident presence, absence, or authorized leave status</p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
              />
              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {savingAttendance ? 'Saving...' : 'Save Roll Call'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Admission No.</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {attendanceList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{item.studentName}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{item.admissionNumber}</td>
                    <td className="py-3 px-3 text-slate-500">{item.department}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['PRESENT', 'ABSENT', 'ON_LEAVE'] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleAttendanceChange(item.studentId, status)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              item.status === status
                                ? status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {status === 'ON_LEAVE' ? 'LEAVE' : status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE & OUTPASS REVIEW */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resident Outpass & Leave Queue</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review departures, parental approvals, and emergency permissions</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Dates</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaves.map((lv) => (
                  <tr key={lv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{lv.studentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{lv.admissionNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {lv.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div>Dep: {new Date(lv.departureDate).toLocaleDateString()}</div>
                      <div>Ret: {new Date(lv.expectedReturnDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs">{lv.reason}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lv.status === 'APPROVED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : lv.status === 'REJECTED'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}>
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {lv.status === 'PENDING' ? (
                        <button
                          onClick={() => setSelectedLeave(lv)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                        >
                          Review
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Reviewed by {lv.reviewedBy || 'Warden'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Facility Maintenance Tickets</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage electrical, plumbing, carpentry, and internet repairs</p>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
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
                    <span className="text-[11px] text-slate-400">Logged by {c.studentName} ({c.admissionNumber})</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.description}</p>
                  {c.resolutionNotes && (
                    <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Technician Note: {c.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {c.status !== 'RESOLVED' && (
                    <>
                      <button
                        onClick={() => handleUpdateComplaint(c.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition cursor-pointer"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateComplaint(c.id, 'RESOLVED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition shadow-sm cursor-pointer"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MESS & FOOD WASTAGE PREDICTION */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          {/* AI / Statistical Waste Prediction Card */}
          {prediction && (
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 rounded-3xl border border-blue-500/30 p-6 shadow-xl relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span>Food Wastage Forecast & Heuristic Analytics</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700">
                  Model: {prediction.modelType}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Average Resident Consumption</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {prediction.averageConsumptionRate || 'Data not available'}
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Average Waste Per Shift</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {prediction.averageWastePerShiftKg !== null ? `${prediction.averageWastePerShiftKg} kg` : 'Data not available'}
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Recommended Prep (Next Shift)</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">
                    {prediction.recommendedPrepCount !== null ? `${prediction.recommendedPrepCount} meals` : 'Data not available'}
                  </div>
                </div>
              </div>

              {prediction.insights && (
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                  {prediction.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Log Wastage Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Record Meal Wastage</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Input prepared vs consumed meals</p>

              <form onSubmit={handleAddWastage} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium mb-1">Meal Date</label>
                  <input
                    type="date"
                    required
                    value={newWastage.date}
                    onChange={(e) => setNewWastage({ ...newWastage, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Meal Shift</label>
                  <select
                    value={newWastage.mealType}
                    onChange={(e) => setNewWastage({ ...newWastage, mealType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                  >
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH">Lunch</option>
                    <option value="SNACKS">Snacks</option>
                    <option value="DINNER">Dinner</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium mb-1">Prepared</label>
                    <input
                      type="number"
                      required
                      value={newWastage.mealsPrepared}
                      onChange={(e) => setNewWastage({ ...newWastage, mealsPrepared: Number(e.target.value) })}
                      className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Served</label>
                    <input
                      type="number"
                      required
                      value={newWastage.mealsServed}
                      onChange={(e) => setNewWastage({ ...newWastage, mealsServed: Number(e.target.value) })}
                      className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Consumed</label>
                    <input
                      type="number"
                      required
                      value={newWastage.mealsConsumed}
                      onChange={(e) => setNewWastage({ ...newWastage, mealsConsumed: Number(e.target.value) })}
                      className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md cursor-pointer mt-3"
                >
                  Log Waste Record
                </button>
              </form>
            </div>

            {/* Recent Wastage Logs */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Recent Meal Waste Audits</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Historical tracking feeding the moving average model</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Meal</th>
                      <th className="py-2.5 px-3">Prepared / Served / Consumed</th>
                      <th className="py-2.5 px-3 text-right">Estimated Waste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {wastageLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3">{log.date}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 dark:text-white">{log.mealType}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {log.mealsPrepared} / {log.mealsServed} / {log.mealsConsumed}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-500">
                          {log.wastageKg} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VISITORS */}
      {activeTab === 'visitors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Register Guest Visitor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Log parent or authorized visitor arrival</p>

            <form onSubmit={handleCheckInVisitor} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Visiting Student</label>
                <select
                  value={newVisitor.studentId}
                  onChange={(e) => setNewVisitor({ ...newVisitor, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                >
                  <option value="std-1">Rahul Verma (2024-CSE-042)</option>
                  <option value="std-2">Ananya Sen (2024-ECE-019)</option>
                  <option value="std-3">Arjun Nair (2025-MECH-088)</option>
                  <option value="std-4">Priya Iyer (2023-IT-007)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Verma"
                  value={newVisitor.visitorName}
                  onChange={(e) => setNewVisitor({ ...newVisitor, visitorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Relationship</label>
                  <select
                    value={newVisitor.relationship}
                    onChange={(e) => setNewVisitor({ ...newVisitor, relationship: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94000 00000"
                    value={newVisitor.phone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md cursor-pointer mt-3"
              >
                Log Visitor Check-In
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Campus Visitor Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Real-time gate and hall access control</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Visitor</th>
                    <th className="py-2.5 px-3">Student Visited</th>
                    <th className="py-2.5 px-3">Check-In</th>
                    <th className="py-2.5 px-3">Check-Out</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {visitors.map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{v.visitorName}</div>
                        <div className="text-[10px] text-slate-400">{v.relationship} &bull; {v.phone}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{v.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{new Date(v.checkInTime).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString() : <span className="text-emerald-500 font-sans font-bold">On Campus</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {!v.checkOutTime && (
                          <button
                            onClick={() => handleCheckOutVisitor(v.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW LEAVE MODAL */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Review Outpass Request</h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 mb-4">
              <div><span className="text-slate-400">Student:</span> <span className="font-semibold">{selectedLeave.studentName}</span></div>
              <div><span className="text-slate-400">Type:</span> <span className="font-bold text-blue-500">{selectedLeave.type}</span></div>
              <div><span className="text-slate-400">Reason:</span> <span>{selectedLeave.reason}</span></div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium mb-1">Warden Review Remarks / Parental Verification</label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Confirmed with guardian via registered phone..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewLeave('REJECTED')}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Reject Outpass
              </button>
              <button
                onClick={() => handleReviewLeave('APPROVED')}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Approve Outpass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
