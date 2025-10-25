import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Prescription } from '../types';
import { prescriptionsAPI } from '../services/api';

type SortBy = 'created_date' | 'exam_date' | 'patient_name' | 'status';
type SortOrder = 'asc' | 'desc';

interface SearchResult {
  id: number;
  first_name: string;
  last_name: string;
  dni?: string;
  display_name: string;
}

const PrescriptionsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('created_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);
  const searchInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPrescriptions(currentPage);
  }, [currentPage]);

  useEffect(() => {
    filterAndSortPrescriptions();
  }, [prescriptions, statusFilter, sortBy, sortOrder, selectedPatientId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPrescriptions = async (page: number) => {
    try {
      setLoading(true);
      const data = await prescriptionsAPI.getAll(page, perPage);
      console.log('Prescriptions API response:', data);
      setPrescriptions(data.prescriptions || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSelectedPatientId(null);
      return;
    }

    try {
      const data = await prescriptionsAPI.search(value, 10);
      setSearchResults(data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleSelectPatient = (patientId: number, displayName: string) => {
    setSelectedPatientId(patientId);
    setSearchTerm(displayName);
    setShowSearchResults(false);
    setCurrentPage(1); // Reset to first page when filtering by patient
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedPatientId(null);
    setSearchResults([]);
    setShowSearchResults(false);
    setCurrentPage(1); // Reset to first page when clearing search
  };

  const filterAndSortPrescriptions = () => {
    let filtered = [...prescriptions];

    // Filter by selected patient
    if (selectedPatientId) {
      filtered = filtered.filter((p) => p.patient?.id === selectedPatientId);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'patient_name':
          const nameA = a.patient
            ? `${a.patient.first_name} ${a.patient.last_name}`
            : '';
          const nameB = b.patient
            ? `${b.patient.first_name} ${b.patient.last_name}`
            : '';
          compareValue = nameA.localeCompare(nameB);
          break;
        case 'created_date':
          compareValue =
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime();
          break;
        case 'exam_date':
          compareValue =
            new Date(a.exam_date || 0).getTime() -
            new Date(b.exam_date || 0).getTime();
          break;
        case 'status':
          compareValue = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredPrescriptions(filtered);
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Calculate pagination based on filtered results when patient is selected, otherwise use server pagination
  const calculateDisplayPagination = () => {
    if (selectedPatientId) {
      // When filtering by patient, paginate the filtered results client-side
      return Math.ceil(filteredPrescriptions.length / perPage);
    }
    return totalPages;
  };

  const getDisplayedPrescriptions = () => {
    if (selectedPatientId) {
      // Client-side pagination for filtered results
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      return filteredPrescriptions.slice(startIndex, endIndex);
    }
    return filteredPrescriptions;
  };

  const displayTotalPages = calculateDisplayPagination();

  const handleViewPrescription = (prescriptionId: number | undefined) => {
    if (prescriptionId) {
      navigate(`/prescriptions/${prescriptionId}`);
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: t('prescription.all') || 'All' },
    { value: 'pending', label: t('prescription.pending') || 'Pending' },
    { value: 'completed', label: t('prescription.completed') || 'Completed' },
    { value: 'delivered', label: t('prescription.delivered') || 'Delivered' },
    { value: 'cancelled', label: t('prescription.cancelled') || 'Cancelled' },
  ];

  if (loading && prescriptions.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            {t('prescription.list') || 'All Prescriptions'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('prescription.listSubtitle') || 'View and manage all prescriptions'}
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Autocomplete Search Input */}
          <div className="relative" ref={searchInputRef}>
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
              placeholder={t('prescription.searchByPatientOrDni') || 'Search by patient name or DNI...'}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectPatient(result.id, result.display_name)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">{result.display_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {t('prescription.showing') || 'Showing'} <span className="font-semibold text-gray-900">{filteredPrescriptions.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">
            {t('prescription.sortBy') || 'Sort by'}:
          </span>

          <button
            onClick={() => toggleSort('patient_name')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors hidden sm:inline-block ${
              sortBy === 'patient_name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.patientName') || 'Patient'}{' '}
            {sortBy === 'patient_name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('created_date')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'created_date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.createdDate') || 'Created'}{' '}
            {sortBy === 'created_date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('exam_date')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors hidden md:inline-block ${
              sortBy === 'exam_date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.examDate') || 'Exam Date'}{' '}
            {sortBy === 'exam_date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('status')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.status') || 'Status'}{' '}
            {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium">
            {t('prescription.noFound') || 'No prescriptions found'}
          </p>
          <p className="text-gray-500 mt-1">
            {selectedPatientId
              ? t('prescription.noSearchResults') || 'Try adjusting your search criteria'
              : t('prescription.emptyState') || 'Create your first prescription to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {getDisplayedPrescriptions().map((prescription) => (
              <div
                key={prescription.id}
                onClick={() => handleViewPrescription(prescription.id)}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                  {/* Patient Info */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      <span className="text-sm font-bold text-blue-600">
                        {prescription.patient
                          ? prescription.patient.first_name.charAt(0) +
                            prescription.patient.last_name.charAt(0)
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {prescription.patient
                          ? `${prescription.patient.first_name} ${prescription.patient.last_name}`
                          : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {prescription.patient?.dni || 'No DNI'}
                      </p>
                    </div>
                  </div>

                  {/* Dates - Hidden on mobile */}
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-500">
                      {t('prescription.createdDate') || 'Created'}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {prescription.created_at
                        ? new Date(prescription.created_at).toLocaleDateString()
                        : '-'}
                    </p>
                    {prescription.exam_date && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('prescription.examDate') || 'Exam Date'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(prescription.exam_date).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Order & Cost - Hidden on small screens */}
                  <div className="hidden lg:block">
                    <p className="text-xs text-gray-500">
                      {t('prescription.orderNumber') || 'Order'}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {prescription.order_number || '-'}
                    </p>
                    {prescription.total_cost && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('prescription.totalCost') || 'Total'}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${typeof prescription.total_cost === 'number' ? prescription.total_cost.toFixed(2) : parseFloat(String(prescription.total_cost)).toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                        prescription.status
                      )}`}
                    >
                      {prescription.status || '-'}
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400 ml-2 hidden sm:block"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {displayTotalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous') || 'Previous'}
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(displayTotalPages, currentPage + 1))}
                disabled={currentPage === displayTotalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next') || 'Next'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrescriptionsList;
