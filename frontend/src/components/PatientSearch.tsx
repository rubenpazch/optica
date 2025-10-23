import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types';
import { patientsAPI } from '../services/api';

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (searchTerm.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setIsOpen(true);

      try {
        const data = await patientsAPI.getAll({ search: searchTerm });
        setResults(data.patients || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === -1 || highlightedIndex === results.length) {
          // Create new patient
          navigate('/patients/new', { state: { searchTerm } });
        } else if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          // Select highlighted patient
          onSelectPatient(results[highlightedIndex]);
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleCreateNew = () => {
    navigate('/patients/new', { state: { searchTerm } });
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-semibold">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          placeholder="Search patients by name, email, phone, or ID..."
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                Found {results.length} patient{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((patient, index) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    highlightedIndex === index ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium text-sm">
                        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {highlightMatch(`${patient.first_name} ${patient.last_name}`, searchTerm)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {patient.email && highlightMatch(patient.email, searchTerm)}
                      </p>
                      {patient.phone && (
                        <p className="text-xs text-gray-400">
                          {highlightMatch(patient.phone, searchTerm)}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        patient.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : !loading ? (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">No patients found</p>
              <p className="mt-1 text-xs text-gray-500">Try a different search term</p>
            </div>
          ) : null}

          {/* Create new patient option */}
          <button
            onClick={handleCreateNew}
            onMouseEnter={() => setHighlightedIndex(results.length)}
            className={`w-full px-4 py-3 text-left border-t-2 border-gray-200 hover:bg-green-50 transition-colors ${
              highlightedIndex === results.length ? 'bg-green-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Create new patient</p>
                {searchTerm && (
                  <p className="text-xs text-gray-500">with search term: "{searchTerm}"</p>
                )}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
