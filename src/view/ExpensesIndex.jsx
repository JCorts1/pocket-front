import React, { useState, useEffect } from 'react';
import '../assets/styles/ExpensesIndex.css'; // Make sure path is correct

const ExpensesIndex = () => {
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [message, setMessage] = useState('Loading expenses...');
  const [totalExpenses, setTotalExpenses] = useState(0);

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to view expenses.');
        return;
      }

      try {
        const response = await fetch(`${RAILS_API_URL}/expenses`, {
          headers: { 'Authorization': token },
        });

        if (response.ok) {
          const expenses = await response.json();

          if (expenses.length === 0) {
            setMessage('You have not logged any expenses yet.');
            return;
          }

          const grouped = expenses.reduce((acc, expense) => {
            const categoryName = expense.category.name;
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(expense);
            return acc;
          }, {});

          const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

          setExpensesByCategory(grouped);
          setTotalExpenses(total);
          setMessage('');
        } else {
          setMessage('Could not fetch expenses.');
        }
      } catch (error) {
        setMessage('Network error while fetching expenses.');
      }
    };

    fetchExpenses();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className='expenses-index-background'>
      {/* This new wrapper will get the glass effect */}
      <div className="expenses-list-container">
        <div className="expenses-header">
          <h1>My Expenses</h1>
          <h2>Total: ${totalExpenses.toFixed(2)}</h2>
        </div>

        {message && <p className="loading-message">{message}</p>}

        <div className="expenses-list">
          {Object.keys(expensesByCategory).map(categoryName => (
            <div key={categoryName} className="category-container">
              <h3>{categoryName}</h3>
              {expensesByCategory[categoryName].map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-details">
                    <p className="expense-description">{expense.description || 'No description'}</p>
                    <p className="expense-date">{formatDate(expense.created_at)}</p>
                  </div>
                  <p className="expense-amount">${parseFloat(expense.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesIndex;
