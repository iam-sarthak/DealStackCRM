import { useState, useEffect } from 'react';
import { Search, Plus, FileText, Calendar, User, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import './WorksheetManagement.css';

const WorksheetManagement = () => {
  const [worksheets, setWorksheets] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorksheet, setEditingWorksheet] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    progress: 0
  });

  useEffect(() => {
    fetchWorksheets();
    fetchUsers();
  }, [searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback: get users from existing worksheets
      const response = await api.get('/worksheets');
      const allWorksheets = response.data.data || [];
      const uniqueUsers = [...new Map(
        allWorksheets
          .filter(w => w.assignedTo)
          .map(w => [w.assignedTo.id, w.assignedTo])
      ).values()];
      setUsers(uniqueUsers);
    }
  };

  const fetchWorksheets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/worksheets', {
        params: {
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }
      });
      setWorksheets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching worksheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (worksheet = null) => {
    if (worksheet) {
      setEditingWorksheet(worksheet);
      setFormData({
        title: worksheet.title || '',
        description: worksheet.description || '',
        assignedTo: worksheet.assignedTo?.id || '',
        status: worksheet.status || 'pending',
        priority: worksheet.priority || 'medium',
        dueDate: worksheet.dueDate ? new Date(worksheet.dueDate).toISOString().split('T')[0] : '',
        progress: worksheet.progress || 0
      });
    } else {
      setEditingWorksheet(null);
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        progress: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorksheet(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      progress: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorksheet) {
        await api.put(`/worksheets/${editingWorksheet.id}`, formData);
      } else {
        await api.post('/worksheets', formData);
      }
      handleCloseModal();
      fetchWorksheets();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save worksheet');
      console.error('Error saving worksheet:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worksheet?')) {
      try {
        await api.delete(`/worksheets/${id}`);
        fetchWorksheets();
      } catch (error) {
        alert('Failed to delete worksheet');
        console.error('Error deleting worksheet:', error);
      }
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'var(--success)';
      case 'in-progress': return 'var(--info)';
      case 'pending': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading && worksheets.length === 0) {
    return (
      <div className="worksheet-management">
        <div className="loading-state">Loading worksheets...</div>
      </div>
    );
  }

  // Use fetched users, fallback to users from worksheets
  const availableUsers = users.length > 0 ? users : [...new Map(
    worksheets
      .filter(w => w.assignedTo)
      .map(w => [w.assignedTo.id, w.assignedTo])
  ).values()];

  return (
    <div className="worksheet-management">
      <div className="page-header">
        <div>
          <h1>Worksheet Management</h1>
          <p>Organize and track your worksheets</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          New Worksheet
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search worksheets..."
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
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="worksheets-table-container">
        <table className="worksheets-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Progress</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {worksheets.map(worksheet => (
              <tr key={worksheet.id}>
                <td>
                  <div className="worksheet-title-cell">
                    <FileText size={18} />
                    <div>
                      <div className="worksheet-title">{worksheet.title}</div>
                      <div className="worksheet-description">{worksheet.description}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="assigned-cell">
                    <User size={16} />
                    <span>{worksheet.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ 
                      background: `${getStatusColor(worksheet.status)}20`,
                      color: getStatusColor(worksheet.status)
                    }}
                  >
                    {worksheet.status}
                  </span>
                </td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ color: getPriorityColor(worksheet.priority) }}
                  >
                    {worksheet.priority}
                  </span>
                </td>
                <td>
                  <div className="progress-cell">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${worksheet.progress || 0}%`,
                          background: getStatusColor(worksheet.status)
                        }}
                      />
                    </div>
                    <span className="progress-text">{worksheet.progress || 0}%</span>
                  </div>
                </td>
                <td>
                  <div className="date-cell">
                    <Calendar size={14} />
                    <span>{new Date(worksheet.dueDate).toLocaleDateString()}</span>
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" title="Edit" onClick={() => handleOpenModal(worksheet)}>
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn" title="Download">
                      <Download size={16} />
                    </button>
                    <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(worksheet.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {worksheets.length === 0 && !loading && (
        <div className="empty-state">
          <FileText size={48} />
          <p>No worksheets found matching your search.</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWorksheet ? 'Edit Worksheet' : 'Create New Worksheet'}
        footer={
          <>
            <button className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit}>
              {editingWorksheet ? 'Update' : 'Create'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter worksheet title"
            />
          </div>

          <div className="modal-form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Enter worksheet description"
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
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
            <label htmlFor="progress">Progress (%)</label>
            <input
              type="number"
              id="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorksheetManagement;
