import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingDown, MessageCircle, BarChart3, Home, Send, X, Table, LogOut, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API Base URL - uses Vite proxy in development
const API_BASE_URL = '/api';

const ExpenseTracker = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    income: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  // Currency and timezone options
  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];
  const timezones = [
    'Asia/Kolkata',
    'America/New_York', 
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'UTC'
  ];

  // App state
  const [page, setPage] = useState('home');
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    item: '',
    amount: '',
    category: 'Food'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];
  const categoryColors = {
    'Food': '#FF6384',
    'Transport': '#36A2EB',
    'Shopping': '#FFCE56',
    'Bills': '#4BC0C0',
    'Entertainment': '#9966FF',
    'Health': '#FF9F40',
    'Other': '#C9CBCF'
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const balance = income - totalExpenses;

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIncome(JSON.parse(savedUser).income || 0);
      setIsLoggedIn(true);
      fetchExpenses(token);
    }
  }, []);

  // Fetch user expenses
  const fetchExpenses = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIncome(data.user.income);
        setExpenses(data.expenses || []);
        setIsLoggedIn(true);
        setLoginForm({ email: '', password: '' });
      } else {
        setAuthError(data.detail || data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Unable to connect to server. Please try again later.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match');
      setAuthLoading(false);
      return;
    }

    if (!registerForm.income || parseFloat(registerForm.income) <= 0) {
      setAuthError('Please enter a valid income amount');
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          income: parseFloat(registerForm.income),
          currency: registerForm.currency,
          timezone: registerForm.timezone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIncome(data.user.income);
        setExpenses([]);
        setIsLoggedIn(true);
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '', income: '', currency: 'INR', timezone: 'Asia/Kolkata' });
      } else {
        setAuthError(data.detail || data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError('Unable to connect to server. Please try again later.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setIncome(0);
    setExpenses([]);
    setPage('home');
  };

  const addExpense = async () => {
    if (newExpense.item && newExpense.amount) {
      const expenseData = {
        date: newExpense.date,
        item: newExpense.item,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category
      };

      try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(expenseData),
        });

        if (response.ok) {
          const savedExpense = await response.json();
          setExpenses([...expenses, savedExpense]);
        } else {
          // Fallback to local-only if API fails
          setExpenses([...expenses, { ...expenseData, id: Date.now() }]);
        }
      } catch (error) {
        console.error('Failed to save expense:', error);
        // Fallback to local-only
        setExpenses([...expenses, { ...expenseData, id: Date.now() }]);
      }

      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        item: '',
        amount: '',
        category: 'Food'
      });
      setShowAddExpense(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
    
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getCategoryTotals = () => {
    const totals = {};
    categories.forEach(cat => totals[cat] = 0);
    expenses.forEach(exp => {
      totals[exp.category] += parseFloat(exp.amount);
    });
    return Object.entries(totals)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrend = () => {
    const monthly = {};
    expenses.forEach(exp => {
      const month = exp.date.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + parseFloat(exp.amount);
    });
    return Object.entries(monthly)
      .sort()
      .map(([month, amount]) => ({ month, amount }));
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages([...chatMessages, { type: 'user', text: userMessage }]);
    setChatInput('');

    setTimeout(() => {
      let response = '';
      const lowerQuery = userMessage.toLowerCase();

      if (lowerQuery.includes('total') || lowerQuery.includes('spent')) {
        response = `You've spent ₹${totalExpenses.toFixed(2)} in total. Your remaining balance is ₹${balance.toFixed(2)}.`;
      } else if (lowerQuery.includes('category') || lowerQuery.includes('most')) {
        const categoryTotals = getCategoryTotals();
        if (categoryTotals.length > 0) {
          const topCategory = categoryTotals.sort((a, b) => b.value - a.value)[0];
          response = `You've spent the most on ${topCategory.name} with ₹${topCategory.value.toFixed(2)}. Consider reviewing this category if you want to save more.`;
        } else {
          response = "You haven't added any expenses yet. Start tracking to get insights!";
        }
      } else if (lowerQuery.includes('save') || lowerQuery.includes('tip')) {
        response = "Here's a tip: Try the 50/30/20 rule - 50% for needs, 30% for wants, and 20% for savings. Track your expenses regularly to stay on budget!";
      } else if (lowerQuery.includes('balance')) {
        response = `Your current balance is ₹${balance.toFixed(2)}. ${balance > 0 ? "You're doing great!" : "Consider reducing expenses to improve your balance."}`;
      } else {
        response = `Based on your ${expenses.length} expenses, you're spending an average of ₹${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : 0} per transaction. How can I help you manage your finances better?`;
      }

      setChatMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 500);
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ExpenseFlow
          </h1>
          <p className="text-white/60">Track your expenses, master your finances</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setAuthPage('login'); setAuthError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                authPage === 'login' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthPage('register'); setAuthError(''); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                authPage === 'register' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
              {authError}
            </div>
          )}

          {authPage === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Monthly Income (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">₹</span>
                  <input
                    type="number"
                    value={registerForm.income}
                    onChange={(e) => setRegisterForm({ ...registerForm, income: e.target.value })}
                    placeholder="Enter your monthly income"
                    required
                    min="1"
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Currency</label>
                  <select
                    value={registerForm.currency}
                    onChange={(e) => setRegisterForm({ ...registerForm, currency: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr} className="bg-slate-800">{curr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Timezone</label>
                  <select
                    value={registerForm.timezone}
                    onChange={(e) => setRegisterForm({ ...registerForm, timezone: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition text-sm"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz} className="bg-slate-800">{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-xl font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
    );
  }

  // Main App (after login)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ExpenseFlow
            </h1>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage('home')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  page === 'home' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Home size={18} />
                Home
              </button>
              <button
                onClick={() => setPage('analytics')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  page === 'analytics' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <BarChart3 size={18} />
                Analytics
              </button>
              <button
                onClick={() => setPage('sheet')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  page === 'sheet' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Table size={18} />
                Sheet View
              </button>
              
              {/* User Menu */}
              <div className="ml-4 pl-4 border-l border-white/20 flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-white/50">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {page === 'home' && (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
              <p className="text-white/60">Here's your financial overview for this month</p>
            </div>

            {/* Balance Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                <p className="text-green-300 text-sm mb-2">Income</p>
                <p className="text-3xl font-bold">₹{income.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
                <p className="text-red-300 text-sm mb-2">Total Expenses</p>
                <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                <p className="text-purple-300 text-sm mb-2">Balance</p>
                <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
              </div>
            </div>

            {/* Add Expense Button */}
            <button
              onClick={() => setShowAddExpense(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold transition shadow-lg"
            >
              <PlusCircle size={20} />
              Add New Expense
            </button>

            {/* Expense List */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
              {expenses.length === 0 ? (
                <p className="text-white/50 text-center py-8">No expenses yet. Add your first expense!</p>
              ) : (
                <div className="space-y-3">
                  {expenses.slice().reverse().map((exp) => (
                    <div key={exp.id} className="bg-white/5 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: categoryColors[exp.category] + '40' }}
                          >
                            <TrendingDown size={20} style={{ color: categoryColors[exp.category] }} />
                          </div>
                          <div>
                            <p className="font-semibold">{exp.item}</p>
                            <p className="text-sm text-white/60">{exp.category} • {exp.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-red-400">-₹{exp.amount}</p>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="text-white/40 hover:text-red-400 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {page === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Analytics</h2>
            
            {expenses.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
                <p className="text-white/50 text-lg">Add some expenses to see analytics</p>
              </div>
            ) : (
              <>
                {/* Category Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Spending by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getCategoryTotals()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCategoryTotals().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Category Totals</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getCategoryTotals()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="name" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Trend */}
                {getMonthlyTrend().length > 0 && (
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Monthly Spending Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getMonthlyTrend()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="month" stroke="#fff" />
                        <YAxis stroke="#fff" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                        <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {page === 'sheet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Expense Sheet</h2>
              <div className="text-right">
                <p className="text-sm text-white/60">Total Entries: {expenses.length}</p>
                <p className="text-lg font-semibold text-purple-400">Total: ₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Summary Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-300 text-sm mb-1">Total Income</p>
                  <p className="text-2xl font-bold">₹{income.toLocaleString()}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-300 text-sm mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm mb-1">Current Balance</p>
                  <p className="text-2xl font-bold">₹{balance.toLocaleString()}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-purple-300 text-sm mb-1">Avg. Expense</p>
                  <p className="text-2xl font-bold">₹{expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : 0}</p>
                </div>
              </div>
            </div>

            {/* Spreadsheet Table */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-600/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Item</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Amount (₹)</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Running Balance (₹)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Income Row */}
                    <tr className="border-b border-white/10 bg-green-500/5">
                      <td className="px-6 py-4 text-sm">-</td>
                      <td className="px-6 py-4 text-sm">-</td>
                      <td className="px-6 py-4 font-semibold">Initial Income</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                          Income
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-400">+{income.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-400">{income.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">-</td>
                    </tr>
                    
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-white/50">
                          No expenses recorded yet. Add your first expense to see it here!
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp, index) => {
                        const runningExpenses = expenses.slice(0, index + 1).reduce((sum, e) => sum + parseFloat(e.amount), 0);
                        const runningBalance = income - runningExpenses;
                        
                        return (
                          <tr key={exp.id} className="border-b border-white/10 hover:bg-white/5 transition">
                            <td className="px-6 py-4 text-sm text-white/60">{index + 1}</td>
                            <td className="px-6 py-4 text-sm">{exp.date}</td>
                            <td className="px-6 py-4 font-medium">{exp.item}</td>
                            <td className="px-6 py-4">
                              <span 
                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ 
                                  backgroundColor: categoryColors[exp.category] + '30',
                                  color: categoryColors[exp.category]
                                }}
                              >
                                {exp.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-red-400">-{parseFloat(exp.amount).toLocaleString()}</td>
                            <td className={`px-6 py-4 text-right font-semibold ${runningBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {runningBalance.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => deleteExpense(exp.id)}
                                className="text-white/40 hover:text-red-400 transition"
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                    
                    {/* Total Row */}
                    {expenses.length > 0 && (
                      <tr className="bg-purple-600/20 font-bold">
                        <td colSpan="4" className="px-6 py-4 text-right">TOTAL EXPENSES:</td>
                        <td className="px-6 py-4 text-right text-red-400">-{totalExpenses.toLocaleString()}</td>
                        <td className={`px-6 py-4 text-right ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-600/20">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Count</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">Total (₹)</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCategoryTotals().map((cat) => {
                      const count = expenses.filter(e => e.category === cat.name).length;
                      const percentage = ((cat.value / totalExpenses) * 100).toFixed(1);
                      
                      return (
                        <tr key={cat.name} className="border-b border-white/10">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: categoryColors[cat.name] }}
                              ></div>
                              <span className="font-medium">{cat.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right text-white/70">{count}</td>
                          <td className="px-6 py-3 text-right font-semibold">{cat.value.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-purple-400 font-semibold">{percentage}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Expense</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-white/60 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Item</label>
                <input
                  type="text"
                  value={newExpense.item}
                  onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
                  placeholder="e.g., Groceries"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-semibold transition"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full shadow-2xl transition z-40"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-800 rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold">Expense Assistant</h3>
            <button onClick={() => setShowChatbot(false)} className="hover:bg-white/20 p-1 rounded">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-white/50 text-sm text-center py-8">
                Ask me about your expenses, savings tips, or spending patterns!
              </div>
            )}
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-white/10'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Ask about your expenses..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
              />
              <button
                onClick={handleChat}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-2 rounded-lg transition"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
