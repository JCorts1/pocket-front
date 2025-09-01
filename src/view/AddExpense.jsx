import React, { useState, useEffect } from 'react';
import { PlusCircle, Receipt } from 'lucide-react';
import ReceiptScanner from '../components/ReceiptScanner';

const AddExpense = () => {
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: ''
  });

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${RAILS_API_URL}/categories`, {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token');
    const payload = {
      expense: {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: parseInt(formData.category_id)
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

      if (response.ok) {
        setMessage('Expense added successfully!');
        setFormData({ amount: '', description: '', category_id: '' });
      } else {
        setMessage(result.error || 'Failed to add expense.');
      }
    } catch (error) {
      setMessage('Network error. Could not add expense.');
    }
  };

  const handleExpenseCreated = (expense) => {
    setMessage('Expense created from receipt successfully!');
    setShowReceiptScanner(false);
    // Optionally refresh the page or update UI
  };

  return (
    <div className="add-expense-container p-6">
      <h1 className="text-2xl font-bold mb-6">Add Expense</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('success') 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Receipt Scanner Section */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="text-blue-600" size={24} />
              <h2 className="text-lg font-semibold text-blue-800">Scan Receipt</h2>
            </div>
            <p className="text-blue-700 mb-4">
              Take a photo of your receipt and let our AI extract the details automatically.
            </p>
            <button
              onClick={() => setShowReceiptScanner(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Receipt size={20} />
              Scan Receipt
            </button>
          </div>

          {showReceiptScanner && (
            <ReceiptScanner
              onExpenseCreated={handleExpenseCreated}
              categories={categories}
            />
          )}
        </div>

        {/* Manual Entry Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle className="text-gray-600" size={24} />
              <h2 className="text-lg font-semibold text-gray-800">Manual Entry</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Enter expense details manually if you prefer.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Tips for Better Receipt Scanning:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ensure the receipt is well-lit and all text is visible</li>
          <li>• Take the photo straight-on to avoid distortion</li>
          <li>• Make sure the receipt is flat and not folded</li>
          <li>• Include the entire receipt in the photo frame</li>
        </ul>
      </div>
    </div>
  );
};

export default AddExpense;