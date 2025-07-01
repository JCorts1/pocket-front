import React, { useState } from 'react';
import '../assets/styles/AddIncome.css'; // We will create this file next

const AddIncome = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');

    const payload = {
      income: {
        amount,
        description,
      }
    };

    try {
        const response = await fetch(`${RAILS_API_URL}/incomes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if(response.ok) {
            setMessage('Income logged successfully!');
            // Clear the form
            setAmount('');
            setDescription('');
        } else {
            setMessage(result.error || 'Failed to log income.');
        }
    } catch (error) {
        setMessage('Network error. Could not log income.');
    }
  };

  return (
    <div className='income-form-container'>
      <h2>Log a New Income</h2>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="description">Description (e.g., Paycheck, Freelance Project)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Source of income"
            rows="3"
            required
          ></textarea>
        </div>
        <button className="form-btn" type="submit">Add Income</button>
      </form>
    </div>
  );
};

export default AddIncome;
