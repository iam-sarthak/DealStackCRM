import { useState, useEffect } from 'react';
import { Search, Plus, Receipt, Calendar, DollarSign, Filter, Download, Eye, Send, MoreVertical, X } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import './InvoiceManagement.css';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    dueDate: '',
    tax: 0,
    discount: 0,
    items: [{ description: '', quantity: 1, price: 0 }]
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [searchTerm, filterStatus]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices', {
        params: {
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      setInvoices(response.data.data || []);
      setStats(response.data.stats || { total: 0, paid: 0, pending: 0 });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      customerId: '',
      dueDate: '',
      tax: 0,
      discount: 0,
      items: [{ description: '', quantity: 1, price: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      customerId: '',
      dueDate: '',
      tax: 0,
      discount: 0,
      items: [{ description: '', quantity: 1, price: 0 }]
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }]
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
      await api.post('/invoices', formData);
      handleCloseModal();
      fetchInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create invoice');
      console.error('Error creating invoice:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        fetchInvoices();
      } catch (error) {
        alert('Failed to delete invoice');
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      case 'overdue': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + (parseFloat(formData.tax) || 0) - (parseFloat(formData.discount) || 0);
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="invoice-management">
        <div className="loading-state">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="invoice-management">
      <div className="page-header">
        <div>
          <h1>Invoice Management</h1>
          <p>Create and manage invoices</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      <div className="invoice-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Amount</p>
            <h3 className="stat-value">${stats.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <Receipt size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Paid</p>
            <h3 className="stat-value">${stats.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <h3 className="stat-value">${stats.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="invoices-table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Items</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>
                  <div className="invoice-id-cell">
                    <Receipt size={18} />
                    <span className="invoice-id">{invoice.invoiceNumber}</span>
                  </div>
                </td>
                <td>
                  <span className="customer-name">{invoice.customer?.name || 'N/A'}</span>
                </td>
                <td>
                  <span className="amount">${parseFloat(invoice.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </td>
                <td>
                  <span className="items-count">{invoice.items?.length || 0} items</span>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ 
                      background: `${getStatusColor(invoice.status)}20`,
                      color: getStatusColor(invoice.status)
                    }}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" title="Download">
                      <Download size={16} />
                    </button>
                    {invoice.status === 'pending' && (
                      <button className="icon-btn" title="Send">
                        <Send size={16} />
                      </button>
                    )}
                    <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(invoice.id)}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoices.length === 0 && !loading && (
        <div className="empty-state">
          <Receipt size={48} />
          <p>No invoices found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Invoice"
        footer={
          <>
            <button className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              Create Invoice
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
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="modal-form-group">
            <label>Invoice Items *</label>
            {formData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
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

          <div className="modal-form-group">
            <label htmlFor="tax">Tax</label>
            <input
              type="number"
              id="tax"
              min="0"
              step="0.01"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="discount">Discount</label>
            <input
              type="number"
              id="discount"
              min="0"
              step="0.01"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>Subtotal:</strong>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>Tax:</strong>
              <span>${(parseFloat(formData.tax) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>Discount:</strong>
              <span>${(parseFloat(formData.discount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: '600', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <strong>Total:</strong>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoiceManagement;
