import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Plus, Calendar, Edit, Trash2, Play, Pause, AlertCircle } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import '../assets/styles/RecurringExpenses.css';

const RecurringExpenses = () => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [message, setMessage] = useState('Loading...');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    frequency: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    is_active: true
  });

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchRecurringExpenses();
    fetchCategories();
    fetchDashboardData();
  }, []);

  const fetchRecurringExpenses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/recurring_expenses`, {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecurringExpenses(data);
        setMessage('');
      }
    } catch (error) {
      setMessage('Error loading recurring expenses');
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/categories`, {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/recurring_expenses/dashboard`, {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    // Calculate next_due_date from start_date
    const nextDueDate = formData.start_date;

    const expenseData = {
      recurring_expense: {
        ...formData,
        amount: parseFloat(formData.amount),
        next_due_date: nextDueDate
      }
    };

    try {
      const url = editingExpense 
        ? `${RAILS_API_URL}/recurring_expenses/${editingExpense.id}`
        : `${RAILS_API_URL}/recurring_expenses`;
      
      const method = editingExpense ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        setMessage(editingExpense ? 'Recurring expense updated!' : 'Recurring expense created!');
        resetForm();
        fetchRecurringExpenses();
        fetchDashboardData();
        setIsFormOpen(false);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${Object.values(errorData).join(', ')}`);
      }
    } catch (error) {
      setMessage('Network error occurred');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category_id: expense.category.id,
      frequency: expense.frequency,
      start_date: format(new Date(expense.start_date || expense.next_due_date), 'yyyy-MM-dd'),
      end_date: expense.end_date ? format(new Date(expense.end_date), 'yyyy-MM-dd') : '',
      is_active: expense.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this recurring expense?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/recurring_expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        setMessage('Recurring expense deleted');
        fetchRecurringExpenses();
        fetchDashboardData();
      } else {
        setMessage('Error deleting recurring expense');
      }
    } catch (error) {
      setMessage('Network error occurred');
    }
  };

  const toggleActive = async (expense) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/recurring_expenses/${expense.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recurring_expense: { is_active: !expense.is_active }
        })
      });

      if (response.ok) {
        fetchRecurringExpenses();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const generateExpense = async (expenseId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/recurring_expenses/${expenseId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        fetchRecurringExpenses();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error generating expense');
      }
    } catch (error) {
      setMessage('Network error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category_id: '',
      frequency: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      is_active: true
    });
    setEditingExpense(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusColor = (expense) => {
    if (!expense.is_active) return 'status-inactive';
    const dueDate = new Date(expense.next_due_date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'status-overdue';
    if (diffDays === 0) return 'status-due';
    if (diffDays <= 3) return 'status-soon';
    return 'status-normal';
  };

  const formatFrequency = (frequency) => {
    const frequencies = {
      'weekly': 'Weekly',
      'bi_weekly': 'Bi-weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly'
    };
    return frequencies[frequency] || frequency;
  };

  return (
    <div className="recurring-expenses-container">
      <div className="recurring-expenses-header">
        <h1>Recurring Expenses</h1>
        <p>Manage your automatic recurring transactions</p>
      </div>

      {/* Dashboard Stats */}
      {Object.keys(dashboardData).length > 0 && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active</h3>
            <p className="stat-number">{dashboardData.active_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Overdue</h3>
            <p className="stat-number status-overdue">{dashboardData.overdue_count || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Monthly Impact</h3>
            <p className="stat-number">${(dashboardData.monthly_impact || 0).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Add New Button */}
      <div className="actions-section">
        <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DrawerTrigger asChild>
            <button className="add-recurring-btn" onClick={() => { resetForm(); setIsFormOpen(true); }}>
              <Plus className="btn-icon" />
              Add Recurring Expense
            </button>
          </DrawerTrigger>
          <DrawerContent className="recurring-drawer">
            <div className="drawer-container">
              <DrawerHeader>
                <DrawerTitle>
                  {editingExpense ? 'Edit Recurring Expense' : 'New Recurring Expense'}
                </DrawerTitle>
              </DrawerHeader>
              
              <form onSubmit={handleSubmit} className="recurring-form">
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Netflix Subscription"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="amount">Amount ($)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="frequency">Frequency</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi_weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category_id">Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_date">Start Date</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_date">End Date (Optional)</label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingExpense ? 'Update' : 'Create'} Recurring Expense
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {message && <p className="message">{message}</p>}

      {/* Recurring Expenses List */}
      <div className="recurring-expenses-list">
        {recurringExpenses.length === 0 ? (
          <div className="empty-state">
            <Calendar className="empty-icon" />
            <h3>No Recurring Expenses</h3>
            <p>Set up automatic recurring transactions to stay on top of your regular bills.</p>
          </div>
        ) : (
          <div className="expenses-grid">
            {recurringExpenses.map(expense => (
              <div key={expense.id} className={`expense-card ${getStatusColor(expense)}`}>
                <div className="expense-header">
                  <h3>{expense.description}</h3>
                  <div className="expense-actions">
                    <button
                      className="action-btn"
                      onClick={() => toggleActive(expense)}
                      title={expense.is_active ? 'Pause' : 'Resume'}
                    >
                      {expense.is_active ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="expense-details">
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">${parseFloat(expense.amount).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Frequency:</span>
                    <span className="value">{formatFrequency(expense.frequency)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Category:</span>
                    <span className="value">{expense.category.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Next Due:</span>
                    <span className="value">
                      {format(new Date(expense.next_due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {expense.end_date && (
                    <div className="detail-row">
                      <span className="label">Ends:</span>
                      <span className="value">
                        {format(new Date(expense.end_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="expense-footer">
                  <span className={`status-badge ${getStatusColor(expense)}`}>
                    {expense.is_active ? 'Active' : 'Inactive'}
                    {expense.is_active && getStatusColor(expense) === 'status-overdue' && (
                      <AlertCircle size={14} style={{ marginLeft: '4px' }} />
                    )}
                  </span>
                  
                  {expense.is_active && (
                    <button
                      className="generate-btn"
                      onClick={() => generateExpense(expense.id)}
                      title="Generate expense now"
                    >
                      Generate Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringExpenses;