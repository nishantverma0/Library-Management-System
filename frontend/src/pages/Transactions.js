import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const Transactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchName, setSearchName] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchSerial, setSearchSerial] = useState('');
  const [results, setResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    if (!searchName && !searchAuthor && !searchSerial) {
      setError('At least one search field must be filled');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchAuthor) params.append('author', searchAuthor);
      if (searchSerial) params.append('serial_number', searchSerial);

      const { data } = await axios.get(`${API_BASE}/api/books/search?${params.toString()}`, {
        withCredentials: true,
      });
      setResults(data);
      setSelectedBook(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = () => {
    if (!selectedBook) {
      setError('Please select a book from the results');
      return;
    }
    navigate('/transactions/issue', { state: { book: selectedBook } });
  };

  const handleReturn = () => {
    navigate('/transactions/return');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="transactions-page">
      <header className="bg-white border-b-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline flex items-center gap-2"
            data-testid="back-to-dashboard-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="transactions-title">
            Transactions
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="bg-white border-2 border-[#111111] p-8 mb-6">
          <h2 className="text-xl font-bold tracking-tight mb-6">Book Availability Search</h2>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label-text" htmlFor="search-name">
                  Book Name
                </label>
                <input
                  id="search-name"
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="input-field w-full"
                  data-testid="search-name-input"
                />
              </div>
              <div>
                <label className="label-text" htmlFor="search-author">
                  Author Name
                </label>
                <input
                  id="search-author"
                  type="text"
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                  className="input-field w-full"
                  data-testid="search-author-input"
                />
              </div>
              <div>
                <label className="label-text" htmlFor="search-serial">
                  Serial Number
                </label>
                <input
                  id="search-serial"
                  type="text"
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  className="input-field w-full"
                  data-testid="search-serial-input"
                />
              </div>
            </div>

            {error && <div className="error-text" data-testid="search-error-message">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
              data-testid="search-submit-button"
            >
              <MagnifyingGlass size={20} />
              {loading ? 'Searching...' : 'Search Books'}
            </button>
          </form>
        </div>

        {results.length > 0 && (
          <div className="bg-white border-2 border-[#111111] mb-6" data-testid="search-results">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header text-left">Select</th>
                    <th className="table-header text-left">Type</th>
                    <th className="table-header text-left">Book Name</th>
                    <th className="table-header text-left">Author</th>
                    <th className="table-header text-left">Serial Number</th>
                    <th className="table-header text-left">Available Copies</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((book) => (
                    <tr key={book.id} className="table-row" data-testid={`book-row-${book.id}`}>
                      <td className="table-cell">
                        <input
                          type="radio"
                          name="selected-book"
                          checked={selectedBook?.id === book.id}
                          onChange={() => setSelectedBook(book)}
                          className="w-4 h-4"
                          data-testid={`book-radio-${book.id}`}
                        />
                      </td>
                      <td className="table-cell uppercase text-xs font-['IBM_Plex_Mono']">{book.type}</td>
                      <td className="table-cell">{book.name}</td>
                      <td className="table-cell">{book.author}</td>
                      <td className="table-cell font-['IBM_Plex_Mono']">{book.serial_number}</td>
                      <td className="table-cell font-['IBM_Plex_Mono']">{book.available_copies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleIssue}
            disabled={!selectedBook}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="issue-book-button"
          >
            Issue Selected Book
          </button>
          <button
            onClick={handleReturn}
            className="btn-secondary"
            data-testid="return-book-button"
          >
            Return Book
          </button>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
