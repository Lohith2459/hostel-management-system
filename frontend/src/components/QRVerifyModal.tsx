import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';

interface QRVerifyModalProps {
  token: string | null;
  onClose: () => void;
}

export const QRVerifyModal: React.FC<QRVerifyModalProps> = ({ token, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/finance/receipts/verify/${token}`);
        const json = await res.json();
        if (json.success && json.data.isValid) {
          setData(json.data);
        } else {
          setError(json.message || 'Receipt signature could not be verified.');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with verification authority');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  if (!token) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Digital Receipt Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Public Cryptographic Verification Endpoint</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Verifying tamper-evident token with HostelSphere registry...
          </div>
        ) : error ? (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-rose-300 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Verification Failed</span>
              {error}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Valid & Authenticated Digital Receipt</span>
              </div>
              <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receipt No:</span>
                  <span className="text-white font-bold">{data.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-white">{data.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified Amount:</span>
                  <span className="text-emerald-300 font-bold">₹{data.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid Timestamp:</span>
                  <span>{new Date(data.paidAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800 break-all font-mono">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold mb-1">Signed Token</span>
              {token}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Zero Tampering Detected</span>
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
