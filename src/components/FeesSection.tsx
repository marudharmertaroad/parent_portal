// src/components/FeesSection.tsx

import React from 'react';
import { FeeRecord } from '../types'; // Make sure this path is correct
import { formatDate } from '../utils'; // Make sure this path is correct
import { DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, TrendingUp } from 'lucide-react';

// Define the props the component will accept
interface FeesSectionProps {
  feeRecords: FeeRecord[];
}

const FeesSection: React.FC<FeesSectionProps> = ({ feeRecords = [] }) => {

  // --- Calculations for the Stat Cards ---
  const totalDue = feeRecords.reduce((sum, record) => sum + record.totalFees + record.busFees, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + record.paidFees, 0);
  const totalPending = feeRecords.reduce((sum, record) => sum + record.pendingFees, 0);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handlePayNow = (amount: number) => {
    // In a real application, this would open a payment gateway modal (e.g., Stripe, Razorpay)
    alert(`Simulating payment process...\nOpening payment gateway to pay ${formatCurrency(amount)}.`);
  };

  const getStatusInfo = (status: 'Paid' | 'Pending' | 'Overdue') => {
    switch (status) {
      case 'Paid':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Paid' };
      case 'Pending':
        return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', text: 'Pending' };
      case 'Overdue':
        return { icon: AlertCircle, color: 'text-red-600 bg-red-100', text: 'Overdue' };
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Fee Details</h1>
      </div>

      {/* --- RESPONSIVE FIX: Stats cards now stack on mobile --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border">
            <p className="text-sm font-medium text-gray-600">Total Billable Amount</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalDue)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border">
            <p className="text-sm font-medium text-gray-600">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border">
            <p className="text-sm font-medium text-gray-600">Current Balance Due</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Payment History & Dues</h3>
        </div>
        
        {/* --- RESPONSIVE FIX: Mobile Card View --- */}
        {/* This view is ONLY visible on small screens (hidden on md and up) */}
        <div className="divide-y divide-gray-200 md:hidden">
          {feeRecords.length > 0 ? feeRecords.map(record => {
            const statusInfo = getStatusInfo(record.status);
            return (
              <div key={record.recordId} className="p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-800">Tuition & Other Fees</p>
                  {record.busFees > 0 && <p className="text-xs text-gray-500">+ Bus Fee: {formatCurrency(record.busFees)}</p>}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-medium">{formatDate(record.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                    <statusInfo.icon size={14} className="mr-1" />{statusInfo.text}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Amount Due:</span>
                  <span className="font-bold text-lg text-red-600">{formatCurrency(record.pendingFees)}</span>
                </div>
                {record.status !== 'Paid' && (
                  <button
                    onClick={() => handlePayNow(record.pendingFees)}
                    className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            );
          }) : <div className="text-center p-8 text-gray-500">No fee records found.</div>}
        </div>
        
        {/* --- RESPONSIVE FIX: Desktop Table View --- */}
        {/* This table is HIDDEN on small screens and visible on md and up */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-sm">Due Date</th>
                <th className="p-4 font-medium text-sm">Description</th>
                <th className="p-4 font-medium text-sm text-right">Amount Due</th>
                <th className="p-4 font-medium text-sm text-center">Status</th>
                <th className="p-4 font-medium text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {feeRecords.length > 0 ? feeRecords.map(record => {
                const statusInfo = getStatusInfo(record.status);
                return (
                  <tr key={record.recordId} className="hover:bg-gray-50">
                    <td className="p-4">{formatDate(record.dueDate)}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">Tuition & Other Fees</p>
                      {record.busFees > 0 && <p className="text-xs text-gray-500">+ Bus Fee: {formatCurrency(record.busFees)}</p>}
                    </td>
                    <td className="p-4 text-right font-mono font-semibold">{formatCurrency(record.pendingFees)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        <statusInfo.icon size={14} className="mr-1.5" />{statusInfo.text}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {record.status !== 'Paid' ? (
                        <button onClick={() => handlePayNow(record.pendingFees)} className="...">Pay Now</button>
                      ) : (
                        <span className="text-green-600 font-semibold text-sm">Cleared</span>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">No fee records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeesSection;