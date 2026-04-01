import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Books as BooksIcon, Users, CreditCard } from '@phosphor-icons/react';
import BookManagement from '../components/BookManagement';
import MembershipManagement from '../components/MembershipManagement';

const Maintenance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="min-h-screen bg-[#F9F9F8]" data-testid="maintenance-page">
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
          <h1 className="text-2xl font-extrabold tracking-tight" data-testid="maintenance-title">
            Maintenance
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white border-2 border-[#111111] mb-6">
          <div className="flex border-b-2 border-[#111111]">
            <button
              onClick={() => setActiveTab('books')}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors ${
                activeTab === 'books'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-white text-[#111111] hover:bg-[#F3F3F0]'
              }`}
              data-testid="books-tab"
            >
              <BooksIcon size={20} />
              Book Management
            </button>
            <button
              onClick={() => setActiveTab('memberships')}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors border-l-2 border-[#111111] ${
                activeTab === 'memberships'
                  ? 'bg-[#FF4B00] text-white'
                  : 'bg-white text-[#111111] hover:bg-[#F3F3F0]'
              }`}
              data-testid="memberships-tab"
            >
              <CreditCard size={20} />
              Membership Management
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'books' && <BookManagement />}
            {activeTab === 'memberships' && <MembershipManagement />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Maintenance;
