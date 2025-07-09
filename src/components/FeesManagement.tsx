import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  CreditCard,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Receipt,
  Bus,
  PlusCircle,
  Settings
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useMedium } from '../context/MediumContext';
import { getAutoFees } from '../utils/fees';
import { useClassOptions } from '../hooks/useClassOptions';
import { ALL_BUS_ROUTES, preloadAllFees } from '../utils/fees';




import { Student } from './StudentManagement'; // Import from StudentManagement

// INTERFACES
interface FeeRecord {
  recordId: number;
  studentId: string;
  studentName?: string;
  class?: number | string;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  discountFees: number;
  discountGivenBy?: string;
  turnover: number;
  busFees: number;
  dueDate: string;
  lastPaymentDate?: string | null;
}

// Type for the form state
type NewFeeRecordState = {
  studentId: string;
  class: string | number;
  totalFees: number;
  paidFees: number;
  discountFees: number;
  discountGivenBy: string;
  busFees: number;
  dueDate: string;
  lastPaymentDate: string | null;
};

// Props interface for the AddFeeModal component
interface AddFeeModalProps {
  newFeeRecord: NewFeeRecordState;
  setNewFeeRecord: React.Dispatch<React.SetStateAction<NewFeeRecordState>>;
  students: Student[];
  classOptions: { value: string | number; label: string }[];
  setShowAddModal: (show: boolean) => void;
  handleAddFeeRecord: () => void;
  getBusFees: (route: string) => number;
  formatCurrency: (amount: number) => string;
}

