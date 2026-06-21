import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

// Validation Schema
const tripFormSchema = z.object({
  destination: z.string().min(1, 'Destination is required').trim(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Start date must be valid'
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'End date must be valid'
  }),
  budget: z.number({ invalid_type_error: 'Budget must be a number' }).positive('Budget must be positive'),
  travelers: z.number().int().min(1, 'Must have at least 1 traveler'),
  travelStyle: z.string(),
  foodPreferences: z.string()
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

const CreateTrip = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTrip } = useTrip();
  const navigate = useNavigate();

  // Forms setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      destination: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 1500,
      travelers: 1,
      travelStyle: 'Leisure',
      foodPreferences: 'No Preference'
    },
    mode: 'onChange'
  });

  const selectedStyle = watch('travelStyle');

  const nextStep = () => {
    // Basic local checks per step
    if (step === 1) {
      const dest = watch('destination');
      const start = watch('startDate');
      const end = watch('endDate');
      if (!dest || !start || !end || new Date(start) > new Date(end)) {
        return;
      }
    }
    if (step === 2) {
      const budget = watch('budget');
      const travelers = watch('travelers');
      if (!budget || budget <= 0 || !travelers || travelers < 1) {
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newTrip = await addTrip(data);
      navigate(`/trip/${newTrip._id}`);
    } catch (err) {
      console.error('Failed to create trip profile:', err);
      alert('Error creating trip profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const travelStylesList = [
    { name: 'Adventure', icon: 'hiking', desc: 'Active, trekking, outdoors focus' },
    { name: 'Leisure', icon: 'beach_access', desc: 'Rest, relaxation, resort focus' },
    { name: 'Cultural', icon: 'museum', desc: 'History, heritage, gallery focus' },
    { name: 'Business', icon: 'work', desc: 'Conferences, networking, workspace focus' },
    { name: 'Luxury', icon: 'hotel_class', desc: 'Five-star premium experience focus' },
    { name: 'Budget', icon: 'savings', desc: 'Cost-saving, hostel, transit focus' },
    { name: 'Family', icon: 'family_restroom', desc: 'Kid-friendly, safe, activity focus' }
  ];

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 bg-background max-w-[750px] mx-auto w-full flex flex-col justify-center min-h-[80vh]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-on-surface font-headline-md">Initialize Expedition Profile</h2>
        <p className="text-label-sm text-on-surface-variant font-label-sm opacity-70">
          Configure destination telemetry, budget parameters, and styling rules.
        </p>
      </div>

      {/* Progress Circles Indicator */}
      <div className="flex justify-between items-center max-w-md mx-auto w-full relative mb-4">
        {/* Connection bar */}
        <div className="absolute top-[22px] left-[10%] right-[10%] h-[2px] bg-surface-container z-0">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>

        {/* Step 1 */}
        <div className="flex flex-col items-center gap-1.5 relative z-10">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold font-headline-md border-2 transition-all ${
            step >= 1 ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface border-outline-variant text-on-surface-variant'
          }`}>
            1
          </div>
          <span className="text-[11px] font-semibold tracking-wider font-label-sm uppercase opacity-80">Telemetry</span>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center gap-1.5 relative z-10">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold font-headline-md border-2 transition-all ${
            step >= 2 ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface border-outline-variant text-on-surface-variant'
          }`}>
            2
          </div>
          <span className="text-[11px] font-semibold tracking-wider font-label-sm uppercase opacity-80">Budget</span>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center gap-1.5 relative z-10">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold font-headline-md border-2 transition-all ${
            step >= 3 ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface border-outline-variant text-on-surface-variant'
          }`}>
            3
          </div>
          <span className="text-[11px] font-semibold tracking-wider font-label-sm uppercase opacity-80">Preferences</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 rounded-2xl border border-outline-variant/20 shadow-xl space-y-6">
        {/* STEP 1: DESTINATION & DATES */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">DESTINATION TARGET</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">location_on</span>
                <input
                  type="text"
                  placeholder="Paris, France or Tokyo, Japan..."
                  className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px]"
                  {...register('destination')}
                />
              </div>
              {errors.destination && (
                <span className="text-error text-[11px] font-label-sm">{errors.destination.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">START DATE</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">calendar_today</span>
                  <input
                    type="date"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px]"
                    {...register('startDate')}
                  />
                </div>
                {errors.startDate && (
                  <span className="text-error text-[11px] font-label-sm">{errors.startDate.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">END DATE</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">calendar_today</span>
                  <input
                    type="date"
                    className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px]"
                    {...register('endDate')}
                  />
                </div>
                {errors.endDate && (
                  <span className="text-error text-[11px] font-label-sm">{errors.endDate.message}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET & TRAVELERS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">CAPITAL BUDGET LIMIT ($)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">attach_money</span>
                <input
                  type="number"
                  placeholder="2000"
                  className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px]"
                  {...register('budget', { valueAsNumber: true })}
                />
              </div>
              {errors.budget && (
                <span className="text-error text-[11px] font-label-sm">{errors.budget.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">TRAVELERS COUNT</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">groups</span>
                <input
                  type="number"
                  placeholder="1"
                  className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px]"
                  {...register('travelers', { valueAsNumber: true })}
                />
              </div>
              {errors.travelers && (
                <span className="text-error text-[11px] font-label-sm">{errors.travelers.message}</span>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES & GENERATION */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-3">
              <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">TRAVEL STYLE SELECTOR</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                {travelStylesList.map(style => (
                  <div
                    key={style.name}
                    onClick={() => setValue('travelStyle', style.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-3 items-center ${
                      selectedStyle === style.name
                        ? 'border-primary bg-primary/10 shadow-inner'
                        : 'border-outline-variant/20 bg-surface-container-low/30 hover:border-primary/30'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${selectedStyle === style.name ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {style.icon}
                    </span>
                    <div className="text-left">
                      <div className="text-[13px] font-bold">{style.name}</div>
                      <div className="text-[11px] text-on-surface-variant opacity-80">{style.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-label-sm font-label-sm font-semibold text-on-surface-variant">CULINARY / DIETARY PREFERENCE</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">dinner_dining</span>
                <select
                  className="input-field w-full pl-11 pr-4 py-3 rounded-xl text-[14px] appearance-none"
                  {...register('foodPreferences')}
                >
                  <option value="No Preference">No Preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant pointer-events-none opacity-60">arrow_drop_down</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Controls Bottom Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={() => {
              if (step > 1) prevStep();
              else navigate('/dashboard');
            }}
            className="px-5 py-2.5 rounded-xl border border-outline-variant/20 hover:bg-surface-container-high/40 text-on-surface-variant transition-colors text-label-sm font-label-sm font-semibold"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-semibold text-label-sm font-label-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              Next Step
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="primary-btn text-on-primary px-6 py-2.5 rounded-xl font-semibold text-label-sm font-label-sm hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-on-primary rounded-full animate-spin"></div>
                  Initializing...
                </>
              ) : (
                <>
                  Generate Journey Profile
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
