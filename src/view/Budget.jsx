import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import '../assets/styles/Budget.css';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [newBudget, setNewBudget] = useState({
    category_id: '',
    monthly_limit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to view budgets.');
      setIsLoading(false);
      return;
    }

    try {
      const [budgetsResponse, dashboardResponse] = await Promise.all([
        fetch(`${RAILS_API_URL}/budgets`, { headers: { 'Authorization': token } }),
        fetch(`${RAILS_API_URL}/budgets/dashboard`, { headers: { 'Authorization': token } })
      ]);

      if (budgetsResponse.ok && dashboardResponse.ok) {
        const budgetsData = await budgetsResponse.json();
        const dashboardData = await dashboardResponse.json();
        
        
        setBudgets(budgetsData);
        setDashboard(dashboardData);
        setMessage('');
      } else {
        setMessage('Error fetching budget data.');
      }
    } catch (error) {
      setMessage('Network error while fetching data.');
    } finally {
      setIsLoading(false);
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
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ budget: newBudget })
      });

      if (response.ok) {
        setMessage('Budget created successfully!');
        
        // Reset form first
        setNewBudget({
          category_id: '',
          monthly_limit: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        });
        
        // Refresh all data to ensure consistency
        fetchData();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Error creating budget.');
      }
    } catch (error) {
      setMessage('Network error while creating budget.');
    }
  };

  const handleUpdateBudget = async (budgetId, updatedLimit) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/budgets/${budgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          budget: { 
            monthly_limit: updatedLimit 
          } 
        })
      });

      if (response.ok) {
        setMessage('Budget updated successfully!');
        fetchData();
      } else {
        setMessage('Error updating budget.');
      }
    } catch (error) {
      setMessage('Network error while updating budget.');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });

      if (response.ok) {
        setMessage('Budget deleted successfully!');
        fetchData();
      } else {
        setMessage('Error deleting budget.');
      }
    } catch (error) {
      setMessage('Network error while deleting budget.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'over_budget':
        return <AlertTriangle className="status-icon status-danger" />;
      case 'critical':
        return <AlertTriangle className="status-icon status-warning" />;
      case 'warning':
        return <TrendingUp className="status-icon status-caution" />;
      default:
        return <CheckCircle className="status-icon status-success" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over_budget':
        return 'danger';
      case 'critical':
        return 'warning';
      case 'warning':
        return 'caution';
      default:
        return 'success';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isLoading) {
    return (
      <div className="budget-list-container">
        <div className="loading-message">Loading budget data...</div>
      </div>
    );
  }

  return (
    <div className="budget-list-container">
      <div className="budget-header">
        <h1>Budget Management</h1>
        <p className="budget-subtitle">
          {monthNames[newBudget.month - 1]} {newBudget.year}
        </p>
      </div>

      {message && <div className="budget-message">{message}</div>}

      {/* Dashboard Overview */}
      {dashboard && (
        <div className="budget-dashboard">
          <div className="dashboard-card">
            <div className="card-header">
              <Target className="card-icon" />
              <h3>Budget Overview</h3>
            </div>
            <div className="dashboard-stats">
              <div className="stat-item">
                <span className="stat-label">Total Budget</span>
                <span className="stat-value">${(parseFloat(dashboard.total_budget) || 0).toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Spending</span>
                <span className="stat-value">${(parseFloat(dashboard.total_spending) || 0).toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Remaining</span>
                <span className={`stat-value ${(parseFloat(dashboard.remaining_budget) || 0) >= 0 ? 'positive' : 'negative'}`}>
                  ${(parseFloat(dashboard.remaining_budget) || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="overall-progress">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getStatusColor(dashboard.budget_health)}`}
                  style={{ width: `${Math.min(parseFloat(dashboard.spending_percentage) || 0, 100)}%` }}
                ></div>
              </div>
              <span className="progress-text">{(parseFloat(dashboard.spending_percentage) || 0).toFixed(1)}% used</span>
            </div>
          </div>

          {dashboard.alerts && dashboard.alerts.length > 0 && (
            <div className="alerts-section">
              <h4>⚠️ Budget Alerts</h4>
              {dashboard.alerts.map((alert, index) => (
                <div key={index} className={`alert alert-${getStatusColor(alert.status)}`}>
                  <strong>{alert.category_name}</strong>: {(parseFloat(alert.spending_percentage) || 0).toFixed(1)}% of budget used
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Budget Drawer */}
      <div className="budget-actions">
        <Drawer>
          <DrawerTrigger asChild>
            <button className="add-budget-btn">
              <Plus className="btn-icon" />
              Add New Budget
            </button>
          </DrawerTrigger>
          <DrawerContent className="budget-drawer">
            <div className="budget-drawer-container">
              <DrawerHeader>
                <DrawerTitle>Create New Budget</DrawerTitle>
                <DrawerDescription>
                  Set monthly spending limits to track your financial goals
                </DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleCreateBudget} className="budget-drawer-form">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newBudget.category_id}
                    onChange={(e) => setNewBudget({...newBudget, category_id: e.target.value})}
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
                <div className="form-group">
                  <label>Monthly Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBudget.monthly_limit}
                    onChange={(e) => setNewBudget({...newBudget, monthly_limit: e.target.value})}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Month</label>
                  <select
                    value={newBudget.month}
                    onChange={(e) => setNewBudget({...newBudget, month: parseInt(e.target.value)})}
                  >
                    {monthNames.map((name, index) => (
                      <option key={index} value={index + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={newBudget.year}
                    onChange={(e) => setNewBudget({...newBudget, year: parseInt(e.target.value)})}
                    min="2023"
                    max="2030"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="form-btn">Create Budget</button>
                </div>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Budget List */}
      <div className="budgets-section">
        <h2>Your Budgets</h2>
        {budgets.length === 0 ? (
          <div className="empty-state">
            <Target className="empty-icon" />
            <h3>No budgets set yet</h3>
            <p>Create your first budget to start tracking your spending goals!</p>
          </div>
        ) : (
          <div className="budgets-grid">
            {budgets.filter(budget => budget && budget.id).map(budget => (
              <div key={budget.id} className={`budget-card ${getStatusColor(budget.budget_status)}`}>
                <div className="budget-card-header">
                  {getStatusIcon(budget.budget_status)}
                  <h4>{budget.category?.name || 'Unknown Category'}</h4>
                  <div className="budget-card-actions">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <button className="action-btn">
                          <Edit2 size={16} />
                        </button>
                      </DrawerTrigger>
                      <DrawerContent className="budget-drawer">
                        <div className="budget-drawer-container">
                          <DrawerHeader>
                            <DrawerTitle>Edit Budget for {budget.category?.name || 'Unknown Category'}</DrawerTitle>
                            <DrawerDescription>
                              Update your monthly spending limit
                            </DrawerDescription>
                          </DrawerHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            handleUpdateBudget(budget.id, formData.get('monthly_limit'));
                          }} className="budget-drawer-form">
                            <div className="form-group">
                              <label>Monthly Limit</label>
                              <input
                                name="monthly_limit"
                                type="number"
                                step="0.01"
                                defaultValue={budget.monthly_limit}
                                required
                              />
                            </div>
                            <div className="form-actions">
                              <button type="submit" className="form-btn">Update Budget</button>
                            </div>
                          </form>
                        </div>
                      </DrawerContent>
                    </Drawer>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="budget-details">
                  <div className="budget-amounts">
                    <div className="amount-item">
                      <span className="amount-label">Spent</span>
                      <span className="amount-value">${(parseFloat(budget.current_spending) || 0).toFixed(2)}</span>
                    </div>
                    <div className="amount-item">
                      <span className="amount-label">Budget</span>
                      <span className="amount-value">${(parseFloat(budget.monthly_limit) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${getStatusColor(budget.budget_status)}`}
                        style={{ width: `${Math.min(parseFloat(budget.spending_percentage) || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <span>{(parseFloat(budget.spending_percentage) || 0).toFixed(1)}% used</span>
                      <span className={(parseFloat(budget.remaining_budget) || 0) >= 0 ? 'positive' : 'negative'}>
                        ${Math.abs(parseFloat(budget.remaining_budget) || 0).toFixed(2)} {(parseFloat(budget.remaining_budget) || 0) >= 0 ? 'left' : 'over'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Budget;