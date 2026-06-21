import React, { createContext, useState, useEffect, useContext } from 'react';
import tripService from '../services/tripService';
import { useAuth } from './AuthContext';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrips = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await tripService.getTrips();
      setTrips(data);
      
      // Auto-select active trip if available
      const active = data.find(t => t.status === 'active');
      const upcoming = data.find(t => t.status === 'upcoming');
      if (active) {
        setActiveTrip(active);
      } else if (upcoming) {
        setActiveTrip(upcoming);
      } else if (data.length > 0) {
        setActiveTrip(data[0]);
      } else {
        setActiveTrip(null);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [isAuthenticated]);

  const selectTrip = async (id) => {
    setLoading(true);
    try {
      const data = await tripService.getTripById(id);
      setActiveTrip(data);
      return data;
    } catch (error) {
      console.error('Failed to select trip:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addTrip = async (tripData) => {
    setLoading(true);
    try {
      const newTrip = await tripService.createTrip(tripData);
      setTrips(prev => [...prev, newTrip].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
      setActiveTrip(newTrip);
      return newTrip;
    } catch (error) {
      console.error('Failed to create trip:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editTrip = async (id, tripData) => {
    setLoading(true);
    try {
      const updated = await tripService.updateTrip(id, tripData);
      setTrips(prev => prev.map(t => t._id === id ? updated : t).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
      if (activeTrip?._id === id) {
        setActiveTrip(updated);
      }
      return updated;
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeTrip = async (id) => {
    setLoading(true);
    try {
      await tripService.deleteTrip(id);
      setTrips(prev => prev.filter(t => t._id !== id));
      if (activeTrip?._id === id) {
        setActiveTrip(null);
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    trips,
    activeTrip,
    loading,
    fetchTrips,
    selectTrip,
    addTrip,
    editTrip,
    removeTrip
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
export default TripContext;
