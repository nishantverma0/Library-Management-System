import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const FinePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId, returnDate } = location.state || {};

  const [finePaid, setFinePaid] = useState(false);
  const [fineRemarks, setFineRemarks] = useState('');
  const [fineAmount, setFineAmount] = useState(0);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!transactionId) {
      navigate('/transactions/return');
      return;
    }
    calculateFine();
  }, [transactionId, returnDate]);

  const calculateFine = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/transactions/${transactionId}`, {
        withCredentials: true,
      });
      setTransactionDetails(data);

      const expectedReturn = new Date(data.expected_return_date);
      const actualReturn = new Date(returnDate);

      if (actualReturn > expectedReturn) {
        const daysLate = Math.ceil((actualReturn - expectedReturn) / (1000 * 60 * 60 * 24));
        const calculatedFine = daysLate * 5;
        setFineAmount(calculatedFine);
      } else {
        setFineAmount(0);
        setFinePaid(true);
      }
    } catch (err) {
      setError('Failed to calculate fine');
    }
  };

  const handleComplete = async () => {
    setError('');

    if (fineAmount > 0 && !finePaid) {
      setError('Fine must be paid before completing the return');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/transactions/return`,
        {
          transaction_id: transactionId,
          actual_return_date: returnDate,
          fine_paid: finePaid,
          fine_remarks: fineRemarks || null,
        },
        { withCredentials: true }
      );
      navigate('/transactions', { state: { message: 'Book returned successfully' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete return');
    } finally {
      setLoading(false);
    }
  };

  if (!transactionDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F8]">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="fine-payment-page">
      <header className="bg-white border-b-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/transactions/return')}
            className="btn-outline flex items-center gap-2"
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="fine-payment-title">
            Fine Payment
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div
          className={`bg-white border-2 p-8 mb-6 ${
            fineAmount > 0 ? 'border-[#FFB800]' : 'border-[#14854D]'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-text">Book Name</label>
              <div className="text-base font-medium mt-1" data-testid="book-name-display">
                {transactionDetails.book_name}
              </div>
            </div>

            <div>
              <label className="label-text">Author</label>
              <div className="text-base font-medium mt-1" data-testid="author-display">
                {transactionDetails.author}
              </div>
            </div>

            <div>
              <label className="label-text">Serial Number</label>
              <div className="text-base font-medium mt-1 font-['IBM_Plex_Mono']" data-testid="serial-display">
                {transactionDetails.serial_number}
              </div>
            </div>

            <div>
              <label className="label-text">Member</label>
              <div className="text-base font-medium mt-1" data-testid="member-display">
                {transactionDetails.member_name}
              </div>
            </div>

            <div>
              <label className="label-text">Issue Date</label>
              <div className="text-base font-medium mt-1 font-['IBM_Plex_Mono']" data-testid="issue-date-display">
                {new Date(transactionDetails.issue_date).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label className="label-text">Expected Return Date</label>
              <div className="text-base font-medium mt-1 font-['IBM_Plex_Mono']" data-testid="expected-return-display">
                {new Date(transactionDetails.expected_return_date).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label className="label-text">Actual Return Date</label>
              <div className="text-base font-medium mt-1 font-['IBM_Plex_Mono']" data-testid="actual-return-display">
                {new Date(returnDate).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label className="label-text">Fine Amount</label>
              <div
                className={`text-2xl font-bold mt-1 font-['IBM_Plex_Mono'] ${
                  fineAmount > 0 ? 'text-[#D92D20]' : 'text-[#14854D]'
                }`}
                data-testid="fine-amount-display"
              >
                ₹{fineAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#111111] p-8">
          <h2 className="text-xl font-bold tracking-tight mb-6">Payment Details</h2>
          <div className="space-y-6">
            {fineAmount > 0 && (
              <div
                className={`border-2 p-4 ${
                  finePaid ? 'border-[#14854D] bg-[#14854D]/5' : 'border-[#FFB800] bg-[#FFB800]/5'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={finePaid}
                    onChange={(e) => setFinePaid(e.target.checked)}
                    className="w-5 h-5"
                    data-testid="fine-paid-checkbox"
                  />
                  <span className="font-bold text-base">Fine Paid</span>
                </label>
                {!finePaid && (
                  <p className="text-sm text-[#D92D20] font-medium mt-2" data-testid="fine-warning">
                    Fine must be paid before completing the return
                  </p>
                )}
              </div>
            )}

            {fineAmount === 0 && (
              <div className="border-2 border-[#14854D] bg-[#14854D]/5 p-4 flex items-center gap-3">
                <CheckCircle size={24} weight="fill" className="text-[#14854D]" />
                <span className="font-bold text-base" data-testid="no-fine-message">No fine applicable</span>
              </div>
            )}

            <div>
              <label className="label-text" htmlFor="fine-remarks">
                Remarks (Optional)
              </label>
              <textarea
                id="fine-remarks"
                value={fineRemarks}
                onChange={(e) => setFineRemarks(e.target.value)}
                className="input-field w-full min-h-[100px]"
                data-testid="fine-remarks-input"
              />
            </div>

            {error && <div className="error-text" data-testid="fine-error-message">{error}</div>}

            <button
              onClick={handleComplete}
              disabled={loading || (fineAmount > 0 && !finePaid)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="complete-return-button"
            >
              {loading ? 'Processing...' : 'Complete Return'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinePayment;
