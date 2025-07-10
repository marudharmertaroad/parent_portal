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
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CreditCard className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Fee Details</h1>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Billable Amount</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalDue)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full"><DollarSign size={24} className="text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full"><CheckCircle size={24} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Balance Due</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full"><TrendingUp size={24} className="text-red-600" /></div>
          </div>
        </div>
      </div>

      {/* Detailed Fee Records Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Payment History & Dues</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-sm text-gray-600">Due Date</th>
                <th className="p-4 font-medium text-sm text-gray-600">Description</th>
                <th className="p-4 font-medium text-sm text-gray-600 text-right">Amount Due</th>
                <th className="p-4 font-medium text-sm text-gray-600 text-center">Status</th>
                <th className="p-4 font-medium text-sm text-gray-600 text-center">Action</th>
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
                    <td className="p-4 text-right font-mono font-semibold text-gray-800">{formatCurrency(record.pendingFees)}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                        <statusInfo.icon size={14} className="mr-1.5" />
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {record.status !== 'Paid' ? (
                        <button
                          onClick={() => handlePayNow(record.pendingFees)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-green-600 font-semibold text-sm">Cleared</span>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">No fee records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeesSection;