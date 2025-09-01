import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Download } from "lucide-react";

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
  const [totalIncome, setTotalIncome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [balanceColorClass, setBalanceColorClass] = useState('balance-green');
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  // Fetch available years and budget alerts on component mount
  useEffect(() => {
    fetchAvailableYears();
    fetchBudgetAlerts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setMessage('Loading data...');
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to view data.');
        return;
      }
      const startDate = date.from ? format(date.from, "yyyy-MM-dd") : '';
      const endDate = date.to ? format(date.to, "yyyy-MM-dd") : '';
      const expenseParams = (startDate && endDate) ? `?start_date=${startDate}&end_date=${endDate}` : '';
      const incomeParams = (startDate && endDate) ? `?start_date=${startDate}&end_date=${endDate}` : '';
      try {
        const [expensesResponse, incomesResponse] = await Promise.all([
          fetch(`${RAILS_API_URL}/expenses${expenseParams}`, { headers: { 'Authorization': token } }),
          fetch(`${RAILS_API_URL}/incomes${incomeParams}`, { headers: { 'Authorization': token } })
        ]);
        if (!expensesResponse.ok || !incomesResponse.ok) {
          setMessage('Could not fetch financial data.');
          return;
        }
        const expenses = await expensesResponse.json();
        const incomes = await incomesResponse.json();
        if (expenses.length === 0 && incomes.length === 0) {
          setMessage('No activity recorded for this date range.');
          setExpensesByCategory({});
          setTotalExpenses(0);
          setTotalIncome(0);
          setRemainingBalance(0);
          return;
        }
        const totalFetchedExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalFetchedIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        const balance = totalFetchedIncome - totalFetchedExpenses;
        setTotalExpenses(totalFetchedExpenses);
        setTotalIncome(totalFetchedIncome);
        setRemainingBalance(balance);
        if (totalFetchedIncome > 0) {
          const percentageRemaining = (balance / totalFetchedIncome) * 100;
          if (percentageRemaining >= 75) {
            setBalanceColorClass('balance-green');
          } else if (percentageRemaining >= 35) {
            setBalanceColorClass('balance-yellow');
          } else {
            setBalanceColorClass('balance-red');
          }
        } else {
          setBalanceColorClass(balance < 0 ? 'balance-red' : 'balance-green');
        }
        const grouped = expenses.reduce((acc, expense) => {
          const categoryName = expense.category.name;
          if (!acc[categoryName]) acc[categoryName] = [];
          acc[categoryName].push(expense);
          return acc;
        }, {});
        setExpensesByCategory(grouped);
        setMessage('');
      } catch (error) {
        setMessage('Network error while fetching data.');
      }
    };
    fetchData();
  }, [date]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleFromDateChange = (e) => {
    const fromDate = new Date(e.target.value);
    setDate(prev => ({ ...prev, from: fromDate }));
  };

  const handleToDateChange = (e) => {
    const toDate = new Date(e.target.value);
    setDate(prev => ({ ...prev, to: toDate }));
  };

  // Function to fetch available years with data
  const fetchAvailableYears = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch all expenses to get years with data
      const response = await fetch(`${RAILS_API_URL}/expenses`, { 
        headers: { 'Authorization': token } 
      });
      if (response.ok) {
        const allExpenses = await response.json();
        const years = [...new Set(allExpenses.map(expense => 
          new Date(expense.created_at).getFullYear()
        ))].sort((a, b) => b - a); // Sort descending
        
        // Add current year if not present
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) {
          years.unshift(currentYear);
        }
        
        setAvailableYears(years);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
    }
  };

  // Function to fetch budget alerts
  const fetchBudgetAlerts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${RAILS_API_URL}/budgets/dashboard`, {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.alerts && data.alerts.length > 0) {
          setBudgetAlerts(data.alerts);
        }
      }
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
    }
  };

  // Function to download CSV for a specific year
  const downloadYearlyCSV = async (year) => {
    setIsExporting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsExporting(false);
      return;
    }

    try {
      const response = await fetch(`${RAILS_API_URL}/expenses/export_csv?year=${year}`, {
        headers: { 
          'Authorization': token,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create and trigger download
        const blob = new Blob([data.csv_data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="expenses-list-container">
      <div className="expenses-header">
        <h1>My Finances</h1>
        <div className="header-controls">
          <div className="date-range-picker">
            <div className="date-input-group">
              <label htmlFor="fromDate">From:</label>
              <div className="date-input-wrapper" onClick={() => document.getElementById('fromDate').showPicker()}>
                <input
                  id="fromDate"
                  type="date"
                  value={date.from ? format(date.from, "yyyy-MM-dd") : ""}
                  onChange={handleFromDateChange}
                  className="date-input"
                />
                <div className="date-display">
                  {date.from ? format(date.from, "MMM dd, yyyy") : "Select date"}
                </div>
              </div>
            </div>
            <div className="date-input-group">
              <label htmlFor="toDate">To:</label>
              <div className="date-input-wrapper" onClick={() => document.getElementById('toDate').showPicker()}>
                <input
                  id="toDate"
                  type="date"
                  value={date.to ? format(date.to, "yyyy-MM-dd") : ""}
                  onChange={handleToDateChange}
                  className="date-input"
                />
                <div className="date-display">
                  {date.to ? format(date.to, "MMM dd, yyyy") : "Select date"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="summary-grid">
          <div>
            <span className="summary-label">Income</span>
            <p className="summary-value balance-green">${totalIncome.toFixed(2)}</p>
          </div>
          <div>
            <span className="summary-label">Expenses</span>
            <p className="summary-value balance-red">${totalExpenses.toFixed(2)}</p>
          </div>
          <div>
            <span className="summary-label">Remaining</span>
            <p className={`summary-value ${balanceColorClass}`}>${remainingBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* CSV Export Section */}
      {availableYears.length > 0 && (
        <div className="csv-export-section">
          <h3>Download Yearly Reports</h3>
          <p>Download comprehensive CSV reports with monthly summaries and detailed transactions:</p>
          <div className="csv-export-grid">
            {availableYears.map(year => (
              <button
                key={year}
                className="csv-export-btn"
                onClick={() => downloadYearlyCSV(year)}
                disabled={isExporting}
              >
                <Download className="csv-export-icon" />
                <span>{year} Financial Report</span>
                {isExporting && <span className="exporting-text">Generating...</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="budget-alerts-section">
          <h3>⚠️ Budget Alerts</h3>
          <div className="alerts-container">
            {budgetAlerts.map((alert, index) => (
              <div key={index} className={`budget-alert alert-${alert.status}`}>
                <strong>{alert.category_name}</strong>: {alert.spending_percentage}% of budget used
                {alert.status === 'over_budget' && ' - Over budget!'}
                {alert.status === 'critical' && ' - Critical level!'}
                {alert.status === 'warning' && ' - Approaching limit!'}
              </div>
            ))}
          </div>
        </div>
      )}

      {message && <p className="loading-message">{message}</p>}

      {Object.keys(expensesByCategory).length > 0 && (
        <div className="category-section">
          <h2>Expense Categories</h2>
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
