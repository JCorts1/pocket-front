import React from 'react';
import * as ReactDOM from "react-dom/client";
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx';
import Dashboard from './view/Dashboard.jsx';
import ExpensesIndex from './view/ExpensesIndex.jsx';
import AddExpense from './view/AddExpense.jsx';
import AddIncome from './view/AddIncome.jsx';
import Budget from './view/Budget.jsx';
import RecurringExpenses from './view/RecurringExpenses.jsx';
import Layout from './components/Layout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // The login page does not use the Layout.
  },
  {
    path: "dashboard",
    // All protected pages are now wrapped in the Layout component.
    element: <Layout><Dashboard /></Layout>
  },
  {
    path: "expenses",
    element: <Layout><ExpensesIndex /></Layout>
  },
  {
    path: "add-expense",
    element: <Layout><AddExpense /></Layout>
  },
  {
    path: "income",
    element: <Layout><AddIncome /></Layout>
  },
  {
    path: "budget",
    element: <Layout><Budget /></Layout>
  },
  {
    path: "recurring",
    element: <Layout><RecurringExpenses /></Layout>
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
