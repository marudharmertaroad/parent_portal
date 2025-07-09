import React, { useState } from 'react';
import { FeeRecord } from '../types';
import { DollarSign, Calendar, CheckCircle, AlertCircle, CreditCard, History, Receipt } from 'lucide-react';

interface FeesSectionProps {
  feeRecords: FeeRecord[];
  onPayFee: (feeId: string, paymentData: any) => Promise<any>;
}

const FeesSection: React.FC<FeesSectionProps> = ({ feeRecords, onPayFee }) => {
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
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
      case 'partial':
        return <AlertCircle size={16} className="text-blue-600" />;
      case 'pending':
        return <Calendar size={16} className="text-yellow-600" />;
      case 'overdue':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Calendar size={16} className="text-gray-600" />;
    }
  };

  const totalPending = feeRecords
    .filter(fee => fee.status === 'pending' || fee.status === 'overdue' || fee.status === 'partial')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalPaid = feeRecords
    .reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);

  const totalOverdue = feeRecords
    .filter(fee => fee.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const handlePayNow = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.amount.toString());
    setShowPaymentModal(true);
  };

  const handleViewHistory = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setShowPaymentHistory(true);
  };

  const handlePayment = async () => {
    if (!selectedFee || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedFee.amount) {
      alert('Please enter a valid payment amount');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        amount: amount,
        feeType: selectedFee.feeType,
        paymentMethod: 'online',
      };

      const response = await onPayFee(selectedFee.id, paymentData);
      
      if (response.success) {
        const remainingBalance = response.data?.remainingBalance || 0;
        const message = remainingBalance > 0 
          ? `Partial payment of ₹${amount.toLocaleString('en-IN')} completed successfully! Remaining balance: ₹${remainingBalance.toLocaleString('en-IN')}`
          : `Payment of ₹${amount.toLocaleString('en-IN')} completed successfully!`;
        
        alert(`${message}\nTransaction ID: ${response.data?.transactionId}\nSMS confirmation will be sent shortly.`);
        setShowPaymentModal(false);
        setSelectedFee(null);
        setPaymentAmount('');
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
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</p>
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
              <p className="text-2xl font-bold text-red-600">₹{totalOverdue.toLocaleString('en-IN')}</p>
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
                  Fee Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Breakdown
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feeRecords.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                    {fee.totalAmount && (
                      <div className="text-xs text-gray-500">
                        Total: ₹{fee.totalAmount.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Pending: </span>
                        <span className="text-red-600 font-bold">₹{fee.amount.toLocaleString('en-IN')}</span>
                      </div>
                      {fee.paidAmount && fee.paidAmount > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Paid: </span>
                          <span className="text-green-600">₹{fee.paidAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {fee.discountAmount && fee.discountAmount > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Discount: </span>
                          <span className="text-blue-600">₹{fee.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {(fee.status === 'pending' || fee.status === 'overdue' || fee.status === 'partial') && (
                      <button
                        onClick={() => handlePayNow(fee)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                      >
                        <CreditCard size={14} />
                        <span>Pay</span>
                      </button>
                    )}
                    {fee.paymentHistory && fee.paymentHistory.length > 0 && (
                      <button
                        onClick={() => handleViewHistory(fee)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                      >
                        <History size={14} />
                        <span>History</span>
                      </button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Receipt size={20} className="mr-2 text-blue-500" />
              Payment Details
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Fee Type</p>
                <p className="font-medium text-gray-900">{selectedFee.feeType}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="font-bold text-red-600">₹{selectedFee.amount.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedFee.dueDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedFee.amount}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount to pay"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can pay any amount up to ₹{selectedFee.amount.toLocaleString('en-IN')}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !paymentAmount || parseFloat(paymentAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History size={20} className="mr-2 text-blue-500" />
              Payment History - {selectedFee.feeType}
            </h3>
            
            {selectedFee.paymentHistory && selectedFee.paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {selectedFee.paymentHistory.map((payment, index) => (
                  <div key={payment.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Payment #{index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{payment.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No payment history available</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPaymentHistory(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesSection;