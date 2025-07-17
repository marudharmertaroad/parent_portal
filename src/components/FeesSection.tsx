// src/components/FeesSection.tsx

import React from 'react';
import { FeeRecord } from '../types';
import { formatDate } from '../utils';
import { 
  DollarSign, CheckCircle, Clock, AlertCircle, CreditCard, 
  TrendingUp, TrendingDown, ArrowLeft, FileText
} from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
  studentName: string;
}

// A more vibrant, reusable card for the summary stats
const StatCard: React.FC<{ title: string; amount: number; icon: React.ElementType; color: string; }> = ({ title, amount, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-md border flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Fee Details</h1>
            <p className="text-gray-600 mt-1">Your complete payment history and outstanding dues.</p>
          </div>
        </div>
      </div>
      
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Billable" amount={totalBillable} icon={FileText} color="bg-blue-500" />
        <StatCard title="Total Paid" amount={totalPaid} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Balance Due" amount={totalDue} icon={DollarSign} color="bg-red-500" />
      </div>

      {/* Fee Records List */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {safeFeeRecords.length > 0 ? safeFeeRecords.map((record) => {
            const status = getStatusInfo(record);
            const isPaid = status.text === 'Paid';
            return (
              <div key={record.recordId} className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center ${isPaid ? 'bg-green-50/50' : ''}`}>
                
                {/* Column 1: Fee Breakdown */}
                <div className="md:col-span-1 space-y-2">
                  <p className="font-bold text-gray-800">Academic Year Invoice</p>
                  <div className="text-sm text-gray-600 border-l-2 pl-3 space-y-1">
                    <p>Tuition Fee: {formatCurrency(record.totalFees)}</p>
                    {record.busFees > 0 && <p>Bus Fee: {formatCurrency(record.busFees)}</p>}
                    {record.discountFees > 0 && <p className="text-green-600">Discount Applied: -{formatCurrency(record.discountFees)}</p>}
                  </div>
                </div>

                {/* Column 2: Status and Dates */}
                <div className="md:col-span-1 flex flex-col items-start md:items-center">
                   <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.color} ${status.bgColor}`}>
                    <status.icon size={16} className="mr-2" />
                    {status.text}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Due Date: {formatDate(record.dueDate)}</p>
                </div>
                
                {/* Column 3: Amount and Actions */}
                <div className="md:col-span-1 flex items-center justify-between md:justify-end gap-4">
                   <div className="text-right">
                    <p className="text-sm text-gray-500">{isPaid ? 'Amount Paid' : 'Amount Due'}</p>
                    <p className={`text-2xl font-bold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(isPaid ? record.paidFees : record.pendingFees)}
                    </p>
                  </div>
                  
                  {isPaid ? (
                    <button onClick={() => handleViewReceipt(record.recordId)} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300">
                      <Receipt size={16} />
                      Receipt
                    </button>
                  ) : (
                    <button onClick={() => handlePayNow(record.pendingFees)} className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm">
                      Pay Now
                    </button>
                  )}
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