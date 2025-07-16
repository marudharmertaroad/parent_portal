// src/components/LoginForm.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, AlertCircle, Eye, EyeOff, BookOpen, Award, Users } from 'lucide-react';

const LoginForm: React.FC = () => {
  // Get the login function and loading state from our context
  const { login, isLoading } = useAuth();

  const [credentials, setCredentials] = useState({
    rollNumber: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.rollNumber || !credentials.dateOfBirth) {
      setError('Please enter both SR Number and Date of Birth.');
      return;
    }

    const result = await login(credentials);
    if (!result.success) {
      // Display the error message from the API service
      setError(result.error || 'Login failed. Please try again.');
    }
    // On success, the AuthContext automatically handles the re-render.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="School Logo" 
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student & Parent Portal</h1>
          <p className="text-gray-600">Marudhar Defence School</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">SR Number</label>
              <div className="relative">
                <User size={20} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={credentials.rollNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Student SR Number"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar size={20} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={credentials.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Signing In...</span>
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;