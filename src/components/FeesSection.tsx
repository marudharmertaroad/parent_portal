// src/components/FeesSection.tsx

import React from 'react';
import { FeeRecord } from '../types';
import { 
  FileText, // For Tuition Fees
  Bus,      // For Bus Fees
  CreditCard 
} from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
  studentName: string;
}

// The StatCard component is perfect for this summary view.
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

  // --- NEW SIMPLIFIED CALCULATIONS ---
  // Calculate only the total tuition fees for the session
  const totalTuitionFees = safeFeeRecords.reduce((sum, r) => sum + (r.totalFees || 0), 0);
  
  // Calculate only the total bus fees for the session
  const totalBusFees = safeFeeRecords.reduce((sum, r) => sum + (r.busFees || 0), 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header - The title is updated to be more specific */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Fee Structure</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Fee breakdown for the academic session.
            </p>
          </div>
        </div>
      </div>
      
      {/* --- The Core Focus: Fee Structure Breakdown --- */}
      <div className="flex flex-wrap gap-4">
        {/* Card for Tuition Fees */}
        <div className="flex-grow min-w-[150px]">
          <StatCard title="Total Tuition Fees" amount={totalTuitionFees} icon={FileText} color="bg-blue-500" />
        </div>
        
        {/* Card for Bus Fees */}
        <div className="flex-grow min-w-[150px]">
          <StatCard title="Total Bus Fees" amount={totalBusFees} icon={Bus} color="bg-teal-500" />
        </div>
      </div>

      {/* Optional: Add a note for parents */}
      <div className="bg-white rounded-xl shadow-md border p-4 sm:p-6 mt-6">
        <p className="text-sm text-gray-700">
          This is the total fee structure for the current academic session. For payment details, history, and receipts, please contact the school administration office.
        </p>
      </div>

    </div>
  );
};

export default FeesSection;