export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  dni?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface PatientsResponse {
  patients: Patient[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
  filters: {
    cities: string[];
    states: string[];
  };
}

export interface DashboardStats {
  total_patients: number;
  active_patients: number;
  inactive_patients: number;
  recent_patients: Patient[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface PrescriptionEye {
  id?: number;
  eye_type: 'OD' | 'OS';
  sphere?: number;
  cylinder?: number;
  axis?: number;
  add?: number;
  prism?: number;
  prism_base?: string;
  dnp?: number;
  npd?: number;
  height?: number;
  notes?: string;
}

export interface Lens {
  id?: number;
  eye_type: 'OD' | 'OS' | 'Both';
  lens_type?: string;
  material?: string;
  coatings?: string;
  index?: number;
  tint?: string;
  photochromic?: boolean;
  progressive?: boolean;
  special_properties?: string;
  notes?: string;
}

export interface Frame {
  id?: number;
  brand?: string;
  model?: string;
  material?: string;
  color?: string;
  style?: string;
  frame_width?: number;
  lens_width?: number;
  bridge_size?: number;
  temple_length?: number;
  frame_cost?: number;
  special_features?: string;
  notes?: string;
}

export interface Prescription {
  id?: number;
  patient_id: number;
  exam_date?: string;
  observations?: string;
  order_number?: string;
  total_cost?: number;
  deposit_paid?: number;
  balance_due?: number;
  expected_delivery_date?: string;
  status?: 'pending' | 'completed' | 'delivered' | 'cancelled';
  distance_va_od?: number;
  distance_va_os?: number;
  near_va_od?: number;
  near_va_os?: number;
  prescription_eyes?: PrescriptionEye[];
  lenses?: Lens[];
  frame?: Frame;
  patient?: Patient;
  user?: User;
  created_at?: string;
  updated_at?: string;
}