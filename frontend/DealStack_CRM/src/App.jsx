import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerPortal from './pages/CustomerPortal';
import WorksheetManagement from './pages/WorksheetManagement';
import InvoiceManagement from './pages/InvoiceManagement';
import OrderManagement from './pages/OrderManagement';
import SupportTickets from './pages/SupportTickets';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <Sidebar />
                  <main className="main-content">
                    <div className="content-wrapper">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/customers" element={<CustomerPortal />} />
                        <Route path="/worksheets" element={<WorksheetManagement />} />
                        <Route path="/invoices" element={<InvoiceManagement />} />
                        <Route path="/orders" element={<OrderManagement />} />
                        <Route path="/support" element={<SupportTickets />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
