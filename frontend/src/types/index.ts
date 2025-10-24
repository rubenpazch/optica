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