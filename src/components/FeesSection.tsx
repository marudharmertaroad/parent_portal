// src/components/FeesSection.tsx

import React from 'react';
import { FeeRecord } from '../types';
import { 
  DollarSign, 
  CheckCircle, 
  FileText, 
  CreditCard 
} from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
  studentName: string; // studentName is kept for potential future use (e.g., "Fee Details for [Student Name]")
}

// The StatCard component is perfect for this summary view and remains unchanged.
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

const FeesSection: React.FC<FeesSectionProps> = ({ feeRecords = [] }) => {
  // Ensure feeRecords is always an array to prevent errors
  const safeFeeRecords = Array.isArray(feeRecords) ? feeRecords : [];

  // --- Calculations remain the same, as they are needed for the summary ---
  const totalBillable = safeFeeRecords.reduce((sum, r) => sum + (r.totalFees || 0) + (r.busFees || 0), 0);
  const totalPaid = safeFeeRecords.reduce((sum, r) => sum + (r.paidFees || 0), 0);
  const totalDue = safeFeeRecords.reduce((sum, r) => sum + (r.pendingFees || 0), 0);

  // REMOVED: handlePayNow, handleViewReceipt, getStatusInfo, and formatDate are no longer needed.

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - The title is updated for clarity */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Fee Summary</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              A summary of your fees for the academic session.
            </p>
          </div>
        </div>
      </div>
      
      {/* --- The Core Focus: Summary Stat Cards --- */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-grow min-w-[150px]">
          <StatCard title="Total Fees (Tuition + Bus)" amount={totalBillable} icon={FileText} color="bg-blue-500" />
        </div>
        <div className="flex-grow min-w-[150px]">
          <StatCard title="Total Paid" amount={totalPaid} icon={CheckCircle} color="bg-green-500" />
        </div>
        <div className="flex-grow min-w-[150px]">
          <StatCard title="Balance Due" amount={totalDue} icon={DollarSign} color="bg-red-500" />
        </div>
      </div>

      {/* --- REMOVED: The entire "Transaction History" block has been deleted. --- */}
      {/* The component now ends here, providing a clean and simple view. */}

    </div>
  );
};

export default FeesSection;