import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import aiService from '../services/aiService';
import TripMap from '../components/TripMap';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, selectTrip, activeTrip, removeTrip } = useTrip();

  // Component States
  const [itinerary, setItinerary] = useState(null);
  const [packingList, setPackingList] = useState([]);
  const [localAdvice, setLocalAdvice] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [loadingPacking, setLoadingPacking] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Re-plan & Activity editor states
  const [replanPrompt, setReplanPrompt] = useState('');
  const [replanning, setReplanning] = useState(false);

  // Edit Activity States
  const [editingDayIdx, setEditingDayIdx] = useState(null);
  const [editingTimeBlock, setEditingTimeBlock] = useState(''); // 'morning', 'afternoon', 'evening'
  const [editingActivityIdx, setEditingActivityIdx] = useState(null);
  const [activityForm, setActivityForm] = useState({ title: '', location: '', desc: '' });
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // New Packing Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');

  // Load trip data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        await selectTrip(id);
      } catch (err) {
        navigate('/dashboard');
      }
    };
    loadTripData();
  }, [id]);

  // Load itinerary, packing, advice once trip is selected
  useEffect(() => {
    if (!activeTrip || activeTrip._id !== id) return;

    const fetchItinerary = async () => {
      setLoadingItinerary(true);
      try {
        const data = await aiService.getItinerary(activeTrip._id);
        setItinerary(data);
      } catch (err) {
        console.error('Itinerary load failed:', err);
      } finally {
        setLoadingItinerary(false);
      }
    };

    const fetchPacking = async () => {
      setLoadingPacking(true);
      try {
        const data = await aiService.getPackingList(activeTrip._id);
        setPackingList(data.items || []);
      } catch (err) {
        console.error('Packing load failed:', err);
      } finally {
        setLoadingPacking(false);
      }
    };

    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      try {
        const data = await aiService.getLocalRecommendations(activeTrip._id);
        setLocalAdvice(data);
      } catch (err) {
        console.error('Advice load failed:', err);
      } finally {
        setLoadingAdvice(false);
      }
    };

    fetchItinerary();
    fetchPacking();
    fetchAdvice();
  }, [activeTrip, id]);

  // Action: Generate Itinerary
  const handleGenerateItinerary = async () => {
    setLoadingItinerary(true);
    try {
      const data = await aiService.generateItinerary(activeTrip._id);
      setItinerary(data);
      
      // Auto generate packing list too
      setLoadingPacking(true);
      const packingData = await aiService.generatePackingList(activeTrip._id);
      setPackingList(packingData.items || []);
    } catch (err) {
      alert('Generation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingItinerary(false);
      setLoadingPacking(false);
    }
  };

  // Action: AI Replan Itinerary
  const handleReplanSubmit = async (e) => {
    e.preventDefault();
    if (!replanPrompt.trim()) return;
    setReplanning(true);
    try {
      const data = await aiService.replan(activeTrip._id, replanPrompt);
      setItinerary(data);
      setReplanPrompt('');
    } catch (err) {
      alert('Replanning failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setReplanning(false);
    }
  };

  // Action: Toggle packing checkbox
  const handleTogglePacking = async (idx) => {
    const updated = [...packingList];
    updated[idx].checked = !updated[idx].checked;
    setPackingList(updated);
    try {
      await aiService.updatePackingList(activeTrip._id, updated);
    } catch (err) {
      console.error('Checklist sync failed:', err);
    }
  };

  // Action: Add Packing Item
  const handleAddPackingItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem = { name: newItemName.trim(), category: newItemCategory, checked: false };
    const updated = [...packingList, newItem];
    setPackingList(updated);
    setNewItemName('');
    try {
      await aiService.updatePackingList(activeTrip._id, updated);
    } catch (err) {
      console.error('Checklist sync failed:', err);
    }
  };

  // Action: Delete Packing Item
  const handleDeletePackingItem = async (idx) => {
    const updated = packingList.filter((_, i) => i !== idx);
    setPackingList(updated);
    try {
      await aiService.updatePackingList(activeTrip._id, updated);
    } catch (err) {
      console.error('Checklist sync failed:', err);
    }
  };

  // Action: Save Itinerary manually
  const saveItinerary = async (updatedDays) => {
    try {
      const updated = await aiService.updateItinerary(activeTrip._id, {
        days: updatedDays,
        summary: itinerary.summary,
        tips: itinerary.tips
      });
      setItinerary(updated);
    } catch (err) {
      console.error('Manual itinerary save failed:', err);
      alert('Failed to save itinerary update.');
    }
  };

  // Activity Editor: Open modal for Add
  const openAddModal = (dayIdx, block) => {
    setModalMode('add');
    setEditingDayIdx(dayIdx);
    setEditingTimeBlock(block);
    setActivityForm({ title: '', location: '', desc: '' });
    setShowActivityModal(true);
  };

  // Activity Editor: Open modal for Edit
  const openEditModal = (dayIdx, block, actIdx, currentVal) => {
    setModalMode('edit');
    setEditingDayIdx(dayIdx);
    setEditingTimeBlock(block);
    setEditingActivityIdx(actIdx);
    setActivityForm({
      title: currentVal.title,
      location: currentVal.location || '',
      desc: currentVal.desc || ''
    });
    setShowActivityModal(true);
  };

  // Activity Editor: Save form submit
  const handleActivitySubmit = (e) => {
    e.preventDefault();
    if (!activityForm.title.trim()) return;

    const updatedDays = [...itinerary.days];
    const targetDay = updatedDays[editingDayIdx];

    if (modalMode === 'add') {
      targetDay[editingTimeBlock].push({ ...activityForm });
    } else {
      targetDay[editingTimeBlock][editingActivityIdx] = { ...activityForm };
    }

    saveItinerary(updatedDays);
    setShowActivityModal(false);
  };

  // Activity Editor: Delete Activity
  const handleDeleteActivity = (dayIdx, block, actIdx) => {
    if (!confirm('Are you sure you want to remove this activity?')) return;
    const updatedDays = [...itinerary.days];
    updatedDays[dayIdx][block] = updatedDays[dayIdx][block].filter((_, i) => i !== actIdx);
    saveItinerary(updatedDays);
  };

  // PDF Download trigger
  const handleExportPDF = () => {
    window.open(`/api/export-pdf/${activeTrip._id}`, '_blank');
  };

  if (!activeTrip) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format date utility
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex-grow p-6 md:p-8 space-y-8 bg-background max-w-container-max mx-auto w-full">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface font-headline-md">{activeTrip.destination}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              activeTrip.status === 'active' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-container border border-outline-variant/35 text-on-surface-variant'
            }`}>
              {activeTrip.status}
            </span>
          </div>
          <p className="text-[13px] text-on-surface-variant mt-1.5 opacity-80">
            {formatDate(activeTrip.startDate)} — {formatDate(activeTrip.endDate)} &bull; {activeTrip.travelers} Traveler(s) &bull; {activeTrip.travelStyle} Style
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPDF}
            disabled={!itinerary}
            className="bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high text-primary px-4 py-2.5 rounded-xl font-label-sm text-label-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export Dossier
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this trip?')) {
                removeTrip(activeTrip._id).then(() => navigate('/dashboard'));
              }
            }}
            className="border border-error/30 hover:bg-error-container/20 text-error px-4 py-2.5 rounded-xl font-label-sm text-label-sm font-semibold transition-all"
          >
            Purge Profile
          </button>
        </div>
      </div>

      {/* Main Content Layout splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Map & Packing list & Local Custom guidelines */}
        <div className="space-y-8">
          {/* Leaflet Map Card */}
          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/20 shadow-md">
            <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">map</span>
              Map Navigation Telemetry
            </h3>
            <TripMap destination={activeTrip.destination} />
          </div>

          {/* Packing Checklist */}
          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/20 shadow-md">
            <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">backpack</span>
              Expedition Gear Checklist
            </h3>

            {loadingPacking ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : packingList.length > 0 ? (
              <div className="space-y-4">
                {/* Packing list categories */}
                <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                  {packingList.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center gap-3 text-[13px] group border-b border-outline-variant/5 pb-2">
                      <label className="flex items-center gap-3 cursor-pointer select-none text-left">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleTogglePacking(idx)}
                          className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-primary/20"
                        />
                        <span className={`transition-all ${item.checked ? 'line-through text-on-surface-variant opacity-50' : 'text-on-surface font-medium'}`}>
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono-label px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/25 text-on-surface-variant opacity-60">
                          {item.category}
                        </span>
                      </label>
                      <button
                        onClick={() => handleDeletePackingItem(idx)}
                        className="text-error opacity-0 group-hover:opacity-100 hover:bg-error-container/20 p-1 rounded transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new packing item inline form */}
                <form onSubmit={handleAddPackingItem} className="flex gap-2 pt-2 border-t border-outline-variant/10">
                  <input
                    type="text"
                    placeholder="New item..."
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    className="input-field flex-1 px-3 py-2 rounded-lg text-[13px] h-9"
                  />
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    className="input-field px-2 py-1 rounded-lg text-[11px] h-9 bg-surface-container"
                  >
                    <option value="General">Gen</option>
                    <option value="Clothing">Cloth</option>
                    <option value="Electronics">Elec</option>
                    <option value="Toiletries">Toil</option>
                    <option value="Documents">Docs</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-90 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-[13px] text-on-surface-variant italic mb-4">No gear lists compiled yet.</p>
                {itinerary && (
                  <button
                    onClick={handleGenerateItinerary}
                    className="text-primary hover:text-primary-fixed-dim text-label-sm font-label-sm font-semibold flex items-center gap-1.5 mx-auto"
                  >
                    Compile AI packing list
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Local Advice & customs */}
          <div className="glass-panel p-5 rounded-2xl border border-outline-variant/20 shadow-md">
            <h3 className="text-lg font-bold font-headline-md mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">gavel</span>
              Local Customs & Telemetry
            </h3>

            {loadingAdvice ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : localAdvice ? (
              <div className="space-y-4 text-left max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {/* Emergency numbers */}
                <div>
                  <h4 className="text-[11px] font-bold tracking-widest text-error uppercase font-label-sm">Emergency Channels</h4>
                  <ul className="mt-1 space-y-1 text-[13px] font-medium text-on-surface">
                    {localAdvice.emergency?.map((em, idx) => (
                      <li key={idx} className="flex gap-2 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        {em}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cultural Customs */}
                <div>
                  <h4 className="text-[11px] font-bold tracking-widest text-primary uppercase font-label-sm">Cultural Customs</h4>
                  <ul className="mt-1 space-y-1.5 text-[13px] text-on-surface-variant">
                    {localAdvice.customs?.map((c, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">info</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Local foods */}
                <div>
                  <h4 className="text-[11px] font-bold tracking-widest text-secondary uppercase font-label-sm">Culinary Highlights</h4>
                  <ul className="mt-1 space-y-1.5 text-[13px] text-on-surface-variant">
                    {localAdvice.foods?.map((f, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">restaurant</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-on-surface-variant italic">No telemetry data queried.</p>
            )}
          </div>
        </div>

        {/* Right Column: AI Day-by-Day Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                AI Journey Timeline
              </h3>
              {itinerary && (
                <button
                  onClick={handleGenerateItinerary}
                  className="text-primary hover:text-primary-fixed-dim text-label-sm font-label-sm font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Re-Optimize AI
                </button>
              )}
            </div>

            {loadingItinerary ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-label-sm font-label-sm tracking-widest text-primary animate-pulse uppercase">
                    Compiling destination maps & activities...
                  </span>
                </div>
              </div>
            ) : itinerary ? (
              <div className="space-y-8">
                {/* Summary */}
                {itinerary.summary && (
                  <p className="text-[14px] text-on-surface-variant italic leading-relaxed border-l-2 border-primary/30 pl-4 mb-6">
                    "{itinerary.summary}"
                  </p>
                )}

                {/* Day-by-Day Timeline List */}
                <div className="space-y-6 relative border-l border-outline-variant/20 ml-4 pl-6">
                  {itinerary.days?.map((dayObj, dayIdx) => (
                    <div key={dayIdx} className="relative space-y-4">
                      {/* Timeline circle marker */}
                      <div className="absolute -left-[37px] top-1.5 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-[11px] text-primary">
                        {dayObj.day}
                      </div>

                      <h4 className="font-bold text-[17px] text-on-surface flex items-center gap-2">
                        Day {dayObj.day} Timeline
                        <span className="text-[11px] font-mono-label font-medium opacity-65 ml-2">
                          Est. Budget: ${dayObj.budget}
                        </span>
                      </h4>

                      {/* Time Blocks: Morning, Afternoon, Evening */}
                      {['morning', 'afternoon', 'evening'].map(block => {
                        const activities = dayObj[block] || [];
                        const blockColors = {
                          morning: 'border-l-primary/40',
                          afternoon: 'border-l-secondary/40',
                          evening: 'border-l-tertiary/40'
                        };
                        const iconNames = {
                          morning: 'sunny',
                          afternoon: 'wb_twilight',
                          evening: 'nights_stay'
                        };

                        return (
                          <div key={block} className={`pl-4 border-l-2 ${blockColors[block]} space-y-2 text-left`}>
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-label-sm">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">{iconNames[block]}</span>
                                {block}
                              </span>
                              <button
                                onClick={() => openAddModal(dayIdx, block)}
                                className="text-primary hover:text-primary-fixed-dim flex items-center gap-0.5 normal-case font-semibold text-[10px]"
                              >
                                <span className="material-symbols-outlined text-[12px]">add</span>
                                Add Activity
                              </button>
                            </div>

                            {/* Render block activities */}
                            {activities.length > 0 ? (
                              <div className="space-y-3">
                                {activities.map((act, actIdx) => (
                                  <div
                                    key={actIdx}
                                    className="p-3 bg-surface-container-low/40 border border-outline-variant/10 rounded-xl hover:border-outline-variant/30 group transition-all relative"
                                  >
                                    {/* Edit controls hover */}
                                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex gap-1.5 transition-all">
                                      <button
                                        onClick={() => openEditModal(dayIdx, block, actIdx, act)}
                                        className="text-primary hover:bg-primary/10 p-1 rounded"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteActivity(dayIdx, block, actIdx)}
                                        className="text-error hover:bg-error-container/20 p-1 rounded"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                      </button>
                                    </div>

                                    <h5 className="font-semibold text-[13px] text-on-surface pr-16">{act.title}</h5>
                                    {act.location && (
                                      <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                                        {act.location}
                                      </p>
                                    )}
                                    {act.desc && (
                                      <p className="text-[12px] text-on-surface-variant mt-1.5 opacity-85 leading-relaxed">{act.desc}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[12px] text-on-surface-variant italic opacity-60">No items slotted.</p>
                            )}
                          </div>
                        );
                      })}

                      {/* Restaurants block */}
                      <div className="pl-4 border-l-2 border-l-outline-variant/20 space-y-2 text-left">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-label-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">restaurant</span>
                          Recommended Dinings
                        </div>
                        {dayObj.restaurants?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {dayObj.restaurants.map((rest, rIdx) => (
                              <div key={rIdx} className="px-3 py-1.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/10 text-[12px] flex items-center gap-2">
                                <span className="font-semibold">{rest.name}</span>
                                <span className="text-[10px] text-on-surface-variant opacity-75">&bull; {rest.type}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[12px] text-on-surface-variant italic opacity-60">No recommendations compiled.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Replanning Form bar */}
                <div className="pt-6 border-t border-outline-variant/10 mt-8">
                  <h4 className="text-label-sm font-label-sm font-bold text-on-surface-variant mb-3 uppercase tracking-wider">
                    Replan Journey with AI Instructions
                  </h4>
                  <form onSubmit={handleReplanSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 'Add a free afternoon on Day 2 for shopping' or 'Adjust schedule for a rainy afternoon'"
                      value={replanPrompt}
                      onChange={e => setReplanPrompt(e.target.value)}
                      disabled={replanning}
                      className="input-field flex-1 px-4 py-3 rounded-xl text-[13.5px]"
                    />
                    <button
                      type="submit"
                      disabled={replanning || !replanPrompt.trim()}
                      className="bg-primary text-on-primary px-5 py-3 rounded-xl text-label-sm font-label-sm font-semibold flex items-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
                    >
                      {replanning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-on-primary rounded-full animate-spin"></div>
                          Replanning...
                        </>
                      ) : (
                        <>
                          <span>Apply Replan</span>
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-6">
                <span className="material-symbols-outlined text-[64px] text-primary/30">auto_awesome</span>
                <div>
                  <h4 className="text-headline-md font-headline-md font-bold">No Itinerary Compiled Yet</h4>
                  <p className="text-[13px] text-on-surface-variant mt-1 max-w-xs mx-auto">
                    Click below to generate a tailored itinerary using Gemini 2.5 Flash.
                  </p>
                </div>
                <button
                  onClick={handleGenerateItinerary}
                  className="primary-btn text-on-primary px-6 py-3 rounded-xl font-semibold text-label-sm font-label-sm inline-flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  Generate AI Itinerary
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Editor Dialog Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[450px] p-6 rounded-2xl border border-outline-variant/30 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-3">
              <h4 className="text-lg font-bold text-on-surface font-headline-md uppercase">
                {modalMode === 'add' ? 'Add Activity Slot' : 'Modify Activity'}
              </h4>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleActivitySubmit} className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Activity Title</label>
                <input
                  type="text"
                  placeholder="e.g. Visit Senso-ji Temple"
                  required
                  value={activityForm.title}
                  onChange={e => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field w-full px-3 py-2.5 rounded-lg text-[13.5px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Location / Coordinates</label>
                <input
                  type="text"
                  placeholder="e.g. Asakusa, Tokyo"
                  value={activityForm.location}
                  onChange={e => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field w-full px-3 py-2.5 rounded-lg text-[13.5px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Notes / Details</label>
                <textarea
                  placeholder="e.g. Bring camera, cash for street food stalls..."
                  value={activityForm.desc}
                  onChange={e => setActivityForm(prev => ({ ...prev, desc: e.target.value }))}
                  rows={3}
                  className="input-field w-full px-3 py-2.5 rounded-lg text-[13.5px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 border border-outline-variant/20 hover:bg-surface-container-high/40 rounded-lg text-label-sm font-label-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-lg font-semibold text-label-sm font-label-sm hover:opacity-90 transition-all"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
