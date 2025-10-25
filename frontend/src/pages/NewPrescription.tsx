import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { prescriptionsAPI, patientsAPI } from '../services/api';

interface PrescriptionFormData {
  // Step 1: Basic Info
  exam_date: string;
  observations: string;
  order_number: string;
  total_cost: string;
  deposit_paid: string;
  expected_delivery_date: string;
  
  // Step 2: Prescription Eyes
  prescription_eyes: {
    OD: PrescriptionEyeData;
    OS: PrescriptionEyeData;
  };
  
  // Step 3: Lenses
  lenses: {
    OD: LensData;
    OS: LensData;
  };
  
  // Step 4: Frames
  frame: FrameData;
}

interface PrescriptionEyeData {
  sphere: string;
  cylinder: string;
  axis: string;
  add: string;
  prism: string;
  prism_base: string;
  dnp: string;
  npd: string;
  height: string;
  notes: string;
}

interface LensData {
  lens_type: string;
  material: string;
  coatings: string[];
  index: string;
  tint: string;
  photochromic: boolean;
  progressive: boolean;
  special_properties: string;
  notes: string;
}

interface FrameData {
  brand: string;
  model: string;
  material: string;
  color: string;
  style: string;
  frame_width: string;
  lens_width: string;
  bridge_size: string;
  temple_length: string;
  frame_cost: string;
  special_features: string;
  notes: string;
}

interface PatientData {
  id: number;
  first_name: string;
  last_name: string;
}

const NewPrescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  
  const [formData, setFormData] = useState<PrescriptionFormData>({
    exam_date: new Date().toISOString().split('T')[0],
    observations: '',
    order_number: '',
    total_cost: '',
    deposit_paid: '',
    expected_delivery_date: '',
    prescription_eyes: {
      OD: {
        sphere: '',
        cylinder: '',
        axis: '',
        add: '',
        prism: '',
        prism_base: '',
        dnp: '',
        npd: '',
        height: '',
        notes: '',
      },
      OS: {
        sphere: '',
        cylinder: '',
        axis: '',
        add: '',
        prism: '',
        prism_base: '',
        dnp: '',
        npd: '',
        height: '',
        notes: '',
      },
    },
    lenses: {
      OD: {
        lens_type: '',
        material: '',
        coatings: [],
        index: '',
        tint: '',
        photochromic: false,
        progressive: false,
        special_properties: '',
        notes: '',
      },
      OS: {
        lens_type: '',
        material: '',
        coatings: [],
        index: '',
        tint: '',
        photochromic: false,
        progressive: false,
        special_properties: '',
        notes: '',
      },
    },
    frame: {
      brand: '',
      model: '',
      material: '',
      color: '',
      style: '',
      frame_width: '',
      lens_width: '',
      bridge_size: '',
      temple_length: '',
      frame_cost: '',
      special_features: '',
      notes: '',
    },
  });

  // Load patient data
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const response = await patientsAPI.getOne(parseInt(id!, 10));
        setPatient(response);
      } catch (err: any) {
        setError(t('prescription.patientNotFound'));
      } finally {
        setPatientLoading(false);
      }
    };

    if (id) {
      loadPatient();
    }
  }, [id, t]);

  // Validate step 1: Basic Info
  const isStep1Complete = (): boolean => {
    return (
      formData.exam_date.trim() !== '' &&
      formData.order_number.trim() !== ''
    );
  };

  // Validate step 2: Prescription Eyes - at least one eye needs sphere
  const isStep2Complete = (): boolean => {
    const odComplete = formData.prescription_eyes.OD.sphere.trim() !== '';
    const osComplete = formData.prescription_eyes.OS.sphere.trim() !== '';
    return odComplete || osComplete;
  };

  // Validate step 3: Lenses - at least one eye needs lens type
  const isStep3Complete = (): boolean => {
    const odComplete = formData.lenses.OD.lens_type.trim() !== '';
    const osComplete = formData.lenses.OS.lens_type.trim() !== '';
    return odComplete || osComplete;
  };

  // Validate step 4: Frames - brand is required
  const isStep4Complete = (): boolean => {
    return formData.frame.brand.trim() !== '';
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEyeChange = (eyeSection: 'prescription_eyes' | 'lenses', eye: 'OD' | 'OS', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [eyeSection]: {
        ...prev[eyeSection],
        [eye]: {
          ...prev[eyeSection][eye],
          [field]: value,
        },
      },
    }));
  };

  const handleFrameChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      frame: {
        ...prev.frame,
        [field]: value,
      },
    }));
  };

  const handleCoatingChange = (eye: 'OD' | 'OS', coating: string) => {
    setFormData(prev => ({
      ...prev,
      lenses: {
        ...prev.lenses,
        [eye]: {
          ...prev.lenses[eye],
          coatings: prev.lenses[eye].coatings.includes(coating)
            ? prev.lenses[eye].coatings.filter(c => c !== coating)
            : [...prev.lenses[eye].coatings, coating],
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      // Prepare API payload
      const payload = {
        exam_date: formData.exam_date,
        observations: formData.observations,
        order_number: formData.order_number,
        total_cost: formData.total_cost ? parseFloat(formData.total_cost) : null,
        deposit_paid: formData.deposit_paid ? parseFloat(formData.deposit_paid) : null,
        expected_delivery_date: formData.expected_delivery_date || null,
        status: 'pending',
        prescription_eyes_attributes: [
          {
            eye_type: 'OD',
            sphere: formData.prescription_eyes.OD.sphere ? parseFloat(formData.prescription_eyes.OD.sphere) : null,
            cylinder: formData.prescription_eyes.OD.cylinder ? parseFloat(formData.prescription_eyes.OD.cylinder) : null,
            axis: formData.prescription_eyes.OD.axis ? parseInt(formData.prescription_eyes.OD.axis) : null,
            add: formData.prescription_eyes.OD.add ? parseFloat(formData.prescription_eyes.OD.add) : null,
            prism: formData.prescription_eyes.OD.prism ? parseFloat(formData.prescription_eyes.OD.prism) : null,
            prism_base: formData.prescription_eyes.OD.prism_base,
            dnp: formData.prescription_eyes.OD.dnp ? parseFloat(formData.prescription_eyes.OD.dnp) : null,
            npd: formData.prescription_eyes.OD.npd ? parseFloat(formData.prescription_eyes.OD.npd) : null,
            height: formData.prescription_eyes.OD.height ? parseFloat(formData.prescription_eyes.OD.height) : null,
            notes: formData.prescription_eyes.OD.notes,
          },
          {
            eye_type: 'OS',
            sphere: formData.prescription_eyes.OS.sphere ? parseFloat(formData.prescription_eyes.OS.sphere) : null,
            cylinder: formData.prescription_eyes.OS.cylinder ? parseFloat(formData.prescription_eyes.OS.cylinder) : null,
            axis: formData.prescription_eyes.OS.axis ? parseInt(formData.prescription_eyes.OS.axis) : null,
            add: formData.prescription_eyes.OS.add ? parseFloat(formData.prescription_eyes.OS.add) : null,
            prism: formData.prescription_eyes.OS.prism ? parseFloat(formData.prescription_eyes.OS.prism) : null,
            prism_base: formData.prescription_eyes.OS.prism_base,
            dnp: formData.prescription_eyes.OS.dnp ? parseFloat(formData.prescription_eyes.OS.dnp) : null,
            npd: formData.prescription_eyes.OS.npd ? parseFloat(formData.prescription_eyes.OS.npd) : null,
            height: formData.prescription_eyes.OS.height ? parseFloat(formData.prescription_eyes.OS.height) : null,
            notes: formData.prescription_eyes.OS.notes,
          },
        ],
        lenses_attributes: [
          {
            eye_type: 'OD',
            lens_type: formData.lenses.OD.lens_type,
            material: formData.lenses.OD.material,
            coatings: formData.lenses.OD.coatings,
            index: formData.lenses.OD.index ? parseFloat(formData.lenses.OD.index) : null,
            tint: formData.lenses.OD.tint,
            photochromic: formData.lenses.OD.photochromic,
            progressive: formData.lenses.OD.progressive,
            special_properties: formData.lenses.OD.special_properties,
            notes: formData.lenses.OD.notes,
          },
          {
            eye_type: 'OS',
            lens_type: formData.lenses.OS.lens_type,
            material: formData.lenses.OS.material,
            coatings: formData.lenses.OS.coatings,
            index: formData.lenses.OS.index ? parseFloat(formData.lenses.OS.index) : null,
            tint: formData.lenses.OS.tint,
            photochromic: formData.lenses.OS.photochromic,
            progressive: formData.lenses.OS.progressive,
            special_properties: formData.lenses.OS.special_properties,
            notes: formData.lenses.OS.notes,
          },
        ],
        frame_attributes: {
          brand: formData.frame.brand,
          model: formData.frame.model,
          material: formData.frame.material,
          color: formData.frame.color,
          style: formData.frame.style,
          frame_width: formData.frame.frame_width ? parseFloat(formData.frame.frame_width) : null,
          lens_width: formData.frame.lens_width ? parseFloat(formData.frame.lens_width) : null,
          bridge_size: formData.frame.bridge_size ? parseFloat(formData.frame.bridge_size) : null,
          temple_length: formData.frame.temple_length ? parseFloat(formData.frame.temple_length) : null,
          frame_cost: formData.frame.frame_cost ? parseFloat(formData.frame.frame_cost) : null,
          special_features: formData.frame.special_features,
          notes: formData.frame.notes,
        },
      };

      await prescriptionsAPI.create(parseInt(id, 10), payload);
      navigate(`/patients/${id}`, {
        state: {
          message: t('prescription.createdSuccessfully'),
        },
      });
    } catch (error: any) {
      setError(error.response?.data?.error || t('prescription.creationFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (patientLoading) {
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
      <div className="max-w-3xl mx-auto mt-10">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error || t('prescription.patientNotFound')}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← {t('common.back')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('prescription.newPrescription')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('prescription.patient')}: {patient.first_name} {patient.last_name}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('prescription.step1Title')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('prescription.examDate')} *
                </label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => handleInputChange('exam_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('prescription.orderNumber')} *
                </label>
                <input
                  type="text"
                  value={formData.order_number}
                  onChange={(e) => handleInputChange('order_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="e.g., ORD-2025-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('prescription.totalCost')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_cost}
                  onChange={(e) => handleInputChange('total_cost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('prescription.depositPaid')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deposit_paid}
                  onChange={(e) => handleInputChange('deposit_paid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('prescription.expectedDeliveryDate')}
                </label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('prescription.observations')}
                </label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  placeholder={t('prescription.observationsPlaceholder')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Prescription Eyes */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('prescription.step2Title')}
            </h2>

            {['OD', 'OS'].map((eye) => (
              <div key={eye} className="border rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t(`prescription.eye${eye}`)} ({eye})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.sphere')}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].sphere}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'sphere', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.cylinder')}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].cylinder}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'cylinder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.axis')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].axis}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'axis', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.add')}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].add}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'add', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.dnp')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].dnp}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'dnp', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.npd')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].npd}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'npd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.prism')}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].prism}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'prism', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.prismBase')}
                    </label>
                    <select
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].prism_base}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'prism_base', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      <option value="IN">IN (Inward)</option>
                      <option value="OUT">OUT (Outward)</option>
                      <option value="UP">UP (Upward)</option>
                      <option value="DOWN">DOWN (Downward)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.height')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].height}
                      onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'height', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.notes')}
                  </label>
                  <textarea
                    value={formData.prescription_eyes[eye as keyof typeof formData.prescription_eyes].notes}
                    onChange={(e) => handleEyeChange('prescription_eyes', eye as 'OD' | 'OS', 'notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Lenses */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('prescription.step3Title')}
            </h2>

            {['OD', 'OS'].map((eye) => (
              <div key={eye} className="border rounded-lg p-6 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t(`prescription.eye${eye}`)} ({eye})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.lensType')} *
                    </label>
                    <select
                      value={formData.lenses[eye as keyof typeof formData.lenses].lens_type}
                      onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'lens_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">{t('common.select')}</option>
                      <option value="single_vision">{t('prescription.singleVision')}</option>
                      <option value="bifocal">{t('prescription.bifocal')}</option>
                      <option value="progressive">{t('prescription.progressive')}</option>
                      <option value="occupational">{t('prescription.occupational')}</option>
                      <option value="other">{t('prescription.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.material')}
                    </label>
                    <select
                      value={formData.lenses[eye as keyof typeof formData.lenses].material}
                      onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'material', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    >
                      <option value="">{t('common.select')}</option>
                      <option value="plastic">{t('prescription.plastic')}</option>
                      <option value="glass">{t('prescription.glass')}</option>
                      <option value="polycarbonate">{t('prescription.polycarbonate')}</option>
                      <option value="trivex">{t('prescription.trivex')}</option>
                      <option value="high_index">{t('prescription.highIndex')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.index')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.lenses[eye as keyof typeof formData.lenses].index}
                      onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'index', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="1.50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('prescription.tint')}
                    </label>
                    <input
                      type="text"
                      value={formData.lenses[eye as keyof typeof formData.lenses].tint}
                      onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'tint', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="e.g., Gray, Brown"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('prescription.coatings')}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['UV', 'Anti-Glare', 'Scratch Resistant', 'Water Resistant', 'Oleophobic'].map((coating) => (
                      <label key={coating} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.lenses[eye as keyof typeof formData.lenses].coatings.includes(coating)}
                          onChange={() => handleCoatingChange(eye as 'OD' | 'OS', coating)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{coating}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lenses[eye as keyof typeof formData.lenses].photochromic}
                      onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'photochromic', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('prescription.photochromic')}</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.lenses[eye as keyof typeof formData.lenses].progressive}
                      onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'progressive', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('prescription.progressive')}</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.specialProperties')}
                  </label>
                  <textarea
                    value={formData.lenses[eye as keyof typeof formData.lenses].special_properties}
                    onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'special_properties', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.notes')}
                  </label>
                  <textarea
                    value={formData.lenses[eye as keyof typeof formData.lenses].notes}
                    onChange={(e) => handleEyeChange('lenses', eye as 'OD' | 'OS', 'notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Frames */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {t('prescription.step4Title')}
            </h2>

            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameBrand')} *
                  </label>
                  <input
                    type="text"
                    value={formData.frame.brand}
                    onChange={(e) => handleFrameChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Ray-Ban"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameModel')}
                  </label>
                  <input
                    type="text"
                    value={formData.frame.model}
                    onChange={(e) => handleFrameChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Wayfarer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameMaterial')}
                  </label>
                  <select
                    value={formData.frame.material}
                    onChange={(e) => handleFrameChange('material', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">{t('common.select')}</option>
                    <option value="acetate">{t('prescription.acetate')}</option>
                    <option value="metal">{t('prescription.metal')}</option>
                    <option value="titanium">{t('prescription.titanium')}</option>
                    <option value="plastic">{t('prescription.plastic')}</option>
                    <option value="wood">{t('prescription.wood')}</option>
                    <option value="combination">{t('prescription.combination')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameColor')}
                  </label>
                  <input
                    type="text"
                    value={formData.frame.color}
                    onChange={(e) => handleFrameChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="e.g., Black, Tortoise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameStyle')}
                  </label>
                  <select
                    value={formData.frame.style}
                    onChange={(e) => handleFrameChange('style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">{t('common.select')}</option>
                    <option value="full_rim">{t('prescription.fullRim')}</option>
                    <option value="semi_rim">{t('prescription.semiRim')}</option>
                    <option value="rimless">{t('prescription.rimless')}</option>
                    <option value="clubmaster">{t('prescription.clubmaster')}</option>
                    <option value="cat_eye">{t('prescription.catEye')}</option>
                    <option value="round">{t('prescription.round')}</option>
                    <option value="oversized">{t('prescription.oversized')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameCost')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.frame.frame_cost}
                    onChange={(e) => handleFrameChange('frame_cost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <h3 className="md:col-span-2 text-lg font-medium text-gray-900 mt-6">
                  {t('prescription.frameMeasurements')}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.frameWidth')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.frame.frame_width}
                    onChange={(e) => handleFrameChange('frame_width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="mm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.lensWidth')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.frame.lens_width}
                    onChange={(e) => handleFrameChange('lens_width', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="mm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.bridgeSize')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.frame.bridge_size}
                    onChange={(e) => handleFrameChange('bridge_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="mm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.templeLength')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.frame.temple_length}
                    onChange={(e) => handleFrameChange('temple_length', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder="mm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.specialFeatures')}
                  </label>
                  <textarea
                    value={formData.frame.special_features}
                    onChange={(e) => handleFrameChange('special_features', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                    placeholder={t('prescription.specialFeaturesPlaceholder')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('prescription.notes')}
                  </label>
                  <textarea
                    value={formData.frame.notes}
                    onChange={(e) => handleFrameChange('notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Summary before submit */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('prescription.reviewSummary')}
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  <span className="font-medium">{t('prescription.examDate')}:</span> {formData.exam_date}
                </li>
                <li>
                  <span className="font-medium">{t('prescription.orderNumber')}:</span> {formData.order_number}
                </li>
                <li>
                  <span className="font-medium">{t('prescription.totalCost')}:</span> ${parseFloat(formData.total_cost) || 0}
                </li>
                <li>
                  <span className="font-medium">{t('prescription.frame')}:</span> {formData.frame.brand} {formData.frame.model}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              if (currentStep > 1) setCurrentStep(currentStep - 1);
              else navigate(-1);
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            {currentStep === 1 ? t('common.cancel') : t('common.previous')}
          </button>

          {currentStep < 4 && (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !isStep1Complete()) {
                  setError(t('prescription.step1Incomplete'));
                  return;
                }
                if (currentStep === 2 && !isStep2Complete()) {
                  setError(t('prescription.step2Incomplete'));
                  return;
                }
                if (currentStep === 3 && !isStep3Complete()) {
                  setError(t('prescription.step3Incomplete'));
                  return;
                }
                setError('');
                setCurrentStep(currentStep + 1);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {t('common.next')}
            </button>
          )}

          {currentStep === 4 && (
            <button
              type="submit"
              disabled={!isStep4Complete() || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? t('common.saving') : t('prescription.savePrescription')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewPrescription;
