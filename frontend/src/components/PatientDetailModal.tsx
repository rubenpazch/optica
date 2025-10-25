import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Patient } from '../types';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  const handleViewSubscriptions = () => {
    navigate(`/patients/${patient.id}/prescriptions`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 py-6 md:py-8 text-white flex items-center justify-between sticky top-0">
          <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg md:text-2xl font-bold">
                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-bold truncate">
                {patient.first_name} {patient.last_name}
              </h2>
              <p className="text-blue-100 text-sm md:text-base">{t('patients.patientId') || 'Patient ID'}: {patient.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Close"
            title="Press Escape to close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Status Badge */}
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                patient.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {patient.active ? '● ' : '○ '}
              {patient.active ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
            </span>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('patients.contactInfo') || 'Contact Information'}
              </h3>
              <div className="space-y-3">
                {patient.email && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('auth.email') || 'Email'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.email}</p>
                    </div>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.phone') || 'Phone'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.phone}</p>
                    </div>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.address') || 'Address'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('patients.additionalInfo') || 'Additional Information'}
              </h3>
              <div className="space-y-3">
                {patient.city && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.city') || 'City'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.city}</p>
                    </div>
                  </div>
                )}
                {patient.state && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H6a1 1 0 01-1-1V4z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.state') || 'State'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.state}</p>
                    </div>
                  </div>
                )}
                {patient.created_at && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.patientSince') || 'Patient Since'}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DNI and Additional Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('patients.personalInfo') || 'Personal Information'}
              </h3>
              <div className="space-y-3">
                {patient.dni && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0 0h5a2 2 0 002-2V8a2 2 0 00-2-2h-5m0 0V4a2 2 0 00-2-2h-.5a2 2 0 00-2 2v12a2 2 0 002 2h.5a2 2 0 002-2v-4"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.dni') || 'DNI'}</p>
                      <p className="text-sm font-medium text-gray-900">{patient.dni}</p>
                    </div>
                  </div>
                )}
                {patient.emergency_contact && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.emergencyContactName') || 'Emergency Contact'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.emergency_contact}</p>
                    </div>
                  </div>
                )}
                {patient.emergency_phone && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500">{t('patients.emergencyContactPhone') || 'Emergency Phone'}</p>
                      <p className="text-sm font-medium text-gray-900 break-words">{patient.emergency_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleViewSubscriptions}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{t('patients.viewSubscriptions') || 'View Subscriptions'}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>{t('common.close') || 'Close'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">{t('common.pressEscapeToClose') || 'Press Escape to close'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;
