import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const IssueBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const book = location.state?.book;

  const [membershipNumber, setMembershipNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!book) {
      navigate('/transactions');
    }
    const today = new Date().toISOString().split('T')[0];
    setIssueDate(today);
    calculateReturnDate(today);
  }, [book, navigate]);

  const calculateReturnDate = (issue) => {
    const issueDateTime = new Date(issue);
    const returnDateTime = new Date(issueDateTime);
    returnDateTime.setDate(returnDateTime.getDate() + 15);
    setReturnDate(returnDateTime.toISOString().split('T')[0]);
  };

  const handleIssueDateChange = (e) => {
    const newIssueDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    if (newIssueDate < today) {
      setError('Issue date cannot be before today');
      return;
    }
    setError('');
    setIssueDate(newIssueDate);
    calculateReturnDate(newIssueDate);
  };

  const handleReturnDateChange = (e) => {
    const newReturnDate = e.target.value;
    const issueDateTime = new Date(issueDate);
    const returnDateTime = new Date(newReturnDate);
    const maxReturnDate = new Date(issueDateTime);
    maxReturnDate.setDate(maxReturnDate.getDate() + 15);

    if (returnDateTime > maxReturnDate) {
      setError('Return date cannot be more than 15 days from issue date');
      return;
    }
    setError('');
    setReturnDate(newReturnDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!membershipNumber) {
      setError('Membership number is required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/transactions/issue`,
        {
          book_id: book.id,
          membership_number: membershipNumber,
          issue_date: issueDate,
          return_date: returnDate,
          remarks: remarks || null,
        },
        { withCredentials: true }
      );
      navigate('/transactions', { state: { message: 'Book issued successfully' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  if (!book) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="issue-book-page">
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
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="issue-book-title">
            Issue Book
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="bg-white border-2 border-[#111111] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label-text" htmlFor="book-name">
                  Book Name *
                </label>
                <input
                  id="book-name"
                  type="text"
                  value={book.name}
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
                  value={book.author}
                  className="input-field w-full bg-[#F3F3F0] cursor-not-allowed"
                  disabled
                  data-testid="author-name-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="membership-number">
                  Membership Number *
                </label>
                <input
                  id="membership-number"
                  type="text"
                  value={membershipNumber}
                  onChange={(e) => setMembershipNumber(e.target.value)}
                  className="input-field w-full font-['IBM_Plex_Mono']"
                  required
                  data-testid="membership-number-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="serial-number">
                  Serial Number
                </label>
                <input
                  id="serial-number"
                  type="text"
                  value={book.serial_number}
                  className="input-field w-full bg-[#F3F3F0] cursor-not-allowed font-['IBM_Plex_Mono']"
                  disabled
                  data-testid="serial-number-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="issue-date">
                  Issue Date *
                </label>
                <input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={handleIssueDateChange}
                  className="input-field w-full font-['IBM_Plex_Mono']"
                  required
                  data-testid="issue-date-input"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="return-date">
                  Return Date * (Max 15 days)
                </label>
                <input
                  id="return-date"
                  type="date"
                  value={returnDate}
                  onChange={handleReturnDateChange}
                  className="input-field w-full font-['IBM_Plex_Mono']"
                  required
                  data-testid="return-date-input"
                />
              </div>
            </div>

            <div>
              <label className="label-text" htmlFor="remarks">
                Remarks (Optional)
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="input-field w-full min-h-[100px]"
                data-testid="remarks-input"
              />
            </div>

            {error && <div className="error-text" data-testid="issue-error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              data-testid="submit-issue-button"
            >
              {loading ? 'Issuing Book...' : 'Issue Book'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default IssueBook;
