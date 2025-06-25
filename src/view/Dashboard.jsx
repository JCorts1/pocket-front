import React, { useState, useEffect } from 'react';
import '../assets/styles/Dashboard.css';

const Dashboard = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to view categories.');
        return;
      }

      try {
        const response = await fetch(`${RAILS_API_URL}/categories`, {
          headers: {
            'Authorization': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');

    if (!categoryId) {
        setMessage('Please select a category.');
        return;
    }

    const payload = {
      expense: {
        amount,
        description,
        category_id: categoryId
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

        if(response.ok) {
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>Loading categories...</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