const AddFeeModal: React.FC<AddFeeModalProps> = ({
  newFeeRecord,
  setNewFeeRecord,
  students,
  classOptions,
  setShowAddModal,
  handleAddFeeRecord,
  getBusFees,
  formatCurrency
}) => {
  // State to manage the class filter within the modal
  const [selectedClassForModal, setSelectedClassForModal] = useState('');
  const busRouteOptions = [
    { value: 'None', label: 'No Bus Service' },
    { value: 'Local', label: 'Local' },
    { value: 'Merta Road', label: 'Merta Road' },
    { value: 'Deswal', label: 'Deswal' },
    { value: 'Oladan', label: 'Oladan' },
    { value: 'Siradhna', label: 'Siradhna' },
    { value: 'Dadhwara', label: 'Dadhwara' },
    { value: 'Gaguda', label: 'Gaguda' },
    { value: 'Veer Teja Nagar', label: 'Veer Teja Nagar' },
    { value: 'Chhapri', label: 'Chhapri' },
    { value: 'Kumpdas', label: 'Kumpdas' },
    { value: 'Bajado Ki Dhani', label: 'Bajado Ki Dhani' },
    { value: 'Kolio Ki Dhani', label: 'Kolio Ki Dhani' },
    { value: 'Riyan Shyamdas', label: 'Riyan Shyamdas' },
    { value: 'Jogi Magra', label: 'Jogi Magra' },
    { value: 'Jaisas', label: 'Jaisas' },
    { value: 'Jarora', label: 'Jarora' },
    { value: 'Bashni Seja', label: 'Bashni Seja' },
    { value: 'Lai', label: 'Lai' },
    { value: 'Gangarda', label: 'Gangarda' },
    { value: 'Sirsila', label: 'Sirsila' },
  ]

  const handleBusRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoute = e.target.value;
    const fee = getBusFees(selectedRoute);
    setNewFeeRecord(prev => ({ ...prev, busFees: fee }));
  };

  // Filter students based on the selected class
  const filteredStudentsForModal = selectedClassForModal
    ? students.filter(s => s.class.toString() === selectedClassForModal)
    : [];

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClass = e.target.value;
    setSelectedClassForModal(newClass);
    // Reset student selection when class changes to prevent mismatches
    setNewFeeRecord(prev => ({ ...prev, studentId: '', class: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Fee Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1. Select Class *</label>
              <select
                value={selectedClassForModal}
                onChange={handleClassChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a class first</option>
                {classOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2. Select Student *</label>
              <select
                value={newFeeRecord.studentId}
                onChange={(e) => setNewFeeRecord(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={!selectedClassForModal}
              >
                <option value="">Select a student</option>
                {filteredStudentsForModal.map(student => (
                  <option key={student.srNo} value={student.srNo}>
                    {student.name} - {student.srNo}
                  </option>
                ))}
              </select>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <input type="text" value={newFeeRecord.class || ''} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Fees (Auto-calculated)</label>
              <input type="number" value={newFeeRecord.totalFees} onChange={(e) => setNewFeeRecord(prev => ({ ...prev, totalFees: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Service</label>
              <select
                onChange={handleBusRouteChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {busRouteOptions.map(route => (
                  <option key={route.value} value={route.value}>{route.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Fees</label>
              <input type="number" value={newFeeRecord.paidFees} onChange={(e) => setNewFeeRecord(prev => ({ ...prev, paidFees: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Fees</label>
              <input type="number" value={newFeeRecord.discountFees} onChange={(e) => setNewFeeRecord(prev => ({ ...prev, discountFees: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Given By</label>
              <select value={newFeeRecord.discountGivenBy} onChange={(e) => setNewFeeRecord(prev => ({ ...prev, discountGivenBy: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select Authority</option>
                <option value="Uttam Kanwar">Uttam Kanwar</option>
                <option value="Gajendra Singh">Gajendra Singh</option>
                <option value="Parveen Sharma">Parveen Sharma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input type="date" value={newFeeRecord.dueDate} onChange={(e) => setNewFeeRecord(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Payment Date (Optional)</label>
              <input type="date" value={newFeeRecord.lastPaymentDate || ''} onChange={(e) => setNewFeeRecord(prev => ({ ...prev, lastPaymentDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Fee Calculation Summary</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Pending: {formatCurrency(Math.max(0, newFeeRecord.totalFees + newFeeRecord.busFees - newFeeRecord.paidFees - newFeeRecord.discountFees))}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleAddFeeRecord} disabled={!newFeeRecord.studentId || !newFeeRecord.dueDate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Add Fee Record</button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ViewRecordModalProps {
  record: FeeRecord;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null) => string;
}

const ViewRecordModal: React.FC<ViewRecordModalProps> = ({ record, onClose, formatCurrency, formatDate }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg w-full max-w-lg">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Fee Record Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 -mt-2 -mr-2 p-2 text-2xl">×</button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Student Information</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><strong className="text-gray-500">Name:</strong> {record.studentName}</p>
              <p><strong className="text-gray-500">Student ID:</strong> {record.studentId}</p>
              <p><strong className="text-gray-500">Class:</strong> {(record.class)}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Financial Details</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><strong className="text-gray-500">Total Fees:</strong> {formatCurrency(record.totalFees)}</p>
              <p><strong className="text-green-600">Paid Fees:</strong> {formatCurrency(record.paidFees)}</p>
              <p><strong className="text-purple-600">Bus Fees:</strong> {formatCurrency(record.busFees)}</p>
              <p><strong className="text-orange-600">Discount:</strong> {formatCurrency(record.discountFees)}</p>
              <p className="col-span-2 font-bold text-lg text-red-600">
                <strong className="text-gray-600">Pending Fees:</strong> {formatCurrency(record.pendingFees)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Additional Information</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><strong className="text-gray-500">Discount By:</strong> {record.discountGivenBy || 'N/A'}</p>
              <p><strong className="text-gray-500">Due Date:</strong> {formatDate(record.dueDate)}</p>
              <p><strong className="text-gray-500">Last Payment:</strong> {formatDate(record.lastPaymentDate)}</p>
              <p><strong className="text-gray-500">Turnover:</strong> {formatCurrency(record.turnover)}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  </div>
);

interface FeeReceiptModalProps {
  record: FeeRecord;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null) => string;
}

const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ record, onClose, formatCurrency, formatDate }) => {
  const handlePrint = () => {
    window.print();
  };
  const totalDue = record.totalFees + record.busFees;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>{`
        @media print { 
          body * { visibility: hidden; } 
          #printable-fee-receipt, #printable-fee-receipt * { visibility: visible; } 
          #printable-fee-receipt { 
            position: absolute; left: 0; top: 0; width: 100%; 
            height: 100%; border: none; box-shadow: none; 
            margin: 0; padding: 20px; 
          } 
          .no-print { display: none; } 
        }
      `}</style>
      <div className="bg-white rounded-lg w-full max-w-2xl flex flex-col">
          <div className="p-8 overflow-auto" id="printable-fee-receipt">
            <div className="text-center mb-8 border-b-2 border-gray-400 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Marudhar Defence School</h2>
              <p className="text-xl text-gray-600">Fee Payment Receipt</p>
              <p className="text-md text-gray-500">Session: 2024-2025</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <h3 className="font-semibold text-gray-600 mb-1">Billed To:</h3>
                <p className="font-bold">{record.studentName}</p>
                <p>Class: {record.class}</p>
                <p>Student ID: {record.studentId}</p>
              </div>
              <div className="text-right">
                <p><strong>Receipt No:</strong> {record.recordId}</p>
                <p><strong>Payment Date:</strong> {formatDate(record.lastPaymentDate)}</p>
              </div>
            </div>
            
            <table className="w-full text-sm mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left font-semibold">Description</th>
                  <th className="p-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-2">Tuition Fees</td><td className="p-2 text-right">{formatCurrency(record.totalFees)}</td></tr>
                {record.busFees > 0 && <tr className="border-b"><td className="p-2">Bus Fees</td><td className="p-2 text-right">{formatCurrency(record.busFees)}</td></tr>}
                {record.discountFees > 0 && <tr className="border-b"><td className="p-2">Discount</td><td className="p-2 text-right">-{formatCurrency(record.discountFees)}</td></tr>}
              </tbody>
              <tfoot>
                <tr className="font-semibold"><td className="p-2 text-right">Total Due:</td><td className="p-2 text-right">{formatCurrency(totalDue)}</td></tr>
                <tr className="font-semibold"><td className="p-2 text-right">Total Paid:</td><td className="p-2 text-right">{formatCurrency(record.paidFees)}</td></tr>
                <tr className="bg-gray-800 text-white text-lg"><td className="p-3 text-right font-bold">Balance Due:</td><td className="p-3 text-right font-bold">{formatCurrency(record.pendingFees)}</td></tr>
              </tfoot>
            </table>

            <div className="mt-24 text-sm text-right">
              <div className="inline-block text-center">
                <div className="border-t-2 border-gray-400 pt-2 px-12">Authorized Signature</div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 p-4 border-t no-print">
            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Close</button>
            <button onClick={handlePrint} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Print Receipt</button>
          </div>
      </div>
    </div>
  );
};

interface EditFeeModalProps {
  record: FeeRecord;
  onSave: (updatedRecord: FeeRecord) => void;
  onCancel: () => void;
  getBusFees: (route: string) => number;
  formatCurrency: (amount: number) => string;
}

const EditFeeModal: React.FC<EditFeeModalProps> = ({ record, onSave, onCancel, getBusFees, formatCurrency }) => {
  const [editedRecord, setEditedRecord] = useState<FeeRecord>(record);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
  const busRouteOptions = [
    { value: 'None', label: 'No Bus Service' },
    { value: 'Local', label: 'Local' }, { value: 'Merta Road', label: 'Merta Road' }, { value: 'Deswal', label: 'Deswal' },
    { value: 'Oladan', label: 'Oladan' }, { value: 'Siradhna', label: 'Siradhna' }, { value: 'Dadhwara', label: 'Dadhwara' },
    { value: 'Gaguda', label: 'Gaguda' }, { value: 'Veer Teja Nagar', label: 'Veer Teja Nagar' }, { value: 'Chhapri', label: 'Chhapri' },
    { value: 'Kumpdas', label: 'Kumpdas' }, { value: 'Bajado Ki Dhani', label: 'Bajado Ki Dhani' }, { value: 'Kolio Ki Dhani', label: 'Kolio Ki Dhani' },
    { value: 'Riyan Shyamdas', label: 'Riyan Shyamdas' }, { value: 'Jogi Magra', label: 'Jogi Magra' }, { value: 'Jaisas', label: 'Jaisas' },
    { value: 'Jarora', label: 'Jarora' }, { value: 'Bashni Seja', label: 'Bashni Seja' }, { value: 'Lai', label: 'Lai' },
    { value: 'Gangarda', label: 'Gangarda' }, { value: 'Sirsila', label: 'Sirsila' },
  ];

  useEffect(() => {
    const totalDue = editedRecord.totalFees + editedRecord.busFees;
    const totalDeducted = editedRecord.paidFees + editedRecord.discountFees;
    const pending = totalDue - totalDeducted;
    const turnoverCalc = editedRecord.totalFees - editedRecord.discountFees;
    setEditedRecord(prev => ({
      ...prev,
      pendingFees: Math.max(0, pending),
      turnover: Math.max(0, turnoverCalc)
    }));
  }, [editedRecord.totalFees, editedRecord.busFees, editedRecord.paidFees, editedRecord.discountFees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['totalFees', 'paidFees', 'discountFees', 'busFees'].includes(name);
    setEditedRecord(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
  };

  const handleAddPayment = () => {
    if (newPaymentAmount <= 0) return;
    setEditedRecord(prev => ({
      ...prev,
      paidFees: prev.paidFees + newPaymentAmount,
      lastPaymentDate: new Date().toISOString().split('T')[0]
    }));
    setNewPaymentAmount(0);
  };

  const handleBusRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fee = getBusFees(e.target.value);
    setEditedRecord(prev => ({ ...prev, busFees: fee }));
  };

  const handleSaveClick = () => onSave(editedRecord);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Fee Record for {record.studentName}</h3>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-green-800 mb-2">Add New Payment Installment</h4>
              <div className="flex items-end space-x-2">
                  <div className="flex-grow"><label className="block text-sm font-medium text-gray-700 mb-1">Amount</label><input type="number" placeholder="Enter amount to add" value={newPaymentAmount || ''} onChange={(e) => setNewPaymentAmount(parseFloat(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div>
                  <button onClick={handleAddPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"><PlusCircle className="w-4 h-4 mr-2"/>Add Payment</button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Fees</label><input type="number" name="totalFees" value={editedRecord.totalFees} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bus Service</label>
                <select onChange={handleBusRouteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue={busRouteOptions.find(o => getBusFees(o.value) === editedRecord.busFees)?.value || 'None'}>
                    {busRouteOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Total Paid Fees (Read-only)</label><input type="number" name="paidFees" value={editedRecord.paidFees} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount Fees</label><input type="number" name="discountFees" value={editedRecord.discountFees} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount Given By</label><select name="discountGivenBy" value={editedRecord.discountGivenBy || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Select Authority</option><option value="Uttam Kanwar">Uttam Kanwar</option><option value="Gajendra Singh">Gajendra Singh</option><option value="Parveen Sharma">Parveen Sharma</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" name="dueDate" value={editedRecord.dueDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Payment Date</label><input type="date" name="lastPaymentDate" value={editedRecord.lastPaymentDate || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4"><h4 className="font-medium text-blue-800 mb-2">Calculation Summary</h4><div className="text-sm text-blue-700"><p>Pending: {formatCurrency(editedRecord.pendingFees)}</p></div></div>
          <div className="flex space-x-3"><button onClick={onCancel} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleSaveClick} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button></div>
        </div>
      </div>
    </div>
  );
};

interface FeesManagementProps {
  students: Student[];
  loadingStudents: boolean;
}
const TuitionFeeEditorModal = ({ isOpen, onClose, classOptions, medium }: any) => {
    const [fees, setFees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFees = async () => {
        if (!medium) return; // Don't fetch if no medium
        setLoading(true);
        const { data } = await supabase
            .from('tuition_fees')
            .select('*')
            .eq('medium', medium); // Only fetch fees for the current medium
        
        // Create a map for quick lookups
        const feeMap = new Map(data?.map(f => [f.class_name, f]));
        
        // Build the full list, creating default entries for classes without a saved fee
        const fullFeeList = classOptions.map((opt: any) => 
            feeMap.get(opt.value) || { class_name: opt.value, medium: medium, fee_amount: 0 }
        );
        setFees(fullFeeList);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            fetchFees();
        }
    }, [isOpen, medium]);

    const handleFeeChange = (className: string, amount: number) => {
        setFees(currentFees =>
            currentFees.map(fee =>
                fee.class_name === className ? { ...fee, fee_amount: amount } : fee
            )
        );
    };

    const handleSave = async () => {
        // We only save the fees for the current medium
        const { error } = await supabase.from('tuition_fees').upsert(fees, { onConflict: 'class_name,medium' });
        if (error) {
            alert("Error saving tuition fees: " + error.message);
        } else {
            alert(`Tuition fees for ${medium} Medium updated successfully!`);
            await preloadAllFees();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Edit Tuition Fees ({medium} Medium)</h3>
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {/* THE NEW, SINGLE-COLUMN LAYOUT */}
                        {fees.map((fee, index) => (
                            <div key={fee.class_name} className="grid grid-cols-2 gap-4 items-center">
                                <span className="font-medium">{fee.class_name}</span>
                                <input
                                    type="number"
                                    value={fee.fee_amount || ''}
                                    onChange={e => handleFeeChange(fee.class_name, parseInt(e.target.value) || 0)}
                                    placeholder="Fee Amount"
                                    className="p-2 border border-gray-300 rounded-md w-full"
                                />
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Save Fees</button>
                </div>
            </div>
        </div>
    );
};
const BusFeeEditorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    // State to hold the fee data as a map: { 'Local': 2000, 'Deswal': 10000 }
    const [feeMap, setFeeMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchFees = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('bus_fees').select('*');
                if (error) {
                    console.error("Error fetching bus fees:", error);
                } else {
                    const newFeeMap: Record<string, number> = {};
                    data?.forEach(fee => {
                        newFeeMap[fee.route_name] = fee.fee_amount;
                    });
                    setFeeMap(newFeeMap);
                }
                setLoading(false);
            };
            fetchFees();
        }
    }, [isOpen]);

    const handleFeeChange = (routeName: string, amount: number) => {
        setFeeMap(prevMap => ({
            ...prevMap,
            [routeName]: amount,
        }));
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        // Convert the map back into the format Supabase needs for upsert
        const recordsToUpsert = Object.entries(feeMap).map(([route_name, fee_amount]) => ({
            route_name,
            fee_amount,
        }));

        const { error } = await supabase.from('bus_fees').upsert(recordsToUpsert, { onConflict: 'route_name' });
        
        setLoading(false);
        if (error) {
            alert("Error saving bus fees: " + error.message);
        } else {
            alert("Bus fees updated successfully!");
            await preloadAllFees(); // Refresh the global cache with new fees
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Edit Bus Fees</h3>
                <p className="text-gray-600 mb-6">Set the fee for each available bus route. Set to 0 to make a route free.</p>
                
                {loading ? <p>Loading...</p> : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4 items-center sticky top-0 bg-gray-100 p-2 rounded-t-lg">
                            <span className="font-semibold text-gray-700">Route Name</span>
                            <span className="font-semibold text-gray-700">Fee Amount (₹)</span>
                        </div>
                        {ALL_BUS_ROUTES.map(route => {
                            // Don't show an editor for the "None" option
                            if (route === 'None') return null;

                            const feeAmount = feeMap[route] || 0;
                            return (
                                <div key={route} className="grid grid-cols-2 gap-4 items-center">
                                    <span className="font-medium">{route}</span>
                                    <input
                                        type="number"
                                        value={feeAmount}
                                        onChange={e => handleFeeChange(route, parseInt(e.target.value) || 0)}
                                        placeholder="Fee Amount"
                                        className="p-2 border border-gray-300 rounded-md w-full"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSaveChanges} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
const FeesManagement: React.FC<FeesManagementProps> = ({ students, loadingStudents }) => {
    const { medium } = useMedium();
    const classOptions = useClassOptions();
   const [showTuitionEditor, setShowTuitionEditor] = useState(false);
      const [showBusFeeEditor, setShowBusFeeEditor] = useState(false);



  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterClass, setSelectedFilterClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState<FeeRecord | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<FeeRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeeRecord | null>(null);
  useEffect(() => {
        // Load all fee structures into the cache when the component first mounts
        preloadAllFees();
    }, []);

  const initialNewFeeState: NewFeeRecordState = {
    studentId: '', class: '', totalFees: 0, paidFees: 0,
    discountFees: 0, discountGivenBy: '', busFees: 0, dueDate: '', lastPaymentDate: null
  };
  const [newFeeRecord, setNewFeeRecord] = useState(initialNewFeeState);

    const getAutoFees = (studentClass: string): number => {
    switch (studentClass) {
        case 'Nursery': case 'L.K.G': case 'U.K.G': return 15000;
        case 'First': case 'Second': return 12500;
        case 'Third': case 'Fourth': return 13500;
        case 'Fifth': return 14000;
        case 'Sixth': case 'Seventh': return 14500;
        case 'Eighth': return 16000;
        case 'Ninth': return 17000;
        case 'Tenth': return 19000;
        case '11th Arts': return 19000;
        case '11th Science': return 28000;
        case '12th Arts': return 21000;
        case '12th Science': return 30000;
        default: return 0;
    }
  };
 const getBusFees = (route: string): number => {
switch (route) {
case 'Local':
return 2000;
case 'Merta Road':
return 5000;
case 'Deswal':
return 10000;
case 'Oladan':
return 9000;
case 'Siradhna':
return 8500;
case 'Gaguda':
return 8000;
case 'Veer Teja Nagar':
return 7500;
case 'Chhapri':
return 7500;
case 'Kumpdas':
return 7000;
case 'Bajado Ki Dhani':
return 7000;
case 'Kolio Ki Dhani':
return 8000;
case 'Riyan Shyamdas':
return 7500;
case 'Jogi Magra':
return 8500;
case 'Jaisas':
return 8000;
case 'Jarora':
return 7000;
case 'Bashni Seja':
return 7500;
case 'Lai':
return 6500;
case 'Gangarda':
return 6500;
case 'Sirsila':
return 8000;

      default: return 0;
    }
  };

  const fetchFeeRecords = async () => {
    if (!medium) {
      setFeeRecords([]);
      setLoading(false);
      return;
    }
  
    setLoading(true);
    const { data, error } = await supabase
      .from('fee_records')
.select('*, students!inner(name, medium)')
      .eq('students.medium', medium)
      .order('created_at', { ascending: false });
    if (error) { console.error('Error fetching fee records:', error); }
    else {
      const mappedRecords = data.map((record: any) => ({
        recordId: record.id, studentId: record.student_id, studentName: record.students?.name || 'N/A',
        class: record.class, totalFees: parseFloat(record.total_fees), paidFees: parseFloat(record.paid_fees),
        pendingFees: parseFloat(record.pending_fees), discountFees: parseFloat(record.discount_fees) || 0,
        discountGivenBy: record.discount_given_by, turnover: parseFloat(record.turnover) || 0,
        busFees: parseFloat(record.bus_fees) || 0, dueDate: record.due_date, lastPaymentDate: record.last_payment_date,
      }));
      setFeeRecords(mappedRecords);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeeRecords();
  }, [medium]);

  useEffect(() => {
    const handleFocus = () => {
      console.log('Fees management tab focused. Refetching data...');
      fetchFeeRecords();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  useEffect(() => {
    const fetchStudentDetailsAndSetFees = async () => {
      if (!newFeeRecord.studentId || !medium) {
        setNewFeeRecord(prev => ({ ...prev, class: '', totalFees: 0, busFees: 0 }));
        return;
      }

      const { data: student, error } = await supabase
        .from('students')
        .select('class, bus_route, is_rte, medium')
        .eq('sr_no', newFeeRecord.studentId)
        .eq('medium', medium) // AND filter by the correct medium
        .single();

      if (error || !student) {
        console.error("Failed to fetch student details for fee calculation:", error);
        alert(`Could not find student with SR No: ${newFeeRecord.studentId} in the ${medium} medium.`);
        return;
      }

      if (student.is_rte) {
        alert('This is an RTE student. No fees should be generated.');
        setShowAddModal(false);
        setNewFeeRecord(initialNewFeeState);
      } else {
        const autoTuitionFees = getAutoFees(student.class);
        const autoBusFees = getBusFees(student.bus_route || '');

        setNewFeeRecord(prev => ({
          ...prev,
          class: student.class,
          totalFees: autoTuitionFees,
busFees: autoBusFees,        }));
      }
    };

    fetchStudentDetailsAndSetFees();
  }, [newFeeRecord.studentId, medium]); // Also added 'medium' to the dependency array for correctness.
  
  const handleAddFeeRecord = async () => {
    if (!newFeeRecord.studentId || !newFeeRecord.dueDate) {
      alert('Please select a student and set a due date.');
      return;
    }
    const isDuplicate = feeRecords.some(record => record.studentId === newFeeRecord.studentId);
    if (isDuplicate) {
      alert('This student already has a fee record. Please find and edit the existing one.');
      return;
    }
    const totalDue = newFeeRecord.totalFees + newFeeRecord.busFees;
    const totalPaid = newFeeRecord.paidFees + newFeeRecord.discountFees;
    const pendingFees = totalDue - totalPaid;
    const turnover = newFeeRecord.totalFees - newFeeRecord.discountFees;

    const { error } = await supabase.from('fee_records').insert({
      student_id: newFeeRecord.studentId, class: newFeeRecord.class, total_fees: newFeeRecord.totalFees,
      paid_fees: newFeeRecord.paidFees, pending_fees: pendingFees < 0 ? 0 : pendingFees, discount_fees: newFeeRecord.discountFees,
      discount_given_by: newFeeRecord.discountGivenBy, turnover: turnover < 0 ? 0 : turnover, bus_fees: newFeeRecord.busFees,
      due_date: newFeeRecord.dueDate, last_payment_date: newFeeRecord.lastPaymentDate || null
    });

    if (error) {
      console.error('Error adding fee record:', error);
      alert('Error: ' + error.message);
    } else {
      fetchFeeRecords();
      setNewFeeRecord(initialNewFeeState);
      setShowAddModal(false);
    }
  };

  const handleDeleteFeeRecord = async (recordId: number) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      const { error } = await supabase.from('fee_records').delete().eq('id', recordId);
      if (error) console.error('Error deleting fee record:', error);
      else fetchFeeRecords();
    }
  };

  const handleGenerateReceipt = (record: FeeRecord) => {
    setReceiptRecord(record);
    setShowReceiptModal(true);
  };
  
  const handleViewDetails = (record: FeeRecord) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };
  
  const handleEditClick = (record: FeeRecord) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };
  
  const handleUpdateFeeRecord = async (updatedRecord: FeeRecord) => {
    const { error } = await supabase
      .from('fee_records')
      .update({
        total_fees: updatedRecord.totalFees, paid_fees: updatedRecord.paidFees,
        pending_fees: updatedRecord.pendingFees, discount_fees: updatedRecord.discountFees,
        discount_given_by: updatedRecord.discountGivenBy, turnover: updatedRecord.turnover,
        bus_fees: updatedRecord.busFees, due_date: updatedRecord.dueDate,
        last_payment_date: updatedRecord.lastPaymentDate || null
      })
      .eq('id', updatedRecord.recordId);
      
    if (error) {
      console.error('Error updating fee record:', error);
      alert('Error updating record: ' + error.message);
    } else {
      alert('Record updated successfully!');
      setShowEditModal(false);
      setEditingRecord(null);
      fetchFeeRecords();
    }
  };
  
  const filteredRecords = feeRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = record.studentName?.toLowerCase().includes(searchLower) || record.studentId.includes(searchLower);
    const matchesClass = selectedFilterClass === 'all' || record.class?.toString() === selectedFilterClass;
    
    // The old logic that tried to find the student in the 'students' prop is gone.
    // It's no longer necessary because the data is perfectly filtered from the database.
    return matchesSearch && matchesClass;
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
const totalBillableAmount = feeRecords.reduce((sum, record) => sum + record.totalFees + record.busFees, 0);
  const totalPaid = feeRecords.reduce((sum, record) => sum + record.paidFees, 0);
  const totalPending = feeRecords.reduce((sum, record) => sum + record.pendingFees, 0);
const totalDiscount = feeRecords.reduce((sum, record) => sum + record.discountFees, 0);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="text-2xl font-bold text-gray-900">Fees Management</h2><p className="text-gray-600 mt-1">Manage student fees, payments, and financial records</p></div>
          <div className="mt-4 lg:mt-0 flex space-x-3"><button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4 mr-2" />Add Fee Record</button><div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                            <button onClick={() => setShowTuitionEditor(true)} className="flex items-center px-3 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Settings className="w-4 h-4 mr-2" />Tuition Fees
                            </button>
                            <button onClick={() => setShowBusFeeEditor(true)} className="flex items-center px-3 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Bus className="w-4 h-4 mr-2" />Bus Fees
                            </button>
                        </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Download className="w-4 h-4 mr-2" />Export Report</button></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Billable</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBillableAmount)}</p>
            </div>
        </div>
    </div>
        <div className="bg-white rounded-lg p-6 shadow-md"><div className="flex items-center"><div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Collected</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p></div></div></div>
        <div className="bg-white rounded-lg p-6 shadow-md"><div className="flex items-center"><div className="p-2 bg-yellow-100 rounded-lg"><TrendingUp className="w-6 h-6 text-yellow-600" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Pending</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPending)}</p></div></div></div>
        <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center">
            {/* ICON & COLOR CHANGE: Changed from purple 'Bus' to orange 'DollarSign' */}
            <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
                {/* TEXT CHANGE: Title is now "Total Discount" */}
                <p className="text-sm font-medium text-gray-600">Total Discount</p>
                {/* VALUE CHANGE: Uses the new discount calculation */}
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDiscount)}</p>
            </div>
        </div>
    </div>
</div>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search by student name or SR No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /></div></div>
          <div className="flex space-x-4">
            <select value={selectedFilterClass} onChange={(e) => setSelectedFilterClass(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Classes</option>
              {classOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Filter className="w-4 h-4 mr-2" />More Filters</button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Details</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.recordId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        <div className="text-sm text-gray-500">{record.class}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Total: {formatCurrency(record.totalFees)}</div>
                      <div className="text-sm text-gray-500">Paid: {formatCurrency(record.paidFees)}</div>
                      {record.busFees > 0 && <div className="text-sm text-blue-600">Bus: {formatCurrency(record.busFees)}</div>}
                      {record.discountFees > 0 && <div className="text-sm text-red-600">Discount: {formatCurrency(record.discountFees)}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Pending: {formatCurrency(record.pendingFees)}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.pendingFees <= 0 ? 'bg-green-100 text-green-800' : new Date(record.dueDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.pendingFees <= 0 ? 'Paid' : new Date(record.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Due: {formatDate(record.dueDate)}</div>
                      {record.lastPaymentDate && (<div className="text-sm text-gray-500">Last: {formatDate(record.lastPaymentDate)}</div>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleViewDetails(record)} className="text-blue-600 hover:text-blue-900" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleGenerateReceipt(record)} className="text-green-600 hover:text-green-900" title="Generate Receipt"><Receipt className="w-4 h-4" /></button>
                        <button onClick={() => handleEditClick(record)} className="text-gray-600 hover:text-gray-900" title="Edit Record"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteFeeRecord(record.recordId)} className="text-red-600 hover:text-red-900" title="Delete Record"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {showTuitionEditor && (
    <TuitionFeeEditorModal 
        isOpen={showTuitionEditor} 
        onClose={() => setShowTuitionEditor(false)} 
        classOptions={classOptions}
        medium={medium} // <-- Pass the medium as a prop
    />
)}

      {showBusFeeEditor && (
                <BusFeeEditorModal 
                    isOpen={showBusFeeEditor}
                    onClose={() => setShowBusFeeEditor(false)}
                />
            )}
      {showAddModal && (
        <AddFeeModal
          newFeeRecord={newFeeRecord}
          setNewFeeRecord={setNewFeeRecord}
          students={students}
          classOptions={classOptions}
          setShowAddModal={setShowAddModal}
          handleAddFeeRecord={handleAddFeeRecord}
          getBusFees={getBusFees}
          formatCurrency={formatCurrency}

        />
      )}
      {showReceiptModal && receiptRecord && (
        <FeeReceiptModal
          record={receiptRecord}
          onClose={() => setShowReceiptModal(false)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}

        />
      )}
      {showViewModal && viewingRecord && (
        <ViewRecordModal
          record={viewingRecord}
          onClose={() => setShowViewModal(false)}
          formatCurrency={formatCurrency}
          formatDate={formatDate}

        />
      )}
      {showEditModal && editingRecord && (
        <EditFeeModal 
          record={editingRecord}
          onSave={handleUpdateFeeRecord}
          onCancel={() => setShowEditModal(false)}
          getBusFees={getBusFees}
          formatCurrency={formatCurrency}

        />
      )}
    </div>
  );
};
export default FeesManagement;