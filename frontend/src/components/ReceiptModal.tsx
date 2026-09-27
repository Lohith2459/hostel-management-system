import React from 'react';
import { OfficialReceipt } from '../types/index.js';
import { X, Printer, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  receipt: OfficialReceipt | null;
  onClose: () => void;
  onOpenQR: (token: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose, onOpenQR }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-1.5 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Official Collegiate Payment Receipt</span>
          </div>
          <h2 className="text-xl font-bold">{receipt.institution.name}</h2>
          <p className="text-xs text-blue-100/80 mt-0.5">Central Residential Fee Administration &bull; Automated Stamp</p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Status Badge & Receipt Numbers */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Receipt Number</div>
              <div className="text-base font-mono font-bold text-blue-600">{receipt.receiptNumber}</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{receipt.status}</span>
              </span>
              <div className="text-[10px] text-slate-400 mt-1">Verified Gateway Simulation</div>
            </div>
          </div>

          {/* Student & Allocation Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Student Name:</span>
              <span className="font-semibold text-slate-900">{receipt.student.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Admission Number:</span>
              <span className="font-semibold text-slate-900 font-mono">{receipt.student.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Department:</span>
              <span className="font-semibold text-slate-900">{receipt.student.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Room:</span>
              <span className="font-semibold text-slate-900">{receipt.student.room}</span>
            </div>
          </div>

          {/* Fee Itemization Breakdown */}
          {receipt.feeBreakdown && (
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Fee Schedule ({receipt.feeBreakdown.term} {receipt.feeBreakdown.academicYear})
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Hostel Room Rent & Amenities</span>
                  <span className="font-mono text-slate-900">₹{receipt.feeBreakdown.roomRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Mess & Dining Charges</span>
                  <span className="font-mono text-slate-900">₹{receipt.feeBreakdown.messFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Facility Maintenance & Utilities</span>
                  <span className="font-mono text-slate-900">₹{receipt.feeBreakdown.maintenanceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span className="font-mono text-blue-700 text-base">₹{receipt.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Audit Metadata */}
          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Transaction ID:</span>
              <span className="text-slate-800 font-semibold">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Date:</span>
              <span className="text-slate-800">{new Date(receipt.paymentDate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="text-slate-800">{receipt.paymentMethod}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200">
            <button
              onClick={() => onOpenQR(receipt.verificationToken)}
              className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer border border-slate-300"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>Verify Digital Token</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
