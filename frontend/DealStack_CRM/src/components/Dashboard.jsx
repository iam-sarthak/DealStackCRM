import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Receipt, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes, invoicesRes, ordersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent'),
        api.get('/invoices'),
        api.get('/orders')
      ]);

      const dashboardStats = statsRes.data.data;
      const invoices = invoicesRes.data.data || [];
      const orders = ordersRes.data.data || [];
      
      // Helper function to format percentage change
      const formatChange = (change) => {
        if (change === null || change === undefined || isNaN(change)) {
          return '0%';
        }
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
      };

      setStats([
        { 
          label: 'Total Customers', 
          value: dashboardStats.totalCustomers?.toLocaleString() || '0', 
          change: formatChange(dashboardStats.totalCustomersChange),
          isPositive: (dashboardStats.totalCustomersChange || 0) >= 0,
          icon: Users,
          color: 'var(--primary)'
        },
        { 
          label: 'Active Worksheets', 
          value: dashboardStats.activeWorksheets?.toLocaleString() || '0', 
          change: formatChange(dashboardStats.activeWorksheetsChange),
          isPositive: (dashboardStats.activeWorksheetsChange || 0) >= 0,
          icon: FileText,
          color: 'var(--info)'
        },
        { 
          label: 'Pending Invoices', 
          value: dashboardStats.pendingInvoices?.toLocaleString() || '0', 
          change: formatChange(dashboardStats.pendingInvoicesChange),
          isPositive: (dashboardStats.pendingInvoicesChange || 0) >= 0,
          icon: Receipt,
          color: 'var(--warning)'
        },
        { 
          label: 'Active Orders', 
          value: dashboardStats.activeOrders?.toLocaleString() || '0', 
          change: formatChange(dashboardStats.activeOrdersChange),
          isPositive: (dashboardStats.activeOrdersChange || 0) >= 0,
          icon: ShoppingCart,
          color: 'var(--accent)'
        },
      ]);

      setActivities(activitiesRes.data.data || []);

      // Calculate revenue data
      const totalRevenue = dashboardStats.totalRevenue || 0;
      const paidRevenue = dashboardStats.paidInvoices || 0;
      const pendingRevenue = totalRevenue - paidRevenue;
      
      setRevenueData({
        total: totalRevenue,
        paid: paidRevenue,
        pending: pendingRevenue
      });

      // Calculate performance metrics
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const totalOrders = orders.length;
      const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0.0';
      
      const completedOrderValues = orders
        .filter(o => o.status === 'completed')
        .map(o => parseFloat(o.total || 0));
      const avgOrderValue = completedOrderValues.length > 0
        ? (completedOrderValues.reduce((sum, val) => sum + val, 0) / completedOrderValues.length).toFixed(0)
        : '0';

      // Customer satisfaction (mock data for now, can be replaced with actual ratings if available)
      const customerSatisfaction = '4.8';

      setPerformanceMetrics({
        conversionRate: `${conversionRate}%`,
        avgOrderValue: `$${parseInt(avgOrderValue).toLocaleString()}`,
        customerSatisfaction: `${customerSatisfaction}/5`
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        {stats?.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
                <p className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                  {stat.change} from last month
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Revenue Overview</h2>
            <button className="card-action" onClick={() => navigate('/invoices')}>
              View Report
            </button>
          </div>
          <div className="revenue-chart">
            {revenueData ? (
              <div className="revenue-stats">
                <div className="revenue-stat-item">
                  <div className="revenue-stat-label">Total Revenue</div>
                  <div className="revenue-stat-value">
                    ${revenueData.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="revenue-stat-item">
                  <div className="revenue-stat-label">Paid</div>
                  <div className="revenue-stat-value" style={{ color: 'var(--accent)' }}>
                    ${revenueData.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="revenue-stat-item">
                  <div className="revenue-stat-label">Pending</div>
                  <div className="revenue-stat-value" style={{ color: 'var(--warning)' }}>
                    ${revenueData.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="revenue-icon">
                  <TrendingUp size={48} color="var(--accent)" />
                </div>
              </div>
            ) : (
              <div className="chart-placeholder">
                <TrendingUp size={48} />
                <p>Loading revenue data...</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <button className="card-action" onClick={() => {
              // Show all activities in a modal or navigate to a dedicated page
              // For now, we'll just show all activities by removing the slice
              // In a real app, you might want a dedicated activities page
              alert(`Showing all ${activities.length} activities. In a full implementation, this would navigate to an activities page.`);
            }}>
              View All
            </button>
          </div>
          <div className="activity-list">
            {activities.length > 0 ? (
              activities.slice(0, 4).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <Activity size={16} />
                  </div>
                  <div className="activity-content">
                    <p>{activity.message}</p>
                    <span className="activity-time">{formatTimeAgo(activity.time)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent activities</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/invoices')}>
              <DollarSign size={20} />
              <span>Create Invoice</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/orders')}>
              <ShoppingCart size={20} />
              <span>New Order</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/worksheets')}>
              <FileText size={20} />
              <span>Add Worksheet</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/customers')}>
              <Users size={20} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Performance Metrics</h2>
          </div>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Conversion Rate</span>
              <span className="metric-value">
                {performanceMetrics?.conversionRate || '0.0%'}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Avg. Order Value</span>
              <span className="metric-value">
                {performanceMetrics?.avgOrderValue || '$0'}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Customer Satisfaction</span>
              <span className="metric-value">
                {performanceMetrics?.customerSatisfaction || '0/5'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
