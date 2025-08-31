import React, { useState, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // We need this for the base layout
import { Calendar as CalendarIcon, Download } from "lucide-react";

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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState([]);
  const pickerRef = useRef(null);

  // --- Logic to make the calendar responsive ---
  const [numberOfMonths, setNumberOfMonths] = useState(window.innerWidth > 768 ? 2 : 1);

  useEffect(() => {
    const handleResize = () => {
      setNumberOfMonths(window.innerWidth > 768 ? 2 : 1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

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

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      setIsPickerOpen(false);
    }
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
          <div className="date-picker-popover" ref={pickerRef}>
            <button
              id="date"
              className="date-picker-trigger"
              onClick={() => setIsPickerOpen(!isPickerOpen)}
            >
              <CalendarIcon className="date-picker-icon" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </button>
            {isPickerOpen && (
              <div className="date-picker-content">
                <DayPicker
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateSelect}
                  numberOfMonths={numberOfMonths}
                />
              </div>
            )}
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
