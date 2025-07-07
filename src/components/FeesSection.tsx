import React, { useState } from 'react';
import { FeeRecord } from '../types';
import { DollarSign, Calendar, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
  onPayFee: (feeId: string, paymentData: any) => Promise<any>;
}

const FeesSection: React.FC<FeesSectionProps> = ({ feeRecords, onPayFee }) => {
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Calendar size={16} className="text-yellow-600" />;
      case 'overdue':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const totalPending = feeRecords
    .filter(fee => fee.status === 'pending' || fee.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const handlePayNow = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedFee) return;

    setIsProcessing(true);
    try {
      const paymentData = {
        amount: selectedFee.amount,
        feeType: selectedFee.feeType,
        paymentMethod: 'online',
      };

      const response = await onPayFee(selectedFee.id, paymentData);
      
      if (response.success) {
        alert(`Payment of ₹${selectedFee.amount.toLocaleString('en-IN')} for ${selectedFee.feeType} completed successfully! SMS confirmation will be sent shortly. Transaction ID: ${response.data?.transactionId}`);
        setShowPaymentModal(false);
        setSelectedFee(null);
      } else {
        alert(`Payment failed: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <DollarSign size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid This Year</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{feeRecords.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{feeRecords.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign size={20} className="mr-2 text-blue-500" />
            Fee Records
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeRecords.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">₹{fee.amount.toLocaleString('en-IN')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                      {getStatusIcon(fee.status)}
                      <span className="ml-1 capitalize">{fee.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {fee.status === 'pending' || fee.status === 'overdue' ? (
                      <button
                        onClick={() => handlePayNow(fee)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <CreditCard size={16} />
                        <span>Pay Now</span>
                      </button>
                    ) : (
                      <span className="text-green-600 font-medium">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Confirmation</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Fee Type</p>
                <p className="font-medium text-gray-900">{selectedFee.feeType}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-bold text-gray-900">₹{selectedFee.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedFee.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesSection;