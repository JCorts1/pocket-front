import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import '../assets/styles/ExpensesIndex.css';

const ExpensesIndex = () => {
  // State for all data
  const [expensesByCategory, setExpensesByCategory] = useState({});
  const [message, setMessage] = useState('Loading data...');

  // State for the summary header
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [balanceColorClass, setBalanceColorClass] = useState('balance-green');

  // State for the date picker
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  // This useEffect now depends on the 'date' state.
  // It will re-run automatically whenever the user selects a new date range.
  useEffect(() => {
    const fetchData = async () => {
      setMessage('Loading data...');
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to view data.');
        return;
      }

      // Format dates for the API query
      const startDate = date.from ? format(date.from, "yyyy-MM-dd") : '';
      const endDate = date.to ? format(date.to, "yyyy-MM-dd") : '';

      const expenseParams = (startDate && endDate) ? `?start_date=${startDate}&end_date=${endDate}` : '';
      const incomeParams = (startDate && endDate) ? `?start_date=${startDate}&end_date=${endDate}` : '';


      try {
        // Fetch both expenses and incomes for the selected date range
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

        // Calculate totals and remaining balance based on fetched data
        const totalFetchedExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalFetchedIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount), 0);
        const balance = totalFetchedIncome - totalFetchedExpenses;

        setTotalExpenses(totalFetchedExpenses);
        setTotalIncome(totalFetchedIncome);
        setRemainingBalance(balance);

        // Determine the color for the remaining balance
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

        // Group expenses by category for the drawers
        const grouped = expenses.reduce((acc, expense) => {
          const categoryName = expense.category.name;
          if (!acc[categoryName]) acc[categoryName] = [];
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
  }, [date]); // The dependency array ensures this runs when 'date' changes

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    // The component starts with the glass container. The background is handled by Layout.
    <div className="expenses-list-container">
      <div className="expenses-header">
        <h1>My Finances</h1>
        <div className="header-controls">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
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
