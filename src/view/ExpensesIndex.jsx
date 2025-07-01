import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import '../assets/styles/ExpensesIndex.css';

const ExpensesIndex = () => {
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [message, setMessage] = useState('Loading data...');
  const [totalExpenses, setTotalExpenses] = useState(0);

  // --- NEW STATE for Income and Remaining Balance ---
  const [totalIncome, setTotalIncome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [balanceColorClass, setBalanceColorClass] = useState('balance-green');

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to view data.');
        return;
      }

      try {
        // Fetch both expenses and incomes at the same time
        const [expensesResponse, incomesResponse] = await Promise.all([
          fetch(`${RAILS_API_URL}/expenses`, { headers: { 'Authorization': token } }),
          fetch(`${RAILS_API_URL}/incomes`, { headers: { 'Authorization': token } })
        ]);

        if (!expensesResponse.ok || !incomesResponse.ok) {
          setMessage('Could not fetch financial data.');
          return;
        }

        const expenses = await expensesResponse.json();
        const incomes = await incomesResponse.json();

        // --- NEW: Filter data for the current month ---
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.created_at);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });

        const monthlyIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.created_at);
          return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
        });

        if (monthlyExpenses.length === 0 && monthlyIncomes.length === 0) {
          setMessage('No activity recorded for this month.');
          return;
        }

        // --- NEW: Calculate totals and remaining balance ---
        const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalMonthlyIncome = monthlyIncomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        const balance = totalMonthlyIncome - totalMonthlyExpenses;

        setTotalExpenses(totalMonthlyExpenses);
        setTotalIncome(totalMonthlyIncome);
        setRemainingBalance(balance);

        // --- NEW: Determine the color for the remaining balance ---
        if (totalMonthlyIncome > 0) {
          const percentageRemaining = (balance / totalMonthlyIncome) * 100;
          if (percentageRemaining >= 75) {
            setBalanceColorClass('balance-green');
          } else if (percentageRemaining >= 35) {
            setBalanceColorClass('balance-yellow');
          } else {
            setBalanceColorClass('balance-red');
          }
        } else {
          // If there's no income, the balance will be red if there are any expenses
          setBalanceColorClass(balance < 0 ? 'balance-red' : 'balance-green');
        }

        // Group expenses by category for the drawers (using all expenses)
        const grouped = expenses.reduce((acc, expense) => {
          const categoryName = expense.category.name;
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(expense);
          return acc;
        }, {});

        setExpensesByCategory(grouped);
        setMessage(''); // Clear loading message

      } catch (error) {
        setMessage('Network error while fetching data.');
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="expenses-list-container">
      <div className="expenses-header">
        <h1>Monthly Summary</h1>
        {/* --- NEW: Display for Income, Expenses, and Remaining Balance --- */}
        <div className="summary-grid">
          <div>
            <span className="summary-label">Income</span>
            <p className="summary-value balance-green">${totalIncome.toFixed(2)}</p>
          </div>
          <div>
            <span className="summary-label">Expenses</span>
            <p className="summary-value">${totalExpenses.toFixed(2)}</p>
          </div>
          <div>
            <span className="summary-label">Remaining</span>
            <p className={`summary-value ${balanceColorClass}`}>${remainingBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {message && <p className="loading-message">{message}</p>}

      {Object.keys(expensesByCategory).length > 0 && (
        <div className="category-section">
          <h2>All Expense Categories</h2>
          <div className="category-grid">
            {Object.keys(expensesByCategory).map(categoryName => (
              <Drawer key={categoryName}>
                <DrawerTrigger asChild>
                  <button className="category-trigger-btn">
                    {categoryName}
                  </button>
                </DrawerTrigger>
                <DrawerContent className="glass-drawer">
                  <div className="drawer-content-container">
                    <DrawerHeader>
                      <DrawerTitle>{categoryName}</DrawerTitle>
                    </DrawerHeader>
                    <div className="drawer-expenses-list">
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
                  </div>
                </DrawerContent>
              </Drawer>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesIndex;
