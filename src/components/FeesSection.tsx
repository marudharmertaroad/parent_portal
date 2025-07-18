// src/components/FeesSection.tsx

import React from 'react';
import { FeeRecord } from '../types';
import { formatDate } from '../utils';
import { 
  DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, 
  TrendingUp, TrendingDown, ArrowLeft, FileText, Receipt
} from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
  studentName: string;
}

// A more vibrant, reusable card for the summary stats
const StatCard: React.FC<{ title: string; amount: number; icon: React.ElementType; color: string; }> = ({ title, amount, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border flex items-center gap-4">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center`}>
      <Icon size={20} sm:size={24} className="text-white" />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}
      </p>
    </div>
  </div>
);


const FeesSection: React.FC<FeesSectionProps> = ({ feeRecords = [], studentName}) => {
  const safeFeeRecords = Array.isArray(feeRecords) ? feeRecords : [];

  // Safe Calculations
  const totalBillable = safeFeeRecords.reduce((sum, r) => sum + (r.totalFees || 0) + (r.busFees || 0), 0);
  const totalPaid = safeFeeRecords.reduce((sum, r) => sum + (r.paidFees || 0), 0);
  const totalDue = safeFeeRecords.reduce((sum, r) => sum + (r.pendingFees || 0), 0);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  const handlePayNow = (amount: number) => {
    alert(`This would integrate with a payment gateway to pay ${formatCurrency(amount)}.`);
  };
  
  const handleViewReceipt = (recordId: number) => {
    alert(`This would open a receipt modal for record ID: ${recordId}.`);
  };

  const getStatusInfo = (record: FeeRecord) => {
    if ((record.pendingFees || 0) <= 0) {
      return { text: 'Paid', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
    if (new Date(record.dueDate) < new Date()) {
      return { text: 'Overdue', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    return { text: 'Pending', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' };
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - now responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Fee Details</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Payment history and outstanding dues.</p>
          </div>
        </div>
      </div>
      
      {/* Summary Stat Cards */}
      {/* [MOBILE COMPACT] Changed from a rigid grid to a flexible, wrapping layout */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-grow min-w-[150px]"><StatCard title="Total Billable" amount={totalBillable} icon={FileText} color="bg-blue-500" /></div>
        <div className="flex-grow min-w-[150px]"><StatCard title="Total Paid" amount={totalPaid} icon={CheckCircle} color="bg-green-500" /></div>
        <div className="flex-grow min-w-[150px]"><StatCard title="Balance Due" amount={totalDue} icon={DollarSign} color="bg-red-500" /></div>
      </div>

      {/* Fee Records List */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {safeFeeRecords.length > 0 ? safeFeeRecords.map((record) => {
            const status = getStatusInfo(record);
            const isPaid = status.text === 'Paid';
            return (
              // [MOBILE COMPACT] This is the new mobile-first card layout
              <div key={record.recordId} className={`p-4 ${isPaid ? 'bg-green-50/30' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Side: Details & Status */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-800">Academic Year Invoice</p>
                        <div className={`sm:hidden inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bgColor}`}>
                            <status.icon size={14} className="mr-1.5" />
                            {status.text}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 border-l-2 pl-3 mt-2 space-y-1">
                      <p>Tuition Fee: {formatCurrency(record.totalFees)}</p>
                      {record.busFees > 0 && <p>Bus Fee: {formatCurrency(record.busFees)}</p>}
                      {record.discountFees > 0 && <p className="text-green-600">Discount: -{formatCurrency(record.discountFees)}</p>}
                    </div>
                     <p className="text-xs text-gray-500 mt-2">Due Date: {formatDate(record.dueDate)}</p>
                  </div>

                  {/* Right Side: Amount and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded-lg">
                    <div className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.color} ${status.bgColor}`}>
                      <status.icon size={16} className="mr-2" />
                      {status.text}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{isPaid ? 'Amount Paid' : 'Amount Due'}</p>
                      <p className={`text-2xl font-bold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(isPaid ? record.paidFees : record.pendingFees)}
                      </p>
                    </div>
                    
                    {isPaid ? (
                      <button onClick={() => handleViewReceipt(record.recordId)} className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-300">
                        <Receipt size={16} />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    ) : (
                      <button onClick={() => handlePayNow(record.pendingFees)} className="shrink-0 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm">
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center p-12 text-gray-500">
              <p className="font-semibold">No fee records found.</p>
              <p className="text-sm mt-1">Your payment history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeesSection;