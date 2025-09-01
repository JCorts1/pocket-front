import React, { useState, useEffect } from 'react';
import { PlusCircle, Receipt } from 'lucide-react';
import ReceiptScanner from '../components/ReceiptScanner';
import '../assets/styles/ReceiptScanner.css';

const AddExpense = () => {
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: ''
  });

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${RAILS_API_URL}/categories`, {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setCategories([]);
        setMessage('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setMessage('Network error while fetching categories');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token');
    const payload = {
      expense: {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: parseInt(formData.category_id)
      }
    };

    try {
      const response = await fetch(`${RAILS_API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Expense added successfully!');
        setFormData({ amount: '', description: '', category_id: '' });
      } else {
        setMessage(result.error || 'Failed to add expense.');
      }
    } catch (error) {
      setMessage('Network error. Could not add expense.');
    }
  };

  const handleCreateCategory = async () => {
    const token = localStorage.getItem('token');
    if (!newCategoryName.trim()) {
      setMessage('Category name cannot be blank.');
      return;
    }
    try {
      const response = await fetch(`${RAILS_API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ category: { name: newCategoryName } }),
      });
      const newCategory = await response.json();
      if (response.ok) {
        setCategories([...categories, newCategory]);
        setFormData(prev => ({ ...prev, category_id: newCategory.id.toString() }));
        setShowNewCategory(false);
        setNewCategoryName('');
        setMessage(`Category "${newCategory.name}" created!`);
      } else {
        setMessage(newCategory.error || 'Failed to create category.');
      }
    } catch (error) {
      setMessage('Network error. Could not create category.');
    }
  };

  const handleExpenseCreated = (expense) => {
    setMessage('Expense created from receipt successfully!');
    setShowReceiptScanner(false);
    // Optionally refresh the page or update UI
  };

  return (
    <div className="add-expense-container p-6">
      <h1 className="text-2xl font-bold mb-6">Add Expense</h1>

      {message && (
        <div className={`message-container ${
          message.includes('success') 
            ? 'message-success'
            : 'message-error'
        }`}>
          {message}
        </div>
      )}

      <div className="expense-methods-grid">
        {/* Manual Entry Section */}
        <div className="add-expense-section manual-entry-section">
          <h2>
            <PlusCircle size={24} />
            Manual Entry
          </h2>
          <p>
            Enter expense details manually if you prefer.
          </p>

          <form onSubmit={handleManualSubmit} className="glass-form">
            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="glass-input"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="glass-input"
                placeholder="What was this expense for?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <div className="category-select-wrapper">
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="glass-select"
                  required
                >
                  <option value="">Select a category</option>
                  {Array.isArray(categories) && categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="add-category-btn"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  +
                </button>
              </div>
            </div>
            {showNewCategory && (
              <div className="new-category-form">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="glass-input"
                  required
                />
                <button type="button" onClick={handleCreateCategory} className="form-btn-small">
                  Save
                </button>
              </div>
            )}

            <button type="submit" className="glass-btn glass-btn-primary">
              Add Expense
            </button>
            
            <button 
              type="button"
              onClick={() => setShowReceiptScanner(true)}
              className="glass-btn"
            >
              <Receipt size={20} />
              Or Scan Receipt
            </button>
          </form>
        </div>
      </div>
      
      {showReceiptScanner && (
        <ReceiptScanner
          onExpenseCreated={handleExpenseCreated}
          categories={categories}
          autoStart={true}
        />
      )}

      <div className="tips-section">
        <h3>Tips for Better Receipt Scanning:</h3>
        <ul>
          <li>Ensure the receipt is well-lit and all text is visible</li>
          <li>Take the photo straight-on to avoid distortion</li>
          <li>Make sure the receipt is flat and not folded</li>
          <li>Include the entire receipt in the photo frame</li>
        </ul>
      </div>
    </div>
  );
};

export default AddExpense;