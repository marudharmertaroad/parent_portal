// src/components/LoginForm.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, AlertCircle, Eye, EyeOff, BookOpen, Award, Users, ShieldCheck, Target, GraduationCap, Medal} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-yellow-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* --- THIS IS THE UPDATED BACKGROUND SECTION --- */}
      <div className="absolute inset-0 opacity-5 text-white">
        {/* We use flexbox and absolute positioning to place icons around the screen */}
        <GraduationCap className="absolute top-20 left-20 w-32 h-32 animate-pulse" strokeWidth={1} />
        <ShieldCheck className="absolute top-40 right-32 w-24 h-24 animate-pulse delay-300" strokeWidth={0.5} />
        <Target className="absolute bottom-32 left-40 w-20 h-20 animate-pulse delay-700" strokeWidth={0.5} />
        <Medal className="absolute bottom-20 right-20 w-28 h-28 animate-pulse delay-1000" strokeWidth={0.5} />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* School Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white border-2 border-white rounded-full mb-6 shadow-2xl overflow-hidden">
            <img
              src="/logo.png" 
              alt="School Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Marudhar Defence School</h1>
          <p className="text-blue-200 text-lg mb-4">Excellence in Education & Character</p>
          <p className="text-blue-200 text-lg mb-4">Student & Parent Portal</p>
          
          <div className="flex items-center justify-center space-x-8 text-blue-200">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Est. 1991</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">1200+ Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">Excellence</span>
            </div>
          </div>
        </div>

        {/* Login Form with "Glass" Effect */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Student Login</h2>
            <p className="text-gray-600">Access your academic information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="rollNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                SR Number
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  value={credentials.rollNumber}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-500"
                  placeholder="Enter your SR Number"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={credentials.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-blue-200 text-sm">
          <p>© {new Date().getFullYear()} Marudhar Defence School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;