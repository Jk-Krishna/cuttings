


import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

export default function ExpenseTracker() {
  // Define expense categories
  const expenseCategories = [
    { value: 'food', label: 'Food' },
    { value: 'transport', label: 'Transport' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'education', label: 'Education' },
    { value: 'others', label: 'Others' }
  ];

  // State variables
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  
  const [income, setIncome] = useState(() => {
    const savedIncome = localStorage.getItem('income');
    return savedIncome ? JSON.parse(savedIncome) : [];
  });

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});
  
  // Income state
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().substr(0, 10));
  const [totalIncome, setTotalIncome] = useState(0);

  // Category specific colors
  const categoryColors = {
    education: { bg: '#bbdefb', text: '#1565c0' },
    food: { bg: '#c8e6c9', text: '#2e7d32' },
    utilities: { bg: '#ffecb3', text: '#f57c00' },
    transport: { bg: '#e1bee7', text: '#7b1fa2' },
    others: { bg: '#d7ccc8', text: '#5d4037' },
  };

  // Define getFilteredExpenses as a useCallback to avoid linting warnings
  const getFilteredExpenses = useCallback(() => {
    let filtered = [...expenses];
    
    // Filter by date type (all, date, month, year)
    if (filterType === 'date') {
      filtered = filtered.filter(expense => expense.date === filterValue);
    } else if (filterType === 'month') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() + 1 === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      });
    } else if (filterType === 'year') {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
      });
    }
    
    // Additional filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }
    
    return filtered;
  }, [expenses, filterType, filterValue, filterCategory, currentMonth, currentYear]);

  // Define calculateTotalIncome as a useCallback
  const calculateTotalIncome = useCallback(() => {
    const filteredIncome = income.filter(item => {
      const incomeDate = new Date(item.date);
      return (filterType === 'month' ? 
        incomeDate.getMonth() + 1 === currentMonth && incomeDate.getFullYear() === currentYear :
        filterType === 'year' ? 
        incomeDate.getFullYear() === currentYear : 
        true);
    });
    
    const total = filteredIncome.reduce((sum, item) => sum + Number(item.amount), 0);
    setTotalIncome(total);
  }, [income, filterType, currentMonth, currentYear]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    const filteredExpenses = getFilteredExpenses();
    calculateTotal(filteredExpenses);
    calculateCategoryTotals(filteredExpenses);
  }, [expenses, getFilteredExpenses]);

  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
    calculateTotalIncome();
  }, [income, calculateTotalIncome]);

  const calculateTotal = (expenseList) => {
    const total = expenseList.reduce((sum, expense) => sum + Number(expense.amount), 0);
    setTotalAmount(total);
  };

  const calculateCategoryTotals = (expenseList) => {
    const totals = expenseList.reduce((acc, expense) => {
      const cat = expense.category || 'others';
      acc[cat] = (acc[cat] || 0) + Number(expense.amount);
      return acc;
    }, {});
    
    setCategoryTotals(totals);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || !date) {
      alert('Please fill all required fields');
      return;
    }

    // Add new expense
    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      category,
      date
    };
    setExpenses([...expenses, newExpense]);
    
    // Clear form
    setAmount('');
    setCategory('food');
    setDate(new Date().toISOString().substr(0, 10));
  };

  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    
    if (!monthlyIncome || !incomeDate) {
      alert('Please enter income amount and date');
      return;
    }

    // Add new income
    const newIncome = {
      id: Date.now(),
      amount: Number(monthlyIncome),
      date: incomeDate
    };
    setIncome([...income, newIncome]);
    
    // Clear form
    setMonthlyIncome('');
    setIncomeDate(new Date().toISOString().substr(0, 10));
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleIncomeDelete = (id) => {
    setIncome(income.filter(item => item.id !== id));
  };

  const getFilteredIncome = useCallback(() => {
    let filtered = [...income];
    
    // Filter by date type (all, date, month, year)
    if (filterType === 'date') {
      filtered = filtered.filter(item => item.date === filterValue);
    } else if (filterType === 'month') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() + 1 === currentMonth && 
               itemDate.getFullYear() === currentYear;
      });
    } else if (filterType === 'year') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getFullYear() === currentYear;
      });
    }
    
    return filtered;
  }, [income, filterType, filterValue, currentMonth, currentYear]);

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (type === 'date') {
      setFilterValue(new Date().toISOString().substr(0, 10));
    }
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };
  
  return (
    <div className="app-container">
      <h1 className="main-title">Daily Expense Tracker</h1>
      
      <div className="dashboard-layout">
        {/* Left Column */}
        <div className="left-column">
          {/* Income Form - FIRST IN ORDER */}
          
          <div className="card">
            <h2 className="card-title">Add Income</h2>
            
            <form onSubmit={handleIncomeSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="buttons-container">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Income
                </button>
              </div>
            </form>
          </div>
          
          {/* Input Form for Expenses - SECOND IN ORDER */}
          <div className="card">
            <h2 className="card-title">Add New Expense</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-control"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="buttons-container">
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
          <p style={{ fontSize: '16px',
                      fontWeight:'bold',
                      textAlign:'center',
                      color: '#1976d2',
                      fontFamily: 'Lato, sans-serif',
                      lineHeight: '1.6',
                      margin: '20px 0',
                      padding: '5px',
                      backgroundColor: '#e8f4ff',
                      maxWidth:'content-fit',
                      borderRadius: '5px'}}>
             SAVINGS STORY
          </p>
          {/* Budget Summary - THIRD IN ORDER */}
          <div className="card">
            <h2 className="card-title">Budget Summary</h2>
            
            <div className="budget-overview">
              <div className="budget-item">
                <span>Total Income:</span>
                <span className="amount income">${totalIncome.toFixed(2)}</span>
              </div>
              <div className="budget-item">
                <span>Total Expenses:</span>
                <span className="amount expense">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="budget-item">
                <span>Balance:</span>
                <span className={`amount ${totalIncome - totalAmount >= 0 ? 'positive' : 'negative'}`}>
                  ${(totalIncome - totalAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Category Summary Section - FOURTH IN ORDER */}
          <div className="card">
            <h2 className="card-title">Category Summary</h2>
            
            <div className="category-stats">
              {expenseCategories.map(cat => (
                <div key={cat.value} 
                    className="category-card" 
                    style={{borderTopColor: categoryColors[cat.value]?.text || categoryColors.others.text}}>
                  <div>{cat.label}</div>
                  <div className="category-amount">
                    ${(categoryTotals[cat.value] || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="right-column">
          {/* Filter Controls - NEW POSITION: FIRST IN RIGHT COLUMN */}
          <div className="card">
            <h2 className="card-title">Filter Category</h2>
            
            <div className="filter-buttons">
              <button
                onClick={() => handleFilterChange('all')}
                className={`filter-btn ${filterType === 'all' ? 'filter-btn-active' : ''}`}
              >
                All
              </button>
              
              <button
                onClick={() => handleFilterChange('date')}
                className={`filter-btn ${filterType === 'date' ? 'filter-btn-active' : ''}`}
              >
                By Date
              </button>
              
              <button
                onClick={() => handleFilterChange('month')}
                className={`filter-btn ${filterType === 'month' ? 'filter-btn-active' : ''}`}
              >
                By Month
              </button>
              
              <button
                onClick={() => handleFilterChange('year')}
                className={`filter-btn ${filterType === 'year' ? 'filter-btn-active' : ''}`}
              >
                By Year
              </button>
            </div>
            
            <div className="filter-controls">
              {filterType === 'date' && (
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="form-control"
                  />
                </div>
              )}
              
              {filterType === 'month' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(Number(e.target.value))}
                      className="form-control"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      className="form-control"
                    >
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {filterType === 'year' && (
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="form-control"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Category Filter</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="form-control"
                >
                  <option value="all">All Categories</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        
          {/* Income Summary - NOW SECOND IN RIGHT COLUMN */}
          <div className="card">
            <h2 className="card-title">Income Summary</h2>
            
            <div className="summary-bar">
              <h3 className="card-title inline-card-title">
                {filterType === 'all' && 'All Income'}
                {filterType === 'date' && `Income for ${filterValue}`}
                {filterType === 'month' && `Income for ${getMonthName(currentMonth)} ${currentYear}`}
                {filterType === 'year' && `Income for ${currentYear}`}
              </h3>
              <div className="total-amount">
                ${totalIncome.toFixed(2)}
              </div>
            </div>
            
            {getFilteredIncome().length === 0 ? (
              <div className="empty-state">
                No income records found for the selected period.
              </div>
            ) : (
              <div className="income-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="text-right">Amount</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredIncome().sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td className="text-right">${Number(item.amount).toFixed(2)}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleIncomeDelete(item.id)}
                              className="btn btn-danger"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Expenses List - NOW THIRD IN RIGHT COLUMN */}
          <div className="card">
            <div className="summary-bar">
              <h2 className="card-title inline-card-title">
                {filterType === 'all' && 'All Expenses'}
                {filterType === 'date' && `Expenses for ${filterValue}`}
                {filterType === 'month' && `Expenses for ${getMonthName(currentMonth)} ${currentYear}`}
                {filterType === 'year' && `Expenses for ${currentYear}`}
                {filterCategory !== 'all' && ` - ${expenseCategories.find(c => c.value === filterCategory)?.label}`}
              </h2>
              <div className="total-amount">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
            
            {getFilteredExpenses().length === 0 ? (
              <div className="empty-state">
                No expenses found for the selected period.
              </div>
            ) : (
              <div className="expense-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th className="text-right">Amount</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredExpenses().sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => (
                      <tr key={expense.id}>
                        <td>{expense.date}</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: categoryColors[expense.category || 'others']?.bg || categoryColors.others.bg,
                            color: categoryColors[expense.category || 'others']?.text || categoryColors.others.text
                          }}>
                            {expenseCategories.find(cat => cat.value === expense.category)?.label || 'Others'}
                          </span>
                        </td>
                        <td className="text-right">${Number(expense.amount).toFixed(2)}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="btn btn-danger"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
