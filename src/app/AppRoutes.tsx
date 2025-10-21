import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtected } from './RoleProtected';

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('../features/features/auth/LoginPage'));
const SignupPage = React.lazy(() => import('../features/features/auth/SignupPage'));
const ForgotPasswordPage = React.lazy(() => import('../features/features/auth/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('../features/features/dashboard/DashboardPage'));
const ProjectList = React.lazy(() => import('../features/features/projects/ProjectList'));
// const ProjectForm = React.lazy(() => import('../features/features/projects/ProjectForm'));
const ProjectDetailPage = React.lazy(() => import('../features/features/projects/ProjectDetail'));
const RoleList = React.lazy(() => import('../features/features/role/RoleList'));
const UserList = React.lazy(() => import('../features/features/user/UserList'));
const ClientList = React.lazy(() => import('../features/features/client/ClientList'));
const Timesheet = React.lazy(() => import('../features/features/timesheet/TimesheetList'));
// const TaskForm = React.lazy(() => import('../../features/tasks/TaskForm'));
// const TaskDetail = React.lazy(() => import('../../features/tasks/TaskDetail'));
const CalendarPage = React.lazy(() => import('../features/features/calendar/calender'))
// const UserList = React.lazy(() => import('../../features/users/UserList'));

export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/auth/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/auth/signup" 
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/auth/forgot-password" 
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" replace />} 
        />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } />
        {/* <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectForm />
          </ProtectedRoute>
        } /> */}
         <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        <Route path="/timesheet" element={
          <ProtectedRoute>
            <Timesheet />
          </ProtectedRoute>
        } />
        <Route path="/role" element={
          <ProtectedRoute>
            <RoleList />
          </ProtectedRoute>
        } />
        <Route path="/user" element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        } />
        <Route path="/client" element={
          <ProtectedRoute>
            <ClientList />
          </ProtectedRoute>
        } />
        {/* <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        } />
        <Route path="/projects/new" element={
          <ProtectedRoute>
            <ProjectForm />
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        <Route path="/tasks/new" element={
          <ProtectedRoute>
            <TaskForm />
          </ProtectedRoute>
        } />
        <Route path="/tasks/:id" element={
          <ProtectedRoute>
            <TaskDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <RoleProtected allowedRoles={['admin']}>
              <UserList />
            </RoleProtected>
          </ProtectedRoute>
        } /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
};