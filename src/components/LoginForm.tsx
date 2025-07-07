import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseApiService } from '../services/supabaseApi';
import { User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({
    rollNumber: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    // Test database connection on component mount
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      const result = await supabaseApiService.testConnection();
      if (result.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('failed');
        setError(result.error || 'Database connection failed');
      }
    } catch (error) {
      setConnectionStatus('failed');
      setError('Unable to connect to database');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.rollNumber || !credentials.dateOfBirth) {
      setError('Please enter both SR Number and Date of Birth');
      return;
    }

    if (connectionStatus !== 'connected') {
      setError('Database connection not available. Please check your setup.');
      return;
    }

    const result = await login(credentials);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header with School Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <img 
              src="/logo.png" 
              alt="Marudhar Defence Educational Group" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Portal</h1>
          <p className="text-gray-600">Marudhar Defence Educational Group</p>
          <p className="text-sm text-gray-500">Access your academic information</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`flex items-center justify-center p-3 rounded-lg ${
            connectionStatus === 'connected' 
              ? 'bg-green-50 border border-green-200' 
              : connectionStatus === 'failed'
              ? 'bg-red-50 border border-red-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {connectionStatus === 'checking' && (
              <>
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-yellow-700 text-sm">Connecting to database...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle size={16} className="text-green-600 mr-2" />
                <span className="text-green-700 text-sm">Database connected successfully</span>
              </>
            )}
            {connectionStatus === 'failed' && (
              <>
                <AlertCircle size={16} className="text-red-600 mr-2" />
                <span className="text-red-700 text-sm">Database connection failed</span>
              </>
            )}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                  {connectionStatus === 'failed' && (
                    <div className="mt-2 text-xs text-red-600">
                      <p>Please check:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Your Supabase anon key is added to .env file</li>
                        <li>Database tables are created</li>
                        <li>Internet connection is working</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SR Number Field */}
            <div>
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                SR Number (Roll Number)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={credentials.rollNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your SR Number"
                  required
                />
              </div>
            </div>

            {/* Date of Birth Field */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={20} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={credentials.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || connectionStatus !== 'connected'}
              className="w-full bg-gradient-to-r from-blue-500 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : connectionStatus !== 'connected' ? (
                'Database Connection Required'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Use your SR Number and Date of Birth to login
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Having trouble? Contact your school administrator
            </p>
          </div>
        </div>

        {/* Setup Instructions */}
        {connectionStatus === 'failed' && (
          <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Required</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong>1. Add Supabase Anon Key:</strong>
                <p>Go to your Supabase Dashboard → Settings → API → Copy anon/public key</p>
                <p>Add it to your .env file: <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY=your_key_here</code></p>
              </div>
              <div>
                <strong>2. Run Database Migration:</strong>
                <p>Execute the SQL migration file in your Supabase SQL Editor</p>
              </div>
              <div>
                <strong>3. Restart the Application:</strong>
                <p>After adding the anon key, restart the development server</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Marudhar Defence Educational Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;