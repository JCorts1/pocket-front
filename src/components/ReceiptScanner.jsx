import React, { useState } from 'react';
import { Camera, Loader2, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import CameraCapture from './CameraCapture';

const ReceiptScanner = ({ onExpenseCreated, categories, autoStart = false }) => {
  const [showCamera, setShowCamera] = useState(autoStart);
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
    <div className="receipt-scanner-container">
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
            className="glass-btn"
          >
            <Camera size={20} />
            Scan Receipt
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="loading-container">
          <Loader2 className="spinner animate-spin mx-auto mb-4" size={48} />
          <p>Processing receipt...</p>
        </div>
      )}

      {error && (
        <div className="message-container message-error">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">Error</span>
          </div>
          <p className="mt-1">{error}</p>
          <button
            onClick={resetScanner}
            className="glass-btn glass-btn-secondary mt-2"
          >
            Try Again
          </button>
        </div>
      )}

      {scanResult && (
        <div className="space-y-4">
          {/* Confidence and Review Status */}
          <div className="confidence-indicator">
            <div className="status">
              {scanResult.needs_review ? (
                <AlertCircle className="text-yellow-500" size={20} />
              ) : (
                <CheckCircle className="text-green-500" size={20} />
              )}
              <span>
                {scanResult.needs_review ? 'Needs Review' : 'Ready to Save'}
              </span>
            </div>
            <div className="percentage">
              Confidence: {formatConfidence(scanResult.ocr_confidence)}%
            </div>
          </div>

          {/* Extracted Data */}
          <div className="extracted-data">
            <h3>Extracted Information:</h3>
            <div className="space-y-1">
              <div className="data-row">
                <span className="data-label">Merchant:</span>
                <span className="data-value">{scanResult.receipt_data.merchant}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Total:</span>
                <span className="data-value">€{scanResult.receipt_data.total.toFixed(2)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Date:</span>
                <span className="data-value">{scanResult.receipt_data.date}</span>
              </div>
              {scanResult.receipt_data.items && scanResult.receipt_data.items.length > 0 && (
                <div className="data-row">
                  <span className="data-label">Items:</span>
                  <span className="data-value">{scanResult.receipt_data.items.length} item(s)</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Expense Details</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="glass-btn glass-btn-secondary"
              >
                <Edit size={16} />
                {editMode ? 'Cancel Edit' : 'Edit'}
              </button>
            </div>

            {editMode ? (
              <div className="glass-form">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="glass-select"
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
              <div className="static-display">
                <div className="display-row">
                  <span className="display-label">Amount:</span>
                  <span className="display-value">€{formData.amount}</span>
                </div>
                <div className="display-row">
                  <span className="display-label">Description:</span>
                  <span className="display-value">{formData.description}</span>
                </div>
                <div className="display-row">
                  <span className="display-label">Category:</span>
                  <span className="display-value">{
                    categories.find(c => c.id.toString() === formData.category_id)?.name || 'Unknown'
                  }</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <button
              onClick={handleCreateExpense}
              disabled={isProcessing || !formData.amount || !formData.category_id}
              className="glass-btn glass-btn-primary"
            >
              {isProcessing ? 'Creating...' : 'Create Expense'}
            </button>
            <button
              onClick={resetScanner}
              className="glass-btn glass-btn-secondary"
            >
              Cancel
            </button>
          </div>

          {/* Raw Text (Collapsible) */}
          {scanResult.raw_text && (
            <div className="raw-text-section">
              <details>
                <summary>
                  View Raw OCR Text
                </summary>
                <pre>
                  {scanResult.raw_text}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;