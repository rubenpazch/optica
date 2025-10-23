import React, { useState } from 'react';
import { Patient } from '../types';
import PatientSearch from '../components/PatientSearch';
import PatientDetails from '../components/PatientDetails';

const Home: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseDetails = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to Optica
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find and manage your patients efficiently. Search by name, email, phone, or any other field.
        </p>
      </div>

      {/* Search Section */}
      <div className="flex justify-center">
        <PatientSearch onSelectPatient={handleSelectPatient} />
      </div>

      {/* Quick Tips */}
      {!selectedPatient && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Type at least 2 characters to start searching
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Use arrow keys to navigate results and Enter to select
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Can't find a patient? Create a new one directly from the search results
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Selected Patient Details */}
      {selectedPatient && (
        <div className="max-w-4xl mx-auto animate-fadeIn">
          <PatientDetails patient={selectedPatient} onClose={handleCloseDetails} />
        </div>
      )}

      {/* Quick Actions */}
      {!selectedPatient && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">New Patient</h3>
              <p className="text-sm text-gray-600">Register a new patient</p>
            </button>

            <button className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-green-500 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                <svg className="w-6 h-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Appointments</h3>
              <p className="text-sm text-gray-600">Manage appointments</p>
            </button>

            <button className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Reports</h3>
              <p className="text-sm text-gray-600">View analytics</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
