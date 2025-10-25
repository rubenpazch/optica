import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import PatientsListCards from './pages/PatientsListCards';
import NewPatient from './pages/NewPatient';
import NewPrescription from './pages/NewPrescription';
import PrescriptionListCards from './pages/PrescriptionListCards';
import PrescriptionsList from './pages/PrescriptionsList';
import PrescriptionDetail from './pages/PrescriptionDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import './i18n/config';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />
            <Route path="patients" element={<PatientsListCards />} />
            <Route path="patients/new" element={<NewPatient />} />
            <Route path="patients/:patientId/prescriptions" element={<PrescriptionListCards />} />
            <Route path="patients/:patientId/prescriptions/new" element={<NewPrescription />} />
            <Route path="prescriptions" element={<PrescriptionsList />} />
            <Route path="prescriptions/:id" element={<PrescriptionDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;