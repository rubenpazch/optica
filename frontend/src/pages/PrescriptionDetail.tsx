import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { prescriptionsAPI } from '../services/api';

interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
}

interface PrescriptionEye {
  eye_type: string;
  sphere: number;
  cylinder: number;
  axis: number;
  add: number;
  prism: number;
  prism_base: string;
  dnp: number;
  npd: number;
  height: number;
  notes: string;
}

interface Lens {
  eye_type: string;
  lens_type: string;
  material: string;
  coatings: string[];
  index: number;
  tint: string;
  photochromic: boolean;
  progressive: boolean;
  special_properties: string;
  notes: string;
}

interface Frame {
  brand: string;
  model: string;
  material: string;
  color: string;
  style: string;
  frame_width: number;
  lens_width: number;
  bridge_size: number;
  temple_length: number;
  frame_cost: number;
  special_features: string;
  notes: string;
}

interface PrescriptionData {
  id: number;
  exam_date: string;
  observations: string;
  order_number: string;
  status: string;
  total_cost: number;
  deposit_paid: number;
  balance_due: number;
  expected_delivery_date: string;
  distance_va_od: number;
  distance_va_os: number;
  near_va_od: number;
  near_va_os: number;
  prescription_eyes: PrescriptionEye[];
  lenses: Lens[];
  frame: Frame;
  patient: PatientData;
  created_at: string;
}

const PrescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Load prescription data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const prescriptionResponse = await prescriptionsAPI.getOne(parseInt(id!, 10));
        setPrescription(prescriptionResponse);
      } catch (err: any) {
        setError(t('prescription.loadError') || 'Error loading prescription');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, t]);

  const handleDelete = async () => {
    if (!window.confirm(t('prescription.deleteConfirm'))) {
      return;
    }

    setDeleting(true);
    try {
      await prescriptionsAPI.delete(parseInt(id!, 10));
      navigate('/prescriptions', {
        state: { message: t('prescription.deletedSuccessfully') },
      });
    } catch (err: any) {
      setError(t('prescription.deleteFailed') || 'Error deleting prescription');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0.00';
    return `$${parseFloat(String(value)).toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
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

  if (!prescription) {
    return (
      <div className="max-w-6xl mx-auto mt-10">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || t('prescription.notFound') || 'Prescription not found'}</p>
          <button
            onClick={() => navigate('/prescriptions')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('common.back') || 'Back'}
          </button>
        </div>
      </div>
    );
  }

  const eyeData: { [key: string]: PrescriptionEye | undefined } = {};
  prescription.prescription_eyes?.forEach((eye: PrescriptionEye) => {
    eyeData[eye.eye_type] = eye;
  });

  const lensData: { [key: string]: Lens | undefined } = {};
  prescription.lenses?.forEach((lens: Lens) => {
    lensData[lens.eye_type] = lens;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/prescriptions')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← {t('common.back')}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('prescription.prescriptionDetails')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('prescription.patient')}: {prescription.patient?.first_name} {prescription.patient?.last_name}
            </p>
            <p className="text-gray-600">
              {t('prescription.orderNumber')}: {prescription.order_number}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2 print:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              {t('common.print')}
            </button>
            <button
              onClick={() =>
                navigate(`/patients/${id}/prescriptions/${prescription.id}/edit`)
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium print:hidden"
            >
              {t('common.edit')}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:bg-gray-400 print:hidden"
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Prescription Details */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('prescription.basicInformation')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">{t('prescription.examDate')}</p>
              <p className="text-lg font-medium text-gray-900">
                {formatDate(prescription.exam_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('prescription.orderNumber')}</p>
              <p className="text-lg font-medium text-gray-900">{prescription.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('prescription.status')}</p>
              <p className="text-lg font-medium text-gray-900 capitalize">{prescription.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('prescription.totalCost')}</p>
              <p className="text-lg font-medium text-gray-900">
                {formatCurrency(prescription.total_cost)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('prescription.depositPaid')}</p>
              <p className="text-lg font-medium text-gray-900">
                {formatCurrency(prescription.deposit_paid)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('prescription.balanceDue')}</p>
              <p className="text-lg font-medium text-gray-900">
                {formatCurrency(prescription.balance_due)}
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-gray-600">{t('prescription.observations')}</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {prescription.observations || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Prescription Eyes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('prescription.prescriptionData')}
          </h2>
          <div className="space-y-6">
            {['OD', 'OS'].map((eye) => {
              const eyeInfo = eyeData[eye];
              if (!eyeInfo) return null;
              return (
                <div key={eye} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-4">
                    {t(`prescription.eye${eye}`)} ({eye})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.sphere')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.sphere || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.cylinder')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.cylinder || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.axis')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.axis || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.add')}</p>
                      <p className="text-sm font-medium text-gray-900">{eyeInfo.add || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.prism')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.prism || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.prismBase')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.prism_base || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.dnp')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.dnp || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.npd')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {eyeInfo.npd || '-'}
                      </p>
                    </div>
                  </div>
                  {eyeInfo.notes && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">{t('prescription.notes')}</p>
                      <p className="text-sm text-gray-900">{eyeInfo.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Lenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('prescription.lensData')}
          </h2>
          <div className="space-y-6">
            {['OD', 'OS'].map((eye) => {
              const lensInfo = lensData[eye];
              if (!lensInfo) return null;
              return (
                <div key={eye} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-4">
                    {t(`prescription.eye${eye}`)} ({eye})
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.lensType')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {lensInfo.lens_type || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.material')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {lensInfo.material || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.index')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {lensInfo.index || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{t('prescription.tint')}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {lensInfo.tint || '-'}
                      </p>
                    </div>
                  </div>
                  {lensInfo.coatings && lensInfo.coatings.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">{t('prescription.coatings')}</p>
                      <p className="text-sm text-gray-900">{lensInfo.coatings.join(', ')}</p>
                    </div>
                  )}
                  <div className="mt-4 flex gap-4">
                    {lensInfo.photochromic && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('prescription.photochromic')}
                      </span>
                    )}
                    {lensInfo.progressive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {t('prescription.progressive')}
                      </span>
                    )}
                  </div>
                  {lensInfo.special_properties && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">
                        {t('prescription.specialProperties')}
                      </p>
                      <p className="text-sm text-gray-900">{lensInfo.special_properties}</p>
                    </div>
                  )}
                  {lensInfo.notes && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600">{t('prescription.notes')}</p>
                      <p className="text-sm text-gray-900">{lensInfo.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Frames */}
        {prescription.frame && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('prescription.frameData')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameBrand')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.brand || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameModel')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.model || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameMaterial')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.material || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameColor')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.color || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameStyle')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.style || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameCost')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatCurrency(prescription.frame.frame_cost)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.frameWidth')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.frame_width ? `${prescription.frame.frame_width}mm` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.lensWidth')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.lens_width ? `${prescription.frame.lens_width}mm` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.bridgeSize')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.bridge_size ? `${prescription.frame.bridge_size}mm` : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('prescription.templeLength')}</p>
                <p className="text-lg font-medium text-gray-900">
                  {prescription.frame.temple_length
                    ? `${prescription.frame.temple_length}mm`
                    : '-'}
                </p>
              </div>
            </div>
            {prescription.frame.special_features && (
              <div className="mt-6">
                <p className="text-sm text-gray-600">{t('prescription.specialFeatures')}</p>
                <p className="text-sm text-gray-900">{prescription.frame.special_features}</p>
              </div>
            )}
            {prescription.frame.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{t('prescription.notes')}</p>
                <p className="text-sm text-gray-900">{prescription.frame.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionDetail;
