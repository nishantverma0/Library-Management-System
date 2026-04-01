import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const BookManagement = () => {
  const [mode, setMode] = useState('add');
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'book',
    name: '',
    author: '',
    serial_number: '',
    isbn: '',
    category: '',
    available_copies: 1,
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/books`, { withCredentials: true });
      setBooks(data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const handleBookSelect = async (bookId) => {
    setSelectedBookId(bookId);
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setFormData({
        type: book.type,
        name: book.name,
        author: book.author,
        serial_number: book.serial_number,
        isbn: book.isbn || '',
        category: book.category || '',
        available_copies: book.available_copies,
      });
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.author || !formData.serial_number) {
      setError('All mandatory fields must be filled');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'add') {
        await axios.post(`${API_BASE}/api/books`, formData, { withCredentials: true });
        setSuccess('Book added successfully');
      } else {
        if (!selectedBookId) {
          setError('Please select a book to update');
          setLoading(false);
          return;
        }
        await axios.put(`${API_BASE}/api/books/${selectedBookId}`, formData, {
          withCredentials: true,
        });
        setSuccess('Book updated successfully');
      }
      
      setFormData({
        type: 'book',
        name: '',
        author: '',
        serial_number: '',
        isbn: '',
        category: '',
        available_copies: 1,
      });
      setSelectedBookId('');
      await fetchBooks();
    } catch (err) {
      setError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="book-management-component">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode('add');
            setFormData({
              type: 'book',
              name: '',
              author: '',
              serial_number: '',
              isbn: '',
              category: '',
              available_copies: 1,
            });
            setSelectedBookId('');
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-none transition-colors ${
            mode === 'add'
              ? 'bg-[#FF4B00] text-white'
              : 'bg-[#F3F3F0] text-[#111111] hover:bg-[#E0E0D9]'
          }`}
          data-testid="add-book-mode-button"
        >
          <Plus size={20} />
          Add Book
        </button>
        <button
          onClick={() => {
            setMode('update');
            setError('');
            setSuccess('');
          }}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-none transition-colors ${
            mode === 'update'
              ? 'bg-[#FF4B00] text-white'
              : 'bg-[#F3F3F0] text-[#111111] hover:bg-[#E0E0D9]'
          }`}
          data-testid="update-book-mode-button"
        >
          <Pencil size={20} />
          Update Book
        </button>
      </div>

      {mode === 'update' && (
        <div className="mb-6">
          <label className="label-text" htmlFor="select-book">
            Select Book to Update
          </label>
          <select
            id="select-book"
            value={selectedBookId}
            onChange={(e) => handleBookSelect(e.target.value)}
            className="input-field w-full"
            data-testid="book-select-dropdown"
          >
            <option value="">-- Select a book --</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name} ({book.serial_number})
              </option>
            ))}
          </select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label-text">Type *</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="book"
                checked={formData.type === 'book'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-4 h-4"
                data-testid="type-book-radio"
              />
              <span className="font-medium">Book</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="movie"
                checked={formData.type === 'movie'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-4 h-4"
                data-testid="type-movie-radio"
              />
              <span className="font-medium">Movie</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label-text" htmlFor="book-name">
              {formData.type === 'book' ? 'Book' : 'Movie'} Name *
            </label>
            <input
              id="book-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              required
              data-testid="book-name-input"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="author-name">
              Author *
            </label>
            <input
              id="author-name"
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="input-field w-full"
              required
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
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              className="input-field w-full font-['IBM_Plex_Mono']"
              required
              data-testid="serial-number-input"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="isbn">
              ISBN
            </label>
            <input
              id="isbn"
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              className="input-field w-full font-['IBM_Plex_Mono']"
              data-testid="isbn-input"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field w-full"
              data-testid="category-input"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="available-copies">
              Available Copies *
            </label>
            <input
              id="available-copies"
              type="number"
              min="0"
              value={formData.available_copies}
              onChange={(e) =>
                setFormData({ ...formData, available_copies: parseInt(e.target.value) || 0 })
              }
              className="input-field w-full font-['IBM_Plex_Mono']"
              required
              data-testid="available-copies-input"
            />
          </div>
        </div>

        {error && <div className="error-text" data-testid="book-error-message">{error}</div>}
        {success && (
          <div className="text-[#14854D] text-sm font-medium" data-testid="book-success-message">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          data-testid="submit-book-button"
        >
          {loading ? 'Processing...' : mode === 'add' ? 'Add Book' : 'Update Book'}
        </button>
      </form>
    </div>
  );
};

export default BookManagement;
