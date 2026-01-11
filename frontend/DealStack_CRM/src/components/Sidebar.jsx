import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  ShoppingCart, 
  HelpCircle,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customer Portal' },
    { path: '/worksheets', icon: FileText, label: 'Worksheets' },
    { path: '/invoices', icon: Receipt, label: 'Invoices' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders & Services' },
    { path: '/support', icon: HelpCircle, label: 'Support Tickets' },
  ];

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && <h2 className="sidebar-logo">ERP System</h2>}
          <button 
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon size={20} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          {!isCollapsed && user && (
            <div className="user-info">
              <div className="user-avatar">{user.name.charAt(0)}</div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h2 className="sidebar-logo">ERP System</h2>
              <button 
                className="sidebar-toggle"
                onClick={() => setIsMobileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="sidebar-nav">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => 
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            
            <div className="sidebar-footer">
              {user && (
                <div className="user-info">
                  <div className="user-avatar">{user.name.charAt(0)}</div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
                  </div>
                </div>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

