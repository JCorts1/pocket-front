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
import AddIncome from './view/AddIncome.jsx'; // 1. Import the new AddIncome component
import Layout from './components/Layout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Login page does not have the navbar
  },
  {
    path: "dashboard",
    // Wrap the Dashboard page with the Layout component
    element: <Layout><Dashboard /></Layout>
  },
  {
    path: "expenses",
    // Wrap the Expenses page with the Layout component
    element: <Layout><ExpensesIndex /></Layout>
  },
  // --- 2. ADD THE NEW ROUTE FOR THE INCOME PAGE ---
  {
    path: "income",
    element: <Layout><AddIncome /></Layout>
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
