import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import NewBill from './pages/NewBill';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import MyProfile from './pages/MyProfile';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
              </Route>

              <Route path="/nueva-factura" element={<DashboardLayout />}>
                <Route index element={<NewBill />} />
              </Route>

              <Route path="/editar-factura" element={<DashboardLayout />}>
                <Route index element={<NewBill />} />
              </Route>

              <Route path="/dashboard/perfil" element={<DashboardLayout />}>
                <Route index element={<MyProfile />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}