const generateId = () => Math.random().toString(36).substr(2, 9);

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];

export const initialWeek = {
  id: 'week-1',
  status: 'Voting Open',
  days: days.map(dayName => ({
    id: generateId(),
    name: dayName,
    meals: meals.map(mealType => ({
      id: generateId(),
      type: mealType,
      options: [
        { id: generateId(), name: mealType === 'Breakfast' ? 'Idli & Sambar' : mealType === 'Lunch' ? 'Rice & Dal' : 'Chapati & Curry', votes: 5 },
        { id: generateId(), name: mealType === 'Breakfast' ? 'Pongal' : mealType === 'Lunch' ? 'Curd Rice' : 'Fried Rice', votes: 3 }
      ]
    }))
  }))
};
