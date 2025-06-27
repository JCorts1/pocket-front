import React, { useState, useEffect } from 'react';
import '../assets/styles/Dashboard.css';

const Dashboard = () => {
  // Existing state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');

  // --- NEW STATE for creating a category ---
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  // -----------------------------------------

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  // This useEffect for fetching categories is still correct
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
  }, []); // The empty array dependency means this runs once on mount

  // --- NEW FUNCTION to handle creating a category ---
  const handleCreateCategory = async (event) => {
    event.preventDefault();
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
        // Add new category to our existing list
        setCategories([...categories, newCategory]);
        // Automatically select the new category
        setCategoryId(newCategory.id);
        // Hide the form and reset the name
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
  // -----------------------------------------------

  // This function for submitting an expense is still correct
  const handleSubmitExpense = async (event) => {
    event.preventDefault();
    // ... (rest of the expense submission logic is unchanged)
  };

  return (
    <div className='dashboard-container'>
      <div className='expense-form-container'>
        <h2>Log a New Expense</h2>
        {message && <p className="form-message">{message}</p>}
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
                type="button"
                className="add-category-btn"
                onClick={() => setShowNewCategory(!showNewCategory)}
              >
                +
              </button>
            </div>
          </div>

          {/* --- NEW CONDITIONAL FORM for adding a category --- */}
          {showNewCategory && (
            <form onSubmit={handleCreateCategory} className="new-category-form">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                required
              />
              <button type="submit" className="form-btn-small">Save</button>
            </form>
          )}
          {/* -------------------------------------------------- */}

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
