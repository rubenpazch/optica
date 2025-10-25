import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { prescriptionsAPI } from '../services/api';
import { patientsAPI } from '../services/api';
import { Patient } from '../types';

interface Prescription {
  id: number;
  exam_date: string;
  order_number: string;
  status: string;
  total_cost: number;
  deposit_paid: number;
  balance_due: number;
  expected_delivery_date: string;
  created_at: string;
  observations?: string;
}

type SortBy = 'created_date' | 'exam_date' | 'status' | 'cost';
type SortOrder = 'asc' | 'desc';

const PrescriptionListCards: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('created_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch patient details
      const patientData = await patientsAPI.getOne(Number(patientId));
      setPatient(patientData);

      // Fetch prescriptions
      const presData = await prescriptionsAPI.getByPatient(Number(patientId));
      setPrescriptions(presData);
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedPrescriptions = () => {
    const sorted = [...prescriptions];
    
    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'created_date':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'exam_date':
          compareValue = new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
          break;
        case 'status':
          compareValue = a.status.localeCompare(b.status);
          break;
        case 'cost':
          compareValue = (a.total_cost || 0) - (b.total_cost || 0);
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      in_progress: 'bg-blue-50 border-blue-200 text-blue-800',
      completed: 'bg-green-50 border-green-200 text-green-800',
      delivered: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      cancelled: 'bg-red-50 border-red-200 text-red-800',
    };
    return colors[status] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const sortedPrescriptions = getSortedPrescriptions();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('common.back') || 'Back'}
      </button>

      {/* Patient Header */}
      {patient && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">
                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-sm text-gray-600">
                {patient.email} • {patient.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">{t('prescription.sortBy') || 'Sort by'}:</span>
          
          <button
            onClick={() => toggleSort('created_date')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'created_date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.createdDate') || 'Created Date'} {sortBy === 'created_date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>

          <button
            onClick={() => toggleSort('exam_date')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'exam_date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.examDate') || 'Exam Date'} {sortBy === 'exam_date' && (sortOrder === 'asc' ? '↑' : '↓')}
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

          <button
            onClick={() => toggleSort('cost')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'cost'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('prescription.cost') || 'Cost'} {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Prescriptions Grid */}
      {sortedPrescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">{t('prescription.noFound') || 'No prescriptions found'}</p>
          <p className="text-gray-500 mt-1">{t('prescription.emptyState') || 'Create a new prescription to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              onClick={() => navigate(`/prescriptions/${prescription.id}`)}
              className={`rounded-lg border-2 p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getStatusColor(
                prescription.status
              )}`}
            >
              {/* Header with Status Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {t('prescription.order') || 'Order'} #{prescription.order_number || prescription.id}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getStatusBadgeColor(prescription.status)}`}>
                  {prescription.status}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-current border-opacity-20">
                <div>
                  <p className="text-xs font-medium opacity-75">{t('prescription.examDate') || 'Exam Date'}</p>
                  <p className="text-sm font-semibold">
                    {new Date(prescription.exam_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-75">{t('prescription.deliveryDate') || 'Delivery Date'}</p>
                  <p className="text-sm font-semibold">
                    {prescription.expected_delivery_date
                      ? new Date(prescription.expected_delivery_date).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Cost Information */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs font-medium opacity-75">{t('prescription.totalCost') || 'Total Cost'}</p>
                  <p className="text-lg font-bold">${formatCurrency(prescription.total_cost)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-75">{t('prescription.balance') || 'Balance'}</p>
                  <p className="text-lg font-bold">${formatCurrency(prescription.balance_due)}</p>
                </div>
              </div>

              {/* Observations */}
              {prescription.observations && (
                <div className="mb-3 p-2 bg-white bg-opacity-30 rounded text-sm opacity-90 line-clamp-2">
                  <p className="text-xs font-medium opacity-75 mb-1">{t('prescription.observations') || 'Notes'}</p>
                  <p>{prescription.observations}</p>
                </div>
              )}

              {/* Click to View */}
              <div className="pt-3 border-t border-current border-opacity-20 flex items-center justify-between">
                <span className="text-xs font-medium opacity-75">{t('common.created') || 'Created'}</span>
                <span className="text-xs opacity-75">
                  {new Date(prescription.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-xs opacity-75 mt-2 text-center hover:opacity-100 transition-opacity">
                {t('common.clickViewDetails') || 'Click to view details →'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionListCards;
