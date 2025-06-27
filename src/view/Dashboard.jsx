import React, { useState, useEffect } from 'react';
import '../assets/styles/Dashboard.css';

const Dashboard = () => {
  // All this state is correct
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  // This useEffect is correct and does not need changes
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to view categories.');
        return;
      }
      try {
        const response = await fetch(`${RAILS_API_URL}/categories`, {
          headers: { 'Authorization': token },
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0 && !categoryId) {
            setCategoryId(data[0].id);
          }
        } else {
          setMessage('Could not fetch categories.');
        }
      } catch (error) {
        setMessage('Network error while fetching categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => { // No 'event' needed here
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
        setCategoryId(newCategory.id);
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

  const handleSubmitExpense = async (event) => {
    event.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');

    if (!categoryId) {
      setMessage('Please select a category.');
      return;
    }

    try {
      const response = await fetch(`${RAILS_API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ expense: { amount, description, category_id: categoryId } }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Expense logged successfully!');
        setAmount('');
        setDescription('');
      } else {
        setMessage(result.error || 'Failed to log expense.');
      }
    } catch (error) {
      setMessage('Network error. Could not log expense.');
    }
  };

  return (
    <div className='dashboard-container'>
      <div className='expense-form-container'>
        <h2>Log a New Expense</h2>
        {message && <p className="form-message">{message}</p>}

        {/* The main form for submitting an expense */}
        <form onSubmit={handleSubmitExpense}>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-select-wrapper">
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading categories...</option>
                )}
              </select>
              <button
                type="button" // This prevents submitting the main form
                className="add-category-btn"
                onClick={() => setShowNewCategory(!showNewCategory)}
              >
                +
              </button>
            </div>
          </div>

          {/* This is no longer a <form>, it is now a <div> */}
          {showNewCategory && (
            <div className="new-category-form">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                required
              />
              {/* This button is type="button" and calls the function directly */}
              <button type="button" onClick={handleCreateCategory} className="form-btn-small">
                Save
              </button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Coffee with a friend"
              rows="3"
            ></textarea>
          </div>

          <button className="form-btn" type="submit">Add Expense</button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
