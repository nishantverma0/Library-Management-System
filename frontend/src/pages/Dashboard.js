import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Books, Users, CreditCard, FileText, SignOut } from '@phosphor-icons/react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="dashboard-page">
      <header className="bg-white border-b-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="dashboard-title">
            Library Dashboard
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs uppercase tracking-wider text-[#595956] font-['IBM_Plex_Mono']">
                {user?.role}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline flex items-center gap-2"
              data-testid="logout-button"
            >
              <SignOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate('/transactions')}
            className="bg-white border-2 border-[#111111] p-8 cursor-pointer hover:bg-[#F3F3F0] transition-colors"
            data-testid="transactions-module-card"
          >
            <Books size={48} weight="regular" className="mb-4" />
            <h2 className="text-2xl font-bold tracking-tight mb-2">Transactions</h2>
            <p className="text-sm font-medium text-[#595956]">
              Search books, issue, and return operations
            </p>
          </div>

          <div
            onClick={() => navigate('/reports')}
            className="bg-white border-2 border-[#111111] p-8 cursor-pointer hover:bg-[#F3F3F0] transition-colors"
            data-testid="reports-module-card"
          >
            <FileText size={48} weight="regular" className="mb-4" />
            <h2 className="text-2xl font-bold tracking-tight mb-2">Reports</h2>
            <p className="text-sm font-medium text-[#595956]">
              View issued books, overdue items, and statistics
            </p>
          </div>

          {user?.role === 'admin' && (
            <>
              <div
                onClick={() => navigate('/maintenance')}
                className="bg-white border-2 border-[#111111] p-8 cursor-pointer hover:bg-[#F3F3F0] transition-colors"
                data-testid="maintenance-module-card"
              >
                <CreditCard size={48} weight="regular" className="mb-4" />
                <h2 className="text-2xl font-bold tracking-tight mb-2">Maintenance</h2>
                <p className="text-sm font-medium text-[#595956]">
                  Manage books, memberships, and users
                </p>
              </div>

              <div
                onClick={() => navigate('/user-management')}
                className="bg-white border-2 border-[#111111] p-8 cursor-pointer hover:bg-[#F3F3F0] transition-colors"
                data-testid="user-management-card"
              >
                <Users size={48} weight="regular" className="mb-4" />
                <h2 className="text-2xl font-bold tracking-tight mb-2">User Management</h2>
                <p className="text-sm font-medium text-[#595956]">
                  Create and manage system users
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
