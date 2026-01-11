import { useState, useEffect } from 'react';
import { Search, Plus, HelpCircle, Calendar, User, Filter, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle, Star } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import './SupportTickets.css';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, avgRating: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    subject: '',
    description: '',
    assignedTo: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
    fetchUsers();
  }, [searchTerm, filterStatus, filterPriority]);

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

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets', {
        params: {
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined
        }
      });
      setTickets(response.data.data || []);
      setStats(response.data.stats || { total: 0, open: 0, inProgress: 0, resolved: 0, avgRating: 0 });
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      customerId: '',
      subject: '',
      description: '',
      assignedTo: '',
      priority: 'medium'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      customerId: '',
      subject: '',
      description: '',
      assignedTo: '',
      priority: 'medium'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', formData);
      handleCloseModal();
      fetchTickets();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create ticket');
      console.error('Error creating ticket:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved': return CheckCircle;
      case 'closed': return XCircle;
      case 'in-progress': return Clock;
      case 'open': return AlertCircle;
      default: return HelpCircle;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'var(--success)';
      case 'closed': return 'var(--text-secondary)';
      case 'in-progress': return 'var(--info)';
      case 'open': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="support-tickets">
        <div className="loading-state">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="support-tickets">
      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Manage customer support requests</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={20} />
          New Ticket
        </button>
      </div>

      <div className="ticket-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}>
            <HelpCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Tickets</p>
            <h3 className="stat-value">{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: 'var(--warning)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Open</p>
            <h3 className="stat-value">{stats.open}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: 'var(--info)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">In Progress</p>
            <h3 className="stat-value">{stats.inProgress}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: 'var(--success)' }}>
            <Star size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg. Rating</p>
            <h3 className="stat-value">{stats.avgRating}/5</h3>
          </div>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search tickets..."
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
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="tickets-table-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Customer</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Messages</th>
              <th>Rating</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => {
              const StatusIcon = getStatusIcon(ticket.status);
              return (
                <tr key={ticket.id}>
                  <td>
                    <div className="ticket-id-cell">
                      <HelpCircle size={18} />
                      <span className="ticket-id">{ticket.ticketNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className="ticket-subject">{ticket.subject}</span>
                  </td>
                  <td>
                    <span className="customer-name">{ticket.customer?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ 
                        background: `${getPriorityColor(ticket.priority)}20`,
                        color: getPriorityColor(ticket.priority)
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <div className="status-cell">
                      <StatusIcon size={16} style={{ color: getStatusColor(ticket.status) }} />
                      <span 
                        className="status-badge" 
                        style={{ 
                          background: `${getStatusColor(ticket.status)}20`,
                          color: getStatusColor(ticket.status)
                        }}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="assigned-cell">
                      <User size={14} />
                      <span>{ticket.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="messages-cell">
                      <MessageSquare size={14} />
                      <span>{ticket.messages?.length || 0}</span>
                    </div>
                  </td>
                  <td>
                    {ticket.rating ? (
                      <div className="rating-cell">
                        <Star size={14} style={{ color: '#fbbf24' }} />
                        <span>{ticket.rating}/5</span>
                      </div>
                    ) : (
                      <span className="no-rating">-</span>
                    )}
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" title="View">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tickets.length === 0 && !loading && (
        <div className="empty-state">
          <HelpCircle size={48} />
          <p>No tickets found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Create New Support Ticket"
        footer={
          <>
            <button className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              Create Ticket
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
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="Enter ticket subject"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Enter ticket description"
              rows={4}
            />
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
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupportTickets;
