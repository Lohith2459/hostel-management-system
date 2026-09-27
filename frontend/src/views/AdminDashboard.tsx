import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { 
  Building2, 
  Users, 
  Bed as BedIcon, 
  Layers, 
  PlusCircle, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Megaphone,
  UserCheck,
  DoorOpen,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { HostelSummary, RoomAllocation, Fee, Payment, Announcement } from '../types/index.js';

export const AdminDashboard: React.FC = () => {
  const { tokenHeader } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'hostels' | 'allocations' | 'finances' | 'announcements'>('overview');
  const [loading, setLoading] = useState(true);
  const [hostelOverview, setHostelOverview] = useState<{
    hostels: HostelSummary[];
    totalStudents: number;
    totalWardens: number;
    totalRooms: number;
  } | null>(null);

  const [allocations, setAllocations] = useState<RoomAllocation[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modal states
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedHostelId, setSelectedHostelId] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [hostelHierarchy, setHostelHierarchy] = useState<any>(null);
  const [allocating, setAllocating] = useState(false);

  // New Announcement form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM' as const,
    targetRole: 'ALL',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [hRes, aRes, fRes, pRes, ancRes] = await Promise.all([
        fetch('/api/hostels/overview', { headers: tokenHeader() }),
        fetch('/api/allocations/all', { headers: tokenHeader() }),
        fetch('/api/finance/fees/all', { headers: tokenHeader() }),
        fetch('/api/finance/payments/all', { headers: tokenHeader() }),
        fetch('/api/announcements', { headers: tokenHeader() }),
      ]);

      const [hJson, aJson, fJson, pJson, ancJson] = await Promise.all([
        hRes.json(),
        aRes.json(),
        fRes.json(),
        pRes.json(),
        ancRes.json(),
      ]);

      if (hJson.success) setHostelOverview(hJson.data);
      if (aJson.success) setAllocations(aJson.data);
      if (fJson.success) setFees(fJson.data);
      if (pJson.success) setPayments(pJson.data);
      if (ancJson.success) setAnnouncements(ancJson.data);
    } catch (err: any) {
      toast(err.message || 'Error loading administrator data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAllocateModal = async () => {
    setShowAllocateModal(true);
    try {
      // Pick first hostel for dropdown hierarchy
      if (hostelOverview && hostelOverview.hostels.length > 0) {
        const firstHstId = hostelOverview.hostels[0].id;
        setSelectedHostelId(firstHstId);
        const res = await fetch(`/api/hostels/${firstHstId}/hierarchy`, { headers: tokenHeader() });
        const json = await res.json();
        if (json.success) {
          setHostelHierarchy(json.data);
          if (json.data.blocks.length > 0) {
            setSelectedBlockId(json.data.blocks[0].id);
            const firstFloor = json.data.blocks[0].floors[0];
            if (firstFloor && firstFloor.rooms.length > 0) {
              setSelectedRoomId(firstFloor.rooms[0].id);
              const availableBed = firstFloor.rooms[0].beds?.find((b: any) => !b.isOccupied);
              if (availableBed) setSelectedBedId(availableBed.id);
            }
          }
        }
      }
    } catch (err: any) {
      toast('Error preparing allocation hierarchy', 'error');
    }
  };

  const handleHostelChange = async (hstId: string) => {
    setSelectedHostelId(hstId);
    try {
      const res = await fetch(`/api/hostels/${hstId}/hierarchy`, { headers: tokenHeader() });
      const json = await res.json();
      if (json.success) {
        setHostelHierarchy(json.data);
        if (json.data.blocks.length > 0) {
          const blk = json.data.blocks[0];
          setSelectedBlockId(blk.id);
          const flr = blk.floors[0];
          if (flr && flr.rooms.length > 0) {
            setSelectedRoomId(flr.rooms[0].id);
            const bed = flr.rooms[0].beds?.find((b: any) => !b.isOccupied);
            if (bed) setSelectedBedId(bed.id);
          }
        }
      }
    } catch {
      toast('Failed to load hostel blocks', 'error');
    }
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedHostelId || !selectedBlockId || !selectedRoomId || !selectedBedId) {
      toast('Please select all required hierarchy fields', 'error');
      return;
    }

    setAllocating(true);
    try {
      const res = await fetch('/api/allocations/allocate', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({
          studentId: selectedStudentId,
          hostelId: selectedHostelId,
          blockId: selectedBlockId,
          roomId: selectedRoomId,
          bedId: selectedBedId,
          notes: 'Administrative manual allocation',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Allocation failed');
      }

      toast('Room successfully allocated!', 'success');
      setShowAllocateModal(false);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error creating allocation', 'error');
    } finally {
      setAllocating(false);
    }
  };

  const handleVacate = async (studentId: string) => {
    if (!confirm('Are you sure you want to vacate this student?')) return;
    try {
      const res = await fetch('/api/allocations/vacate', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({ studentId, notes: 'Vacated by Administrator' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast('Student bed vacated successfully', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error vacating room', 'error');
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast('Please fill all fields', 'error');
      return;
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: tokenHeader(),
        body: JSON.stringify({
          ...newAnnouncement,
          hostelId: null, // campus-wide
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast('Campus announcement published', 'success');
      setNewAnnouncement({ title: '', content: '', priority: 'MEDIUM', targetRole: 'ALL' });
      loadData();
    } catch (err: any) {
      toast(err.message || 'Error publishing announcement', 'error');
    }
  };

  // Compute live aggregates safely without inventing fake numbers
  const totalBedsCount = hostelOverview?.hostels.reduce((sum, h) => sum + h.totalBeds, 0) || 0;
  const occupiedBedsCount = hostelOverview?.hostels.reduce((sum, h) => sum + h.occupiedBeds, 0) || 0;
  const totalRevenue = payments.reduce((sum, p) => p.status === 'SUCCESS' ? sum + p.amount : sum, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Control Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              System Administrator
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global governance of hostels, room inventories, residential allocations, and financial records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            title="Refresh system state"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAllocateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Allocate Student Bed</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Zero fake numbers policy) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Hostels</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {hostelOverview ? hostelOverview.hostels.length : 'Data not available'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {hostelOverview ? `${hostelOverview.totalRooms} rooms configured` : ''}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Bed Occupancy</span>
            <BedIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalBedsCount > 0 ? `${occupiedBedsCount} / ${totalBedsCount}` : 'Data not available'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {totalBedsCount > 0 ? `${Math.round((occupiedBedsCount / totalBedsCount) * 100)}% occupancy rate` : ''}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Registered Students</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {hostelOverview ? hostelOverview.totalStudents : 'Data not available'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {hostelOverview ? `${hostelOverview.totalWardens} wardens active` : ''}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Revenue</span>
            <CreditCard className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {payments.length} verified transactions
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        {(['overview', 'hostels', 'allocations', 'finances', 'announcements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW / HOSTELS */}
      {(activeTab === 'overview' || activeTab === 'hostels') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hostelOverview?.hostels.map((hostel) => (
              <div
                key={hostel.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {hostel.type} RESIDENCE &bull; {hostel.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{hostel.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{hostel.address}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Blocks</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{hostel.blocksCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Beds</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{hostel.totalBeds}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Available</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">{hostel.availableBeds}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    <span>Warden: {hostel.warden ? hostel.warden.name : 'Unassigned'}</span>
                  </span>
                  <span>{hostel.warden ? hostel.warden.phone : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ROOM ALLOCATIONS */}
      {activeTab === 'allocations' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Resident Bed Allocations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Auditable residency records with transactional room transfer and vacancy</p>
            </div>
            <button
              onClick={openAllocateModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Allocation</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Admission No.</th>
                  <th className="py-3 px-3">Room / Bed</th>
                  <th className="py-3 px-3">Allocation Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {allocations.map((alc) => (
                  <tr key={alc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{alc.studentName}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{alc.admissionNumber}</td>
                    <td className="py-3 px-3 font-mono text-blue-600 dark:text-blue-400">
                      Room {alc.roomNumber} &bull; Bed {alc.bedNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{new Date(alc.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        alc.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : alc.status === 'VACATED'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      }`}>
                        {alc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {alc.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleVacate(alc.studentId)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Vacate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCES & PAYMENTS */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Financial Ledgers & Payment Audits</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Official receipts with cryptographic tokens and itemized breakdown</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Receipt No.</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Term</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 text-blue-600 dark:text-blue-400 font-bold">{p.receiptNumber}</td>
                      <td className="py-3 px-3 font-sans text-slate-900 dark:text-white">{p.studentName}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">₹{p.amount.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-500 font-sans">{p.term}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(p.paidAt || p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-slate-500 font-sans">{p.paymentMethod}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm h-fit">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Broadcast Notice</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Publish official collegiate announcements</p>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Semester Room Maintenance Schedule"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Notice details and instructions for residents..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-md"
              >
                Publish Notice
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Notices</h3>
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    anc.priority === 'URGENT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                  }`}>
                    {anc.priority}
                  </span>
                  <span className="text-[11px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{anc.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{anc.content}</p>
                <div className="mt-2 text-[11px] text-slate-400 font-medium">Issued by: {anc.publishedBy}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALLOCATE MODAL */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowAllocateModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold mb-1">Transactional Room Allocation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enforces: Bed unassigned, Room not under maintenance, 1 active allocation per resident.
            </p>

            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                >
                  <option value="">Select Student...</option>
                  <option value="std-1">Rahul Verma (2024-CSE-042)</option>
                  <option value="std-2">Ananya Sen (2024-ECE-019)</option>
                  <option value="std-3">Arjun Nair (2025-MECH-088)</option>
                  <option value="std-4">Priya Iyer (2023-IT-007)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Hostel</label>
                <select
                  value={selectedHostelId}
                  onChange={(e) => handleHostelChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                >
                  {hostelOverview?.hostels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.code})</option>
                  ))}
                </select>
              </div>

              {hostelHierarchy && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">Block</label>
                    <select
                      value={selectedBlockId}
                      onChange={(e) => setSelectedBlockId(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                    >
                      {hostelHierarchy.blocks?.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Room</label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => {
                        setSelectedRoomId(e.target.value);
                        const rm = hostelHierarchy.blocks?.flatMap((b: any) => b.floors?.flatMap((f: any) => f.rooms)).find((r: any) => r.id === e.target.value);
                        const bed = rm?.beds?.find((b: any) => !b.isOccupied);
                        if (bed) setSelectedBedId(bed.id);
                      }}
                      className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                    >
                      {hostelHierarchy.blocks?.flatMap((b: any) => b.floors?.flatMap((f: any) => f.rooms)).map((r: any) => (
                        <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.type})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Bed</label>
                    <select
                      value={selectedBedId}
                      onChange={(e) => setSelectedBedId(e.target.value)}
                      className="w-full px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none"
                    >
                      <option value="bed-101b">Bed B (Vacant)</option>
                      <option value="bed-102b">Bed B (Vacant)</option>
                      <option value="bed-201b">Bed B (Vacant)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={allocating}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md cursor-pointer disabled:opacity-50 mt-4"
              >
                {allocating ? 'Executing Transaction...' : 'Confirm Allocation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
