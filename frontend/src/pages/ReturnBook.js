import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const ReturnBook = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIssuedTransactions();
    const today = new Date().toISOString().split('T')[0];
    setReturnDate(today);
  }, []);

  const fetchIssuedTransactions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/transactions?status=issued`, {
        withCredentials: true,
      });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const handleTransactionSelect = async (transactionId) => {
    setSelectedTransaction(transactionId);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE}/api/transactions/${transactionId}`, {
        withCredentials: true,
      });
      setTransactionDetails(data);
      setSerialNumber(data.serial_number);
      setReturnDate(data.expected_return_date.split('T')[0]);
    } catch (err) {
      setError('Failed to load transaction details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedTransaction) {
      setError('Please select a transaction');
      return;
    }

    if (!serialNumber) {
      setError('Serial number is mandatory');
      return;
    }

    navigate('/transactions/fine-payment', {
      state: {
        transactionId: selectedTransaction,
        returnDate: returnDate,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="return-book-page">
      <header className="bg-white border-b-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/transactions')}
            className="btn-outline flex items-center gap-2"
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="return-book-title">
            Return Book
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-white border-2 border-[#111111] mb-6">
          <div className="p-6 border-b-2 border-[#111111]">
            <h2 className="text-xl font-bold tracking-tight">Select Issued Book</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Select</th>
                  <th className="table-header text-left">Book Name</th>
                  <th className="table-header text-left">Author</th>
                  <th className="table-header text-left">Serial Number</th>
                  <th className="table-header text-left">Member</th>
                  <th className="table-header text-left">Issue Date</th>
                  <th className="table-header text-left">Expected Return</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="table-row"
                    data-testid={`transaction-row-${transaction.id}`}
                  >
                    <td className="table-cell">
                      <input
                        type="radio"
                        name="selected-transaction"
                        checked={selectedTransaction === transaction.id}
                        onChange={() => handleTransactionSelect(transaction.id)}
                        className="w-4 h-4"
                        data-testid={`transaction-radio-${transaction.id}`}
                      />
                    </td>
                    <td className="table-cell">{transaction.book_name}</td>
                    <td className="table-cell">{transaction.author}</td>
                    <td className="table-cell font-['IBM_Plex_Mono']">{transaction.serial_number}</td>
                    <td className="table-cell">{transaction.member_name}</td>
                    <td className="table-cell font-['IBM_Plex_Mono'] text-xs">
                      {new Date(transaction.issue_date).toLocaleDateString()}
                    </td>
                    <td className="table-cell font-['IBM_Plex_Mono'] text-xs">
                      {new Date(transaction.expected_return_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {transactionDetails && (
          <div className="bg-white border-2 border-[#111111] p-8">
            <h2 className="text-xl font-bold tracking-tight mb-6">Return Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-text" htmlFor="book-name">
                    Book Name *
                  </label>
                  <input
                    id="book-name"
                    type="text"
                    value={transactionDetails.book_name}
                    className="input-field w-full bg-[#F3F3F0] cursor-not-allowed"
                    disabled
                    data-testid="book-name-input"
                  />
                </div>

                <div>
                  <label className="label-text" htmlFor="author-name">
                    Author Name
                  </label>
                  <input
                    id="author-name"
                    type="text"
                    value={transactionDetails.author}
                    className="input-field w-full bg-[#F3F3F0] cursor-not-allowed"
                    disabled
                    data-testid="author-name-input"
                  />
                </div>

                <div>
                  <label className="label-text" htmlFor="serial-number">
                    Serial Number *
                  </label>
                  <input
                    id="serial-number"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="input-field w-full font-['IBM_Plex_Mono']"
                    required
                    data-testid="serial-number-input"
                  />
                </div>

                <div>
                  <label className="label-text" htmlFor="issue-date">
                    Issue Date
                  </label>
                  <input
                    id="issue-date"
                    type="text"
                    value={new Date(transactionDetails.issue_date).toLocaleDateString()}
                    className="input-field w-full bg-[#F3F3F0] cursor-not-allowed font-['IBM_Plex_Mono']"
                    disabled
                    data-testid="issue-date-input"
                  />
                </div>

                <div>
                  <label className="label-text" htmlFor="return-date">
                    Return Date
                  </label>
                  <input
                    id="return-date"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="input-field w-full font-['IBM_Plex_Mono']"
                    data-testid="return-date-input"
                  />
                </div>
              </div>

              {error && <div className="error-text" data-testid="return-error-message">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                data-testid="confirm-return-button"
              >
                Confirm Return
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReturnBook;
