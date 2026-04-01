import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from '@phosphor-icons/react';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const Reports = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState('issued');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    try {
      const { data } = await axios.get(`${API_BASE}/api/reports/${reportType}`, {
        withCredentials: true,
      });
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReport('issued-books');
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="reports-page">
      <header className="bg-white border-b-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline flex items-center gap-2"
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="reports-title">
            Reports
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white border-2 border-[#111111] mb-6">
          <div className="flex flex-wrap border-b-2 border-[#111111]">
            <button
              onClick={() => fetchReport('issued-books')}
              className={`px-6 py-4 font-bold transition-colors border-r-2 border-[#111111] ${
                activeReport === 'issued'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-white text-[#111111] hover:bg-[#F3F3F0]'
              }`}
              data-testid="issued-books-tab"
            >
              Issued Books
            </button>
            <button
              onClick={() => fetchReport('overdue-books')}
              className={`px-6 py-4 font-bold transition-colors border-r-2 border-[#111111] ${
                activeReport === 'overdue'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-white text-[#111111] hover:bg-[#F3F3F0]'
              }`}
              data-testid="overdue-books-tab"
            >
              Overdue Books
            </button>
            <button
              onClick={() => fetchReport('popular-books')}
              className={`px-6 py-4 font-bold transition-colors ${
                activeReport === 'popular'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-white text-[#111111] hover:bg-[#F3F3F0]'
              }`}
              data-testid="popular-books-tab"
            >
              Popular Books
            </button>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg font-medium">Loading report...</div>
              </div>
            ) : reportData ? (
              <div>
                <div className="mb-6">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#595956] mb-2">
                    Total Records
                  </div>
                  <div className="text-4xl font-black tracking-tighter font-['IBM_Plex_Mono']" data-testid="total-count">
                    {reportData.total !== undefined ? reportData.total : reportData.length}
                  </div>
                </div>

                {activeReport === 'popular' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="table-header text-left">Rank</th>
                          <th className="table-header text-left">Book Name</th>
                          <th className="table-header text-left">Author</th>
                          <th className="table-header text-left">Issue Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item, index) => (
                          <tr key={index} className="table-row" data-testid={`popular-book-row-${index}`}>
                            <td className="table-cell font-['IBM_Plex_Mono'] font-bold">{index + 1}</td>
                            <td className="table-cell">{item.book_name}</td>
                            <td className="table-cell">{item.author}</td>
                            <td className="table-cell font-['IBM_Plex_Mono'] font-bold">{item.issue_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="table-header text-left">Book Name</th>
                          <th className="table-header text-left">Author</th>
                          <th className="table-header text-left">Serial Number</th>
                          <th className="table-header text-left">Member</th>
                          <th className="table-header text-left">Issue Date</th>
                          <th className="table-header text-left">Expected Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.transactions?.map((transaction, index) => (
                          <tr key={index} className="table-row" data-testid={`transaction-row-${index}`}>
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
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-lg font-medium text-[#595956]">No data available</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
