import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import expenseService from '../services/expenseService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ExpenseTracker = () => {
  const { trips, activeTrip, selectTrip } = useTrip();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load expenses for selected trip
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!activeTrip) return;
      setLoading(true);
      try {
        const data = await expenseService.getExpensesByTrip(activeTrip._id);
        setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [activeTrip]);

  // Handle trip selection dropdown
  const handleTripChange = (e) => {
    const tripId = e.target.value;
    if (tripId) {
      selectTrip(tripId);
    }
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeTrip) return;
    if (!expenseForm.title.trim() || !expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const data = await expenseService.createExpense({
        trip: activeTrip._id,
        title: expenseForm.title.trim(),
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date
      });
      setExpenses(prev => [data, ...prev]);
      setExpenseForm({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      alert('Failed to log expense: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(exp => exp._id !== id));
    } catch (err) {
      alert('Failed to delete expense: ' + (err.response?.data?.message || err.message));
    }
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = activeTrip ? Math.max(0, activeTrip.budget - totalSpent) : 0;
  const budgetPercentage = activeTrip ? Math.min(100, Math.round((totalSpent / activeTrip.budget) * 100)) : 0;

  const categories = ['Hotels', 'Food', 'Shopping', 'Transport', 'Entertainment'];
  const COLORS = {
    Hotels: '#8083ff',
    Food: '#4cd7f6',
    Shopping: '#d0bcff',
    Transport: '#acedff',
    Entertainment: '#ffb4ab'
  };

  // Aggregate expenses for Recharts
  const chartData = categories.map(cat => {
    const total = expenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  const barChartData = [
    { name: 'Budget Cap', Amount: activeTrip ? activeTrip.budget : 0, fill: '#1f1f27' },
    { name: 'Logged Debits', Amount: totalSpent, fill: totalSpent > (activeTrip?.budget || 0) ? '#ffb4ab' : '#8083ff' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-grow p-6 md:p-8 space-y-8 bg-background max-w-container-max mx-auto w-full">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface font-headline-md">Financial Ledger</h2>
          <p className="text-label-sm text-on-surface-variant font-label-sm opacity-70">
            Account for travel debits, query category aggregates, and review remaining reserves.
          </p>
        </div>

        {/* Trip Selector Dropdown */}
        <div className="relative min-w-[200px] w-full md:w-auto">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">travel</span>
          <select
            value={activeTrip?._id || ''}
            onChange={handleTripChange}
            className="input-field w-full pl-11 pr-10 py-2.5 rounded-xl text-[13.5px] appearance-none"
          >
            <option value="" disabled>Select Journey Focus...</option>
            {trips.map(trip => (
              <option key={trip._id} value={trip._id}>
                {trip.destination} ({new Date(trip.startDate).getFullYear()})
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant pointer-events-none opacity-60">arrow_drop_down</span>
        </div>
      </div>

      {activeTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns: Add expense & Transaction History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Record debit card */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Record Expedition Debit
              </h3>
              <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">TRANSACTION NAME</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Taxi to Kyoto station"
                    required
                    value={expenseForm.title}
                    onChange={handleFormChange}
                    className="input-field w-full px-3.5 py-2.5 rounded-xl text-[13.5px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">AMOUNT DEBITED (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    placeholder="25.50"
                    required
                    value={expenseForm.amount}
                    onChange={handleFormChange}
                    className="input-field w-full px-3.5 py-2.5 rounded-xl text-[13.5px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">CATEGORY TAG</label>
                  <select
                    name="category"
                    value={expenseForm.category}
                    onChange={handleFormChange}
                    className="input-field w-full px-3.5 py-2.5 rounded-xl text-[13.5px]"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">DATE OF DEBIT</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={expenseForm.date}
                    onChange={handleFormChange}
                    className="input-field w-full px-3.5 py-2.5 rounded-xl text-[13.5px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:col-span-2 bg-primary text-on-primary py-3 rounded-xl font-semibold text-label-sm font-label-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-on-primary rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Commit Transaction</span>
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Transaction Log History */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">history</span>
                Expedition Debit Logs
              </h3>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : expenses.length > 0 ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[11px] font-bold tracking-widest text-on-surface-variant uppercase font-label-sm pb-3">
                        <th className="pb-3 pr-4">Transaction Details</th>
                        <th className="pb-3 pr-4">Category</th>
                        <th className="pb-3 pr-4">Debit Date</th>
                        <th className="pb-3 text-right">Debit Size</th>
                        <th className="pb-3 text-right w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-[13px]">
                      {expenses.map(exp => (
                        <tr key={exp._id} className="hover:bg-surface-container-low/20 transition-colors group">
                          <td className="py-3.5 pr-4 font-semibold text-on-surface">{exp.title}</td>
                          <td className="py-3.5 pr-4">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                              style={{
                                color: COLORS[exp.category],
                                borderColor: `${COLORS[exp.category]}30`,
                                backgroundColor: `${COLORS[exp.category]}10`
                              }}
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-on-surface-variant opacity-80">{formatDate(exp.date)}</td>
                          <td className="py-3.5 text-right font-bold font-headline-md text-on-surface">${exp.amount.toFixed(2)}</td>
                          <td className="py-3.5 text-right pl-2">
                            <button
                              onClick={() => handleDeleteExpense(exp._id)}
                              className="text-error opacity-0 group-hover:opacity-100 hover:bg-error-container/20 p-1.5 rounded-lg transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-[13px] text-on-surface-variant italic">No debits logged for this expedition profile.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summaries & Charts */}
          <div className="space-y-8">
            {/* Balance sheet progress */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                Reserves Balance Sheet
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                  <span className="text-[13px] text-on-surface-variant font-medium">Trip Budget</span>
                  <span className="text-[15px] font-bold text-on-surface">${activeTrip.budget}</span>
                </div>
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                  <span className="text-[13px] text-on-surface-variant font-medium">Total Expended</span>
                  <span className="text-[15px] font-bold text-secondary">${totalSpent}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[13px] text-on-surface-variant font-medium">Remaining Reserves</span>
                  <span className="text-[15px] font-bold text-primary">${remainingBudget}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        budgetPercentage > 85 ? 'bg-error' : 'primary-gradient'
                      }`}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-on-surface-variant opacity-75 font-semibold text-right">
                    {budgetPercentage}% Expended
                  </div>
                </div>
              </div>
            </div>

            {/* Category breakdown Recharts pie */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">pie_chart</span>
                Debit Distribution
              </h3>

              {chartData.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(31, 31, 39, 0.95)',
                            borderColor: 'rgba(144, 143, 160, 0.2)',
                            borderRadius: '8px',
                            color: '#e4e1ed'
                          }}
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend list */}
                  <div className="space-y-2 text-[12px] font-medium border-t border-outline-variant/10 pt-4">
                    {chartData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[item.name] }}></span>
                        <span className="truncate opacity-80">{item.name}</span>
                        <span className="font-bold ml-auto">${item.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-center">
                  <p className="text-[13px] text-on-surface-variant italic max-w-[200px]">
                    No transactions committed yet. Log details to compile distribution graph.
                  </p>
                </div>
              )}
            </div>

            {/* Budget vs debits Bar Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">bar_chart</span>
                Budget Target Telemetry
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(144, 143, 160, 0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#c7c4d7', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#c7c4d7', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(31, 31, 39, 0.95)',
                        borderColor: 'rgba(144, 143, 160, 0.2)',
                        borderRadius: '8px',
                        color: '#e4e1ed'
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Value']}
                    />
                    <Bar dataKey="Amount">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl border border-outline-variant/20 text-center space-y-4 max-w-md mx-auto">
          <span className="material-symbols-outlined text-[64px] text-primary/30">payments</span>
          <h3 className="text-headline-md font-headline-md font-bold">No Expedition Selected</h3>
          <p className="text-on-surface-variant text-[13px] leading-relaxed">
            Configure an active trip profile or choose an existing trip from the dropdown above to view financial records.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
