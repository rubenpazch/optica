import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Patient } from '../types';
import { patientsAPI } from '../services/api';
import PatientDetailModal from '../components/PatientDetailModal';

type SortBy = 'name' | 'created_date' | 'city' | 'status';
type SortOrder = 'asc' | 'desc';

const PatientsListCards: React.FC = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('created_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchTerm, sortBy, sortOrder]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientsAPI.getAll({ per_page: 100 });
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.first_name?.toLowerCase().includes(term) ||
          p.last_name?.toLowerCase().includes(term) ||
          p.email?.toLowerCase().includes(term) ||
          (p.phone && p.phone.toLowerCase().includes(term)) ||
          (p.city && p.city.toLowerCase().includes(term))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
          break;
        case 'created_date':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'city':
          compareValue = (a.city || '').localeCompare(b.city || '');
          break;
        case 'status':
          compareValue = (a.active ? 1 : 0) - (b.active ? 1 : 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredPatients(filtered);
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">{t('patients.title') || 'Patients'}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('patients.subtitle') || 'Manage your patient records'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder={t('patients.search') || 'Search patients...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">{t('patients.sortBy') || 'Sort by'}:</span>

          <button
            onClick={() => toggleSort('name')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('patients.name') || 'Name'} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('created_date')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'created_date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('patients.createdDate') || 'Created Date'} {sortBy === 'created_date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('city')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'city'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('patients.city') || 'City'} {sortBy === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('status')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('common.status') || 'Status'} {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 6a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 016-6H0a6 6 0 016 6z"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium">{t('patients.noFound') || 'No patients found'}</p>
          <p className="text-gray-500 mt-1">
            {searchTerm
              ? t('patients.noSearchResults') || 'Try adjusting your search criteria'
              : t('patients.emptyState') || 'Create your first patient to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className="bg-white rounded-lg border-2 border-gray-200 p-5 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 hover:scale-105"
            >
              {/* Header with Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    patient.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.active ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {patient.first_name} {patient.last_name}
              </h3>

              {/* Contact Info */}
              <div className="space-y-1 mb-4 pb-4 border-b border-gray-200">
                {patient.email && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {patient.email}
                  </p>
                )}
                {patient.phone && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {patient.phone}
                  </p>
                )}
              </div>

              {/* Location */}
              {(patient.city || patient.state) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 inline mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {patient.city}, {patient.state}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div className="text-xs text-gray-500">
                <span className="font-medium">{t('common.created') || 'Created'}:</span>{' '}
                {new Date(patient.created_at).toLocaleDateString()}
              </div>

              {/* Click Hint */}
              <p className="text-xs text-gray-400 mt-3 text-center hover:text-gray-600 transition-colors">
                {t('patients.clickForDetails') || 'Click to view details →'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      {showDetailModal && selectedPatient && (
        <PatientDetailModal patient={selectedPatient} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default PatientsListCards;
