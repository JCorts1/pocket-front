import React, { useState } from 'react';
import { Camera, Loader2, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import CameraCapture from './CameraCapture';

const ReceiptScanner = ({ onExpenseCreated, categories }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: ''
  });

  const RAILS_API_URL = 'http://localhost:3000/api/v1';

  const handleImageCapture = async (imageFile) => {
    setShowCamera(false);
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('receipt_image', imageFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${RAILS_API_URL}/expenses/scan_receipt`, {
        method: 'POST',
        headers: {
          'Authorization': token
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setScanResult(result);
        setFormData({
          amount: result.suggested_expense.amount.toString(),
          description: result.suggested_expense.description,
          category_id: result.suggested_expense.category_id.toString()
        });
        
        // Auto-enable edit mode if needs review
        if (result.needs_review) {
          setEditMode(true);
        }
      } else {
        setError(result.error || 'Failed to process receipt');
      }
    } catch (error) {
      console.error('Receipt scanning error:', error);
      setError('Network error while processing receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateExpense = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('token');

    const expenseData = {
      expense: {
        amount: parseFloat(formData.amount),
        description: formData.description,
        category_id: parseInt(formData.category_id),
        ocr_confidence: scanResult?.ocr_confidence || 0,
        needs_review: editMode || scanResult?.needs_review || false
      }
    };

    try {
      const response = await fetch(`${RAILS_API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(expenseData)
      });

      const result = await response.json();

      if (response.ok) {
        onExpenseCreated(result);
        resetScanner();
      } else {
        setError('Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      setError('Network error while creating expense');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setEditMode(false);
    setFormData({ amount: '', description: '', category_id: '' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatConfidence = (confidence) => {
    return Math.round(confidence * 100);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onImageCapture={handleImageCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="receipt-scanner-container bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Camera size={24} />
        Scan Receipt
      </h2>

      {!scanResult && !isProcessing && (
        <div>
          <p className="text-gray-600 mb-4">
            Take a photo of your receipt to automatically extract expense information.
          </p>
          <button
            onClick={() => setShowCamera(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600"
          >
            <Camera size={20} />
            Scan Receipt
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Processing receipt...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={resetScanner}
            className="mt-2 text-red-600 underline hover:text-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {scanResult && (
        <div className="space-y-4">
          {/* Confidence and Review Status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              {scanResult.needs_review ? (
                <AlertCircle className="text-yellow-500" size={20} />
              ) : (
                <CheckCircle className="text-green-500" size={20} />
              )}
              <span className="text-sm font-medium">
                {scanResult.needs_review ? 'Needs Review' : 'Ready to Save'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Confidence: {formatConfidence(scanResult.ocr_confidence)}%
            </div>
          </div>

          {/* Extracted Data */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Extracted Information:</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Merchant:</span> {scanResult.receipt_data.merchant}</p>
              <p><span className="font-medium">Total:</span> ${scanResult.receipt_data.total.toFixed(2)}</p>
              <p><span className="font-medium">Date:</span> {scanResult.receipt_data.date}</p>
              {scanResult.receipt_data.items && scanResult.receipt_data.items.length > 0 && (
                <p><span className="font-medium">Items:</span> {scanResult.receipt_data.items.length} item(s)</p>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Expense Details</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
              >
                <Edit size={16} />
                {editMode ? 'Cancel Edit' : 'Edit'}
              </button>
            </div>

            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-gray-50 rounded-md p-3">
                <p><span className="font-medium">Amount:</span> ${formData.amount}</p>
                <p><span className="font-medium">Description:</span> {formData.description}</p>
                <p><span className="font-medium">Category:</span> {
                  categories.find(c => c.id.toString() === formData.category_id)?.name || 'Unknown'
                }</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCreateExpense}
              disabled={isProcessing || !formData.amount || !formData.category_id}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Creating...' : 'Create Expense'}
            </button>
            <button
              onClick={resetScanner}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>

          {/* Raw Text (Collapsible) */}
          {scanResult.raw_text && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                View Raw OCR Text
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {scanResult.raw_text}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;