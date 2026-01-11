import { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, MapPin, Edit, Trash2, Filter, X } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, filterStatus]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers', {
        params: {
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      setCustomers(response.data.data || []);
      setError('');
    } catch (error) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        location: customer.location || '',
        status: customer.status || 'active'
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        status: 'active'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      status: 'active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      handleCloseModal();
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save customer');
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (error) {
        alert('Failed to delete customer');
        console.error('Error deleting customer:', error);
      }
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="customer-portal">
        <div className="loading-state">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="customer-portal">
      <div className="page-header">
        <div>
          <h1>Customer Portal</h1>
          <p>Manage your customer relationships</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="page-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search customers..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="customers-grid">
        {customers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-avatar">
                {customer.name.charAt(0)}
              </div>
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p className="customer-company">{customer.company}</p>
              </div>
              <span className={`status-badge ${customer.status}`}>
                {customer.status}
              </span>
            </div>

            <div className="customer-details">
              <div className="detail-item">
                <Mail size={16} />
                <span>{customer.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <span>{customer.phone}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>{customer.location}</span>
              </div>
            </div>

            <div className="customer-stats">
              <div className="stat">
                <span className="stat-label">Orders</span>
                <span className="stat-value">{customer.totalOrders || 0}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value">${(customer.totalSpent || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="customer-actions">
              <button className="action-btn edit" onClick={() => handleOpenModal(customer)}>
                <Edit size={16} />
                Edit
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(customer.id)}>
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {customers.length === 0 && !loading && (
        <div className="empty-state">
          <p>No customers found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        footer={
          <>
            <button className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editingCustomer ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter customer name"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="Enter phone number"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="company">Company *</label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              placeholder="Enter company name"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="Enter location"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerPortal;
