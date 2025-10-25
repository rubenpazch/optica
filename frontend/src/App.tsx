import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Patients from './pages/Patients';
import NewPatient from './pages/NewPatient';
import NewPrescription from './pages/NewPrescription';
import PrescriptionList from './pages/PrescriptionList';
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
            <Route path="patients" element={<Patients />} />
            <Route path="patients/new" element={<NewPatient />} />
            <Route path="patients/:id" element={<PrescriptionList />} />
            <Route path="patients/:id/prescriptions/new" element={<NewPrescription />} />
            <Route path="patients/:id/prescriptions/:prescriptionId" element={<PrescriptionDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;