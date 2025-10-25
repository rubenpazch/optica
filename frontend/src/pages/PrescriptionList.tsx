import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { prescriptionsAPI, patientsAPI } from '../services/api';

interface Prescription {
  id: number;
  exam_date: string;
  status: string;
  order_number: string;
  total_cost: number;
  deposit_paid: number;
  balance_due?: number;
  expected_delivery_date: string;
  created_at: string;
}

interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
}

const PrescriptionList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [patient, setPatient] = useState<PatientData | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load patient and prescriptions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const patientResponse = await patientsAPI.getOne(parseInt(id!, 10));
        setPatient(patientResponse);

        const prescriptionsResponse = await prescriptionsAPI.getByPatient(parseInt(id!, 10));
        setPrescriptions(prescriptionsResponse.prescriptions || []);
      } catch (err: any) {
        setError(t('prescription.loadError'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, t]);

  const handleDelete = async (prescriptionId: number) => {
    if (!window.confirm(t('prescription.deleteConfirm'))) {
      return;
    }

    setDeletingId(prescriptionId);
    try {
      await prescriptionsAPI.delete(prescriptionId);
      setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
    } catch (err: any) {
      setError(t('prescription.deleteFailed'));
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`prescription.status.${status}`, status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0.00';
    return `$${parseFloat(String(value)).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-6xl mx-auto mt-10">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || t('prescription.patientNotFound')}</p>
          <button
            onClick={() => navigate('/patients')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('prescription.backToPatients')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/patients')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← {t('common.back')}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('prescription.prescriptions')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('prescription.patient')}: {patient.first_name} {patient.last_name}
            </p>
          </div>
          <button
            onClick={() => navigate(`/patients/${patient.id}/prescriptions/new`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + {t('prescription.newPrescription')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {t('prescription.noPrescriptions')}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {t('prescription.createFirst')}
          </p>
          <button
            onClick={() => navigate(`/patients/${patient.id}/prescriptions/new`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('prescription.createPrescription')}
          </button>
        </div>
      ) : (
        /* Prescriptions Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('prescription.examDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('prescription.orderNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('prescription.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('prescription.totalCost')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('prescription.depositPaid')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('prescription.expectedDelivery')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(prescription.exam_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {prescription.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          prescription.status
                        )}`}
                      >
                        {getStatusLabel(prescription.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(prescription.total_cost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(prescription.deposit_paid)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {prescription.expected_delivery_date
                        ? formatDate(prescription.expected_delivery_date)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/patients/${patient.id}/prescriptions/${prescription.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {t('common.view')}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/patients/${patient.id}/prescriptions/${prescription.id}/edit`)
                        }
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(prescription.id)}
                        disabled={deletingId === prescription.id}
                        className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                      >
                        {deletingId === prescription.id ? t('common.deleting') : t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
