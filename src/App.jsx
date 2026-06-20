import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CompareProvider } from './context/CompareContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public Layout Components
import Navbar from './components/common/Navbar';

// Pages
import Home from './pages/Home';
import PropertiesPage from './pages/Properties';
import PropertyDetail from './pages/Properties/Detail';
import Compare from './pages/Compare';
import Contact from './pages/Contact';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Protected Pages
import Favorites from './pages/Favorites';
import Inquiries from './pages/Inquiries';
import Profile from './pages/Profile';

// Admin Pages
import AdminLayout from './components/common/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProperties from './pages/Admin/Properties';
import AdminUsers from './pages/Admin/Users';
import AdminInquiries from './pages/Admin/Inquiries';
import AdminContactMessages from './pages/Admin/ContactMessages';

const { Content, Footer } = Layout;

function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Content style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:slug" element={<PropertyDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected Routes */}
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path="/inquiries" element={
            <ProtectedRoute>
              <Inquiries />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '24px 50px' }}>
        🏠 Future City Real Estate Rebuild ©2026 Created for Ahmedabad Property Portal
      </Footer>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CompareProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute adminOnly={true}>
                  <Routes>
                    <Route element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="properties" element={<AdminProperties />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="inquiries" element={<AdminInquiries />} />
                      <Route path="contact-messages" element={<AdminContactMessages />} />
                    </Route>
                  </Routes>
                </ProtectedRoute>
              } />

              {/* Main Website Routes */}
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </CompareProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
