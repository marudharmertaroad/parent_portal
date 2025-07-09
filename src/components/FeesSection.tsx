import React from 'react';
import { FeeRecord } from '../types';
import { DollarSign } from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
}

const FeesSection: React.FC<FeesSectionProps> = ({ feeRecords }) => (
  <div className="bg-white rounded-xl shadow-md border p-6">
    <h2 className="text-2xl font-bold mb-4">Fee Payment History</h2>
    <div className="space-y-4">
      {feeRecords.map(fee => (
        <div key={fee.recordId} className="p-4 border rounded-lg flex justify-between items-center">
          <div>
            <p className="font-semibold">Due Date: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</p>
            <p className="text-sm text-gray-500">Total Billable: ₹{fee.totalFees + fee.busFees}</p>
          </div>
          <div className={`text-right ${fee.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
            <p className="font-bold text-lg">₹{fee.pendingFees.toLocaleString('en-IN')}</p>
            <p className="text-sm font-medium">{fee.status}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FeesSection;