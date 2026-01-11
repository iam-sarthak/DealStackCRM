import { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Calendar, User, Filter, Eye, Edit, Package, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0, totalRevenue: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    type: 'product',
    assignedTo: '',
    deliveryDate: '',
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchUsers();
  }, [searchTerm, filterStatus, filterType]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders', {
        params: {
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          type: filterType !== 'all' ? filterType : undefined
        }
      });
      setOrders(response.data.data || []);
      setStats(response.data.stats || { total: 0, processing: 0, completed: 0, totalRevenue: 0 });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      customerId: '',
      type: 'product',
      assignedTo: '',
      deliveryDate: '',
      items: [{ name: '', quantity: 1, price: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      customerId: '',
      type: 'product',
      assignedTo: '',
      deliveryDate: '',
      items: [{ name: '', quantity: 1, price: 0 }]
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', formData);
      handleCloseModal();
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order');
      console.error('Error creating order:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'shipped': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'var(--success)';
      case 'processing': return 'var(--info)';
      case 'shipped': return 'var(--primary)';
      case 'pending': return 'var(--warning)';
      case 'cancelled': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="order-management">
        <div className="loading-state">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <div>
          <h1>Order & Service Management</h1>
          <p>Track orders and services</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={20} />
          New Order
        </button>
      </div>

      <div className="order-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Processing</p>
            <h3 className="stat-value">{stats.processing}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <h3 className="stat-value">{stats.completed}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <Package size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <tr key={order.id}>
                  <td>
                    <div className="order-id-cell">
                      <ShoppingCart size={18} />
                      <span className="order-id">{order.orderNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className="customer-name">{order.customer?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`type-badge ${order.type}`}>
                      {order.type}
                    </span>
                  </td>
                  <td>
                    <span className="items-count">{order.items?.length || 0} items</span>
                  </td>
                  <td>
                    <span className="amount">${parseFloat(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <StatusIcon size={16} style={{ color: getStatusColor(order.status) }} />
                      <span 
                        className="status-badge" 
                        style={{ 
                          background: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status)
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="assigned-cell">
                      <User size={14} />
                      <span>{order.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn" title="Edit">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && !loading && (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <p>No orders found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Order"
        footer={
          <>
            <button className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              Create Order
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label htmlFor="customerId">Customer *</label>
            <select
              id="customerId"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name} - {customer.company}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="assignedTo">Assigned To *</label>
            <select
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="deliveryDate">Delivery Date *</label>
            <input
              type="date"
              id="deliveryDate"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Order Items *</label>
            {formData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Quantity"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={formData.items.length === 1}
                  style={{ padding: '0.5rem', background: formData.items.length === 1 ? '#ccc' : 'var(--error)', color: 'white', border: 'none', borderRadius: '6px', cursor: formData.items.length === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="btn-secondary" style={{ marginTop: '0.5rem' }}>
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderManagement;
