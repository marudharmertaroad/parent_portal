// src/components/AdmitCard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { User, Calendar, Award, Printer } from 'lucide-react';
import { formatDate } from '../utils';

interface AdmitCardProps {
  student: Student;
}

interface DatesheetData {
    exam_title: string;
    schedule: { date: string; day: string; time: string; subject: string }[];
}

const AdmitCard: React.FC<AdmitCardProps> = ({ student }) => {
    const [datesheet, setDatesheet] = useState<DatesheetData | null>(null);
    const [loading, setLoading] = useState(true);
  useEffect(() => {

    const fetchDatesheet = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('datesheets')
            .select('exam_title, schedule')
            .eq('class_name', student.class)
            .eq('medium', student.medium)
            .order('created_at', { ascending: false })
            .limit(1) // Get the most recently created datesheet for the class
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching datesheet:", error);
        } else if (data) {
            setDatesheet(data);
        }
        setLoading(false);
    }, [student.class, student.medium]);

    useEffect(() => {
        fetchDatesheet();
    }, [fetchDatesheet]);

    const handlePrint = () => window.print();

    if (loading) {
        return <div className="text-center p-8">Loading Admit Card...</div>;
    }

    if (!datesheet) {
        return <div className="text-center p-8 bg-white rounded-lg">No Exam Schedule has been published for your class yet.</div>;
    }

    return (
        <div className="space-y-8">
             <style>{`@media print { .no-print { display: none; } }`}</style>
            <div className="flex justify-between items-center no-print">
                <h1 className="text-3xl font-bold">Your Admit Card</h1>
                <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <Printer size={16} className="mr-2"/> Print
                </button>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg border">
                <div className="text-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold">MARUDHAR DEFENCE SCHOOL</h2>
                    <h3 className="text-lg font-semibold text-gray-700">{datesheet.exam_title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p><strong>Student:</strong> {student.name}</p>
                        <p><strong>Class:</strong> {student.class} ({student.medium})</p>
                    </div>
                    <div className="text-right">
                        <p><strong>SR No:</strong> {student.srNo}</p>
                        <p><strong>Father's Name:</strong> {student.fatherName}</p>
                    </div>
                </div>
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">Date</th>
                            <th className="border p-2 text-left">Day</th>
                            <th className="border p-2 text-left">Subject</th>
                            <th className="border p-2 text-left">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datesheet.schedule.map(row => (
                            <tr key={row.subject} className="border-b">
                                <td className="border p-2">{formatDate(row.date)}</td>
                                <td className="border p-2">{row.day}</td>
                                <td className="border p-2 font-medium">{row.subject}</td>
                                <td className="border p-2">{row.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdmitCard;