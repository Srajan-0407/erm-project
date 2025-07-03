import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './pages/Dashboard';
import { Engineers } from './pages/Engineers';
import { Projects } from './pages/Projects';
import { Assignments } from './pages/Assignments';
import { Profile } from './pages/Profile';
import { Navigation } from './components/Navigation';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './store/authStore';

function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {isLoginMode ? (
        <LoginForm onToggleMode={() => setIsLoginMode(false)} />
      ) : (
        <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
      )}
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navigation />
      <main className="max-w-7xl mx-auto py-3 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="py-3 sm:py-6 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, token, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      checkAuth();
    }
  }, [token, user, checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-800 p-4 bg-white rounded-lg shadow-md">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/engineers" element={<Engineers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;