import React, { createContext, useContext, useState } from 'react';
import { initialWeek } from './mockData';

const MenuContext = createContext(undefined);

export const MenuProvider = ({ children }) => {
  const [week, setWeek] = useState(initialWeek);
  const [userVotes, setUserVotes] = useState([]);

  // Get user role from byts-project localStorage - calculate on EVERY render
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const userRole = currentUser?.role === 'caretaker' || currentUser?.role === 'warden' ? 'admin' : 'student';

  console.log('MenuContext - Current User:', currentUser);
  console.log('MenuContext - Detected Role:', userRole);

  const voteForOption = (dayId, mealId, optionId) => {
    if (week.status !== 'Voting Open') return;

    // Check if user already voted for this meal
    const existingVoteIndex = userVotes.findIndex(v => v.dayId === dayId && v.mealId === mealId);

    setWeek(prev => {
      const newWeek = { ...prev };
      const day = newWeek.days.find(d => d.id === dayId);
      const meal = day?.meals.find(m => m.id === mealId);

      if (!meal) return prev;

      // Remove previous vote count if exists
      if (existingVoteIndex !== -1) {
        const prevOptionId = userVotes[existingVoteIndex].optionId;
        const prevOption = meal.options.find(o => o.id === prevOptionId);
        if (prevOption) prevOption.votes = Math.max(0, prevOption.votes - 1);
      }

      // Add new vote
      const option = meal.options.find(o => o.id === optionId);
      if (option) option.votes += 1;

      return newWeek;
    });

    // Update user votes registry
    setUserVotes(prev => {
      const newVotes = [...prev];
      if (existingVoteIndex !== -1) {
        newVotes[existingVoteIndex] = { dayId, mealId, optionId };
      } else {
        newVotes.push({ dayId, mealId, optionId });
      }
      return newVotes;
    });
  };

  const addFoodOption = (dayId, mealId, name) => {
    console.log('addFoodOption called:', { dayId, mealId, name });

    setWeek(prev => {
      const newWeek = { ...prev };
      const day = newWeek.days.find(d => d.id === dayId);
      const meal = day?.meals.find(m => m.id === mealId);

      console.log('Found day:', day);
      console.log('Found meal:', meal);

      if (meal) {
        const newOption = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          votes: 0
        };
        meal.options.push(newOption);
        console.log('Added new option:', newOption);
      } else {
        console.error('Meal not found!');
      }
      return newWeek;
    });
  };

  const updateWeekStatus = (status) => {
    setWeek(prev => ({ ...prev, status }));
  };

  const finalizeMenu = () => {
    setWeek(prev => {
      const newWeek = { ...prev, status: 'Finalized' };

      newWeek.days.forEach(day => {
        day.meals.forEach(meal => {
          if (meal.options.length > 0) {
            // Find option with max votes
            const winner = meal.options.reduce((prev, current) =>
              (prev.votes > current.votes) ? prev : current
            );
            meal.finalizedOptionId = winner.id;
          }
        });
      });

      return newWeek;
    });
  };

  return (
    <MenuContext.Provider value={{
      week,
      userRole,
      userVotes,
      voteForOption,
      addFoodOption,
      updateWeekStatus,
      finalizeMenu
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
};
