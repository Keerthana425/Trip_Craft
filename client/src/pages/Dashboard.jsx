import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import expenseService from '../services/expenseService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = () => {
  const { trips, activeTrip, selectTrip, removeTrip, loading: tripLoading } = useTrip();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);

  // Fetch expenses for the active trip to render analytics
  useEffect(() => {
    const fetchActiveExpenses = async () => {
      if (!activeTrip) {
        setExpenses([]);
        return;
      }
      setExpenseLoading(true);
      try {
        const data = await expenseService.getExpensesByTrip(activeTrip._id);
        setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses for active trip:', err);
      } finally {
        setExpenseLoading(false);
      }
    };

    fetchActiveExpenses();
  }, [activeTrip]);

  // Aggregate expenses by category for chart
  const categories = ['Hotels', 'Food', 'Shopping', 'Transport', 'Entertainment'];
  const COLORS = {
    Hotels: '#8083ff',
    Food: '#4cd7f6',
    Shopping: '#d0bcff',
    Transport: '#acedff',
    Entertainment: '#ffb4ab'
  };

  const chartData = categories.map(cat => {
    const total = expenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = activeTrip ? Math.max(0, activeTrip.budget - totalSpent) : 0;
  const budgetPercentage = activeTrip ? Math.min(100, Math.round((totalSpent / activeTrip.budget) * 100)) : 0;

  // Format Date utility
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysLeft = (startDateString) => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const start = new Date(startDateString);
    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const pastTrips = trips.filter(t => t.status === 'past');

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 bg-background max-w-container-max mx-auto w-full">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface font-headline-md">Travel Intelligence Dashboard</h2>
          <p className="text-label-sm text-on-surface-variant font-label-sm opacity-70">
            Monitor routes, telemetry metrics, and financial records.
          </p>
        </div>
        <Link
          to="/create-trip"
          className="primary-btn text-on-primary px-5 py-2.5 rounded-xl font-label-sm text-label-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Plan New Journey
        </Link>
      </div>

      {tripLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Active Trip & Lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active / Featured Trip */}
            {activeTrip ? (
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-lg relative overflow-hidden">
                {/* Glow detail */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest font-label-sm inline-flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                      Active Mission Focus
                    </span>
                    <h3 className="text-2xl font-bold text-on-surface font-headline-md">{activeTrip.destination}</h3>
                    <p className="text-[13px] text-on-surface-variant opacity-70">
                      {formatDate(activeTrip.startDate)} — {formatDate(activeTrip.endDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/trip/${activeTrip._id}`)}
                    className="bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high text-primary px-4 py-2 rounded-lg font-label-sm text-label-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    Manage Route
                    <span className="material-symbols-outlined text-[16px]">navigation</span>
                  </button>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant font-label-sm block mb-1">TRAVELERS</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                      <span className="text-[14px] font-semibold">{activeTrip.travelers} Pax</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant font-label-sm block mb-1">TRAVEL STYLE</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">explore</span>
                      <span className="text-[14px] font-semibold">{activeTrip.travelStyle}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant font-label-sm block mb-1">FOOD STANDARD</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[20px]">restaurant</span>
                      <span className="text-[14px] font-semibold truncate">{activeTrip.foodPreferences}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/10">
                    <span className="text-[10px] text-on-surface-variant font-label-sm block mb-1">BUDGET TOTAL</span>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                      <span className="text-[14px] font-semibold">${activeTrip.budget}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-label-sm font-semibold">
                    <span className="text-on-surface-variant">BUDGET EXPENDITURE STATUS</span>
                    <span className={`${budgetPercentage > 85 ? 'text-error' : 'text-primary'}`}>
                      ${totalSpent} spent ({budgetPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        budgetPercentage > 85 ? 'bg-error' : 'primary-gradient'
                      }`}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-10 rounded-2xl border border-outline-variant/20 text-center space-y-6">
                <span className="material-symbols-outlined text-[64px] text-primary/30">travel</span>
                <div>
                  <h3 className="text-headline-md font-headline-md font-bold">No Active Journeys Scheduled</h3>
                  <p className="text-on-surface-variant text-label-sm mt-1 max-w-sm mx-auto">
                    Construct a travel profile, choose your style parameters, and generate an AI-assisted itinerary.
                  </p>
                </div>
                <Link
                  to="/create-trip"
                  className="inline-flex primary-btn text-on-primary px-6 py-3 rounded-xl font-semibold text-label-sm font-label-sm"
                >
                  Start Planning
                </Link>
              </div>
            )}

            {/* Upcoming Trips List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-on-surface font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_month</span>
                Upcoming Journeys ({upcomingTrips.length})
              </h3>

              {upcomingTrips.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingTrips.map(trip => {
                    const daysLeft = calculateDaysLeft(trip.startDate);
                    return (
                      <div
                        key={trip._id}
                        className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => selectTrip(trip._id).then(() => navigate(`/trip/${trip._id}`))}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-semibold text-[16px] text-on-surface truncate">{trip.destination}</h4>
                            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono-label">
                              T-{daysLeft}d
                            </span>
                          </div>
                          <p className="text-[12px] text-on-surface-variant">
                            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                          </p>
                          <div className="flex gap-4 mt-4 text-[12px] text-on-surface-variant font-medium">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">groups</span>
                              {trip.travelers} Pax
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">payments</span>
                              ${trip.budget}
                            </span>
                          </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-outline-variant/10 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => selectTrip(trip._id).then(() => navigate(`/trip/${trip._id}`))}
                            className="text-primary hover:text-primary-fixed-dim text-label-sm font-label-sm font-semibold flex items-center gap-1"
                          >
                            Explore
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this trip?')) {
                                removeTrip(trip._id);
                              }
                            }}
                            className="text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-on-surface-variant text-[13px] italic">No future routes locked in.</p>
              )}
            </div>

            {/* Past Trips List */}
            {pastTrips.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-on-surface font-headline-md flex items-center gap-2 opacity-80">
                  <span className="material-symbols-outlined text-on-surface-variant">history</span>
                  Past Expeditions ({pastTrips.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-75">
                  {pastTrips.map(trip => (
                    <div
                      key={trip._id}
                      className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between hover:border-outline-variant/30 hover:opacity-100 transition-all cursor-pointer"
                      onClick={() => selectTrip(trip._id).then(() => navigate(`/trip/${trip._id}`))}
                    >
                      <div>
                        <h4 className="font-semibold text-[16px] text-on-surface truncate">{trip.destination}</h4>
                        <p className="text-[12px] text-on-surface-variant">
                          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => selectTrip(trip._id).then(() => navigate(`/trip/${trip._id}`))}
                          className="text-on-surface-variant hover:text-primary text-[12px] font-semibold flex items-center gap-1"
                        >
                          View Logs
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this past trip?')) {
                              removeTrip(trip._id);
                            }
                          }}
                          className="text-error/60 hover:bg-error-container/20 p-1.5 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Financial & Analytics Widgets */}
          <div className="space-y-8">
            {/* Budget Aggregation Widget */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold text-on-surface font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                Budget Balance Sheet
              </h3>

              {activeTrip ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                    <span className="text-[13px] text-on-surface-variant font-medium">Trip Budget</span>
                    <span className="text-[15px] font-bold text-on-surface">${activeTrip.budget}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
                    <span className="text-[13px] text-on-surface-variant font-medium">Logged Debits</span>
                    <span className="text-[15px] font-bold text-secondary">${totalSpent}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[13px] text-on-surface-variant font-medium">Available Assets</span>
                    <span className="text-[15px] font-bold text-primary">${remainingBudget}</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant/10">
                    <Link
                      to="/expenses"
                      className="w-full bg-surface-container-high border border-outline-variant/20 hover:bg-surface-container-highest text-primary font-semibold text-label-sm font-label-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Open Bookkeeping
                      <span className="material-symbols-outlined text-[16px]">finance_chip</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-on-surface-variant italic">No budget sheets active. Plan a journey first.</p>
              )}
            </div>

            {/* Expense Chart Recharts */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
              <h3 className="text-lg font-bold text-on-surface font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">pie_chart</span>
                Debit Distribution
              </h3>

              {expenseLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : activeTrip && chartData.length > 0 ? (
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
                          formatter={(value) => [`$${value}`, 'Amount']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-2 text-[12px] font-medium">
                    {chartData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[item.name] }}></span>
                        <span className="truncate opacity-80">{item.name}:</span>
                        <span className="font-bold ml-auto">${item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-center">
                  <p className="text-[13px] text-on-surface-variant italic max-w-[200px]">
                    {activeTrip ? 'Zero debits recorded. Log expenses to load analysis.' : 'Select a trip to load analysis.'}
                  </p>
                </div>
              )}
            </div>

            {/* AI Assistant Quick recommendation panel */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-lg font-bold text-on-surface font-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">psychology</span>
                Assistant Intel
              </h3>

              {activeTrip ? (
                <div className="space-y-4">
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">
                    AI TRAVEL CONCIERGE is synchronized. Query logistics, local customs, or translation modules.
                  </p>
                  <Link
                    to="/assistant"
                    className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-semibold text-label-sm font-label-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-colors"
                  >
                    <span>Connect Concierge</span>
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                  </Link>
                </div>
              ) : (
                <p className="text-[13px] text-on-surface-variant italic">Create a trip profile to engage AI Travel Concierge.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
