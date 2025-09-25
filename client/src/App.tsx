import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import io, { Socket } from 'socket.io-client';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TripPlanner from './pages/TripPlanner';
import BookingPage from './pages/BookingPage';
import ExpenseTracker from './pages/ExpenseTracker';
import Profile from './pages/Profile';
import TripDashboard from './components/TripDashboard';
import RealTimeMap from './components/RealTimeMap';
import NotificationCenter from './components/NotificationCenter';
import TopDestinations from './components/TopDestinations';
// In Router:
<Route path="/destinations" element={<TopDestinations />} />

// Socket Context for Real-time Features
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

// Socket Provider Component
const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { state } = useAuth();

  useEffect(() => {
    // Only connect socket when user is authenticated
    if (state.isAuthenticated) {
      console.log('🔌 Initializing socket connection...');
      
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          userId: (state.user as any)?.id ?? (state.user as any)?._id ?? (state.user as any)?.userId ?? null
        },
        transports: ['polling', 'websocket'], // Try polling first, then websocket
        forceNew: true, // Force new connection
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5, // Limit reconnection attempts
        timeout: 20000
      });
      
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Connected to Smart Travel AI server:', newSocket.id);
      });

      newSocket.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('❌ Disconnected from server:', reason);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('🔄 Reconnection failed:', error);
        setIsConnected(false);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('💥 Reconnection failed completely');
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Disconnect socket when user logs out
      if (socket) {
        console.log('🔌 User logged out, disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
    // IMPORTANT: Don't include 'socket' in dependencies to avoid infinite loop
  }, [state.isAuthenticated, state.user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Main App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {state.isAuthenticated && <Navigation />}
      <main className={state.isAuthenticated ? 'pt-16' : ''}>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      
      {/* Smart Travel AI Global Components */}
      {state.isAuthenticated && (
        <>
          <NotificationCenter />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <SocketProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes - Existing */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trip-planner" 
                element={
                  <ProtectedRoute>
                    <TripPlanner />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/booking" 
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/expenses" 
                element={
                  <ProtectedRoute>
                    <ExpenseTracker />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* New Smart Travel AI Routes */}
              <Route 
                path="/trip/dashboard/:tripId" 
                element={
                  <ProtectedRoute>
                    <TripDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trip/map/:tripId" 
                element={
                  <ProtectedRoute>
                    <RealTimeMap />
                  </ProtectedRoute>
                } 
              />

              {/* Default Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </SocketProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;