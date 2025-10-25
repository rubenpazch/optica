import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { patientsAPI } from '../services/api';

interface PatientFormData {
  first_name: string;
  last_name: string;
  dni: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  emergency_contact: string;
  emergency_phone: string;
}

const NewPatient: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchTerm = location.state?.searchTerm || '';
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: '',
    last_name: '',
    dni: '',
    address: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    emergency_contact: '',
    emergency_phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});

  // Pre-fill name if search term exists
  React.useEffect(() => {
    if (searchTerm) {
      const names = searchTerm.trim().split(' ');
      if (names.length === 1) {
        setFormData(prev => ({ ...prev, first_name: names[0] }));
      } else if (names.length >= 2) {
        setFormData(prev => ({
          ...prev,
          first_name: names[0],
          last_name: names.slice(1).join(' ')
        }));
      }
    }
  }, [searchTerm]);

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = t('newPatient.firstNameRequired');
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = t('newPatient.lastNameRequired');
    }

    if (!formData.dni.trim()) {
      newErrors.dni = t('newPatient.dniRequired');
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = t('newPatient.dniInvalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('newPatient.addressRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('newPatient.phoneRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isStep1Complete = (): boolean => {
    return (
      formData.first_name.trim() !== '' &&
      formData.last_name.trim() !== '' &&
      formData.dni.trim() !== '' &&
      /^\d{8}$/.test(formData.dni) &&
      formData.address.trim() !== '' &&
      formData.phone.trim() !== ''
    );
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof PatientFormData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'first_name':
        if (!value.trim()) {
          newErrors.first_name = t('newPatient.firstNameRequired');
        } else {
          delete newErrors.first_name;
        }
        break;
      case 'last_name':
        if (!value.trim()) {
          newErrors.last_name = t('newPatient.lastNameRequired');
        } else {
          delete newErrors.last_name;
        }
        break;
      case 'dni':
        if (!value.trim()) {
          newErrors.dni = t('newPatient.dniRequired');
        } else if (!/^\d{8}$/.test(value)) {
          newErrors.dni = t('newPatient.dniInvalid');
        } else {
          delete newErrors.dni;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = t('newPatient.addressRequired');
        } else {
          delete newErrors.address;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = t('newPatient.phoneRequired');
        } else {
          delete newErrors.phone;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors as Partial<Record<keyof PatientFormData, string>>);
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNext();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const patient = await patientsAPI.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        dni: formData.dni,
        address: formData.address,
        phone: formData.phone,
        email: formData.email || undefined,
        city: formData.city || undefined,
        state: formData.district || undefined,
        emergency_contact: formData.emergency_contact || undefined,
        emergency_phone: formData.emergency_phone || undefined,
        active: true,
      });

        // Navigate to the new prescription form for this patient
        navigate(`/patients/${patient.id}/prescriptions/new`, { 
          state: { 
            message: `Patient ${patient.first_name} ${patient.last_name} created successfully!`,
            patient,
          } 
        });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('common.back')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{t('newPatient.title')}</h1>
        <p className="mt-2 text-gray-600">{t('newPatient.subtitle')}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-300'
              }`}>
                {currentStep > 1 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-lg font-semibold">1</span>
                )}
              </div>
              <div className="ml-3 mr-8">
                <p className={`text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {t('newPatient.personalInfo')}
                </p>
              </div>
            </div>

            {/* Connector */}
            <div className={`w-24 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />

            {/* Step 2 */}
            <div className="flex items-center ml-8">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-300'
              }`}>
                <span className="text-lg font-semibold">2</span>
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {t('newPatient.contactInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPatient.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    onBlur={() => validateField('first_name', formData.first_name)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPatient.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    onBlur={() => validateField('last_name', formData.last_name)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* DNI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPatient.dni')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dni}
                  onChange={(e) => {
                    // Only allow numbers and limit to 8 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    handleInputChange('dni', value);
                  }}
                  onBlur={() => validateField('dni', formData.dni)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dni ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12345678"
                  maxLength={8}
                />
                <p className="mt-1 text-xs text-gray-500">{t('newPatient.mustBe8Digits')}</p>
                {errors.dni && (
                  <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPatient.address')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  onBlur={() => validateField('address', formData.address)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Av. Example 123, District"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPatient.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => validateField('phone', formData.phone)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+51 999 999 999"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('newPatient.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!isStep1Complete()}
                  className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                    isStep1Complete()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {t('newPatient.nextContactInfo')}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('newPatient.contactInfoDesc')}</h3>
                <p className="text-sm text-gray-600">{t('newPatient.allFieldsOptional')}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('newPatient.email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="patient@example.com"
                />
              </div>

              {/* City and District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPatient.city')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Lima"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPatient.district')}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Miraflores"
                  />
                </div>
              </div>

              {/* Additional Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emergency Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPatient.emergencyContactName')}
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact name"
                  />
                </div>

                {/* Emergency Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPatient.emergencyContactPhone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('newPatient.back')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('newPatient.creatingPatient')}
                    </span>
                  ) : (
                    t('newPatient.createPatient')
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewPatient;
