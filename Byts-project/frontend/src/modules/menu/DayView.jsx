import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMenu } from './MenuContext';
import { ArrowLeft, Coffee, Sun, Moon, Plus, ThumbsUp, Check, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

export const DayView = () => {
  const { dayId } = useParams();
  const { week, userRole, userVotes, voteForOption, addFoodOption } = useMenu();
  const [newOptionInput, setNewOptionInput] = useState({});

  const day = week.days.find(d => d.id === dayId);

  console.log('DayView - userRole:', userRole);
  console.log('DayView - Is Admin?', userRole === 'admin');

  if (!day) return <div className="p-8 text-center text-slate-500">Day not found</div>;

  const getMealIcon = (type) => {
    switch (type) {
      case 'Breakfast': return <Coffee size={20} />;
      case 'Lunch': return <Sun size={20} />;
      case 'Dinner': return <Moon size={20} />;
      default: return <Sun size={20} />;
    }
  };

  const handleAddOption = (mealId) => {
    const name = newOptionInput[mealId];
    if (name?.trim()) {
      addFoodOption(day.id, mealId, name);
      setNewOptionInput(prev => ({ ...prev, [mealId]: '' }));
    }
  };

  const isVotingLocked = week.status !== 'Voting Open';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm text-slate-600">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{day.name} Menu</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            {isVotingLocked ? (
              <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium border border-amber-100">
                Voting Closed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium border border-emerald-100">
                Voting Open
              </span>
            )}
            <span className="text-slate-400">•</span>
            Select your preferences below
            {/* DEBUG: Show current role */}
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-mono border border-red-200">
              DEBUG: Role = {userRole}
            </span>
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {day.meals.map((meal) => (
          <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Meal Header */}
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-slate-700 border border-slate-100">
                  {getMealIcon(meal.type)}
                </div>
                <h2 className="font-bold text-lg text-slate-800">{meal.type}</h2>
              </div>

              {week.status === 'Finalized' && meal.finalizedOptionId && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Trophy size={12} /> Finalized
                </Badge>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meal.options.map((option) => {
                  const isSelected = userVotes.some(v => v.dayId === day.id && v.mealId === meal.id && v.optionId === option.id);
                  const isWinner = meal.finalizedOptionId === option.id;
                  const totalVotes = meal.options.reduce((acc, curr) => acc + curr.votes, 0);
                  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                  return (
                    <motion.div
                      key={option.id}
                      whileHover={!isVotingLocked && userRole === 'student' ? { y: -2 } : {}}
                      className={cn(
                        "relative rounded-xl border p-5 transition-all",
                        isWinner ? "border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20" :
                          isSelected ? "border-slate-600 bg-slate-50 ring-1 ring-slate-200" : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={cn("font-semibold text-lg", isWinner ? "text-emerald-900" : "text-slate-800")}>
                            {option.name}
                          </h3>
                          {option.description && <p className="text-sm text-slate-500 mt-1">{option.description}</p>}
                        </div>

                        {week.status === 'Finalized' && isWinner && (
                          <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full shadow-sm">
                            <Check size={16} />
                          </div>
                        )}
                      </div>

                      {/* Voting / Stats Section */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        {userRole === 'admin' || week.status !== 'Voting Open' ? (
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-500">
                              <span>{option.votes} votes</span>
                              <span>{percentage}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn("h-full rounded-full", isWinner ? "bg-emerald-500" : "bg-slate-600")}
                              />
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => voteForOption(day.id, meal.id, option.id)}
                            disabled={isVotingLocked}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full justify-center",
                              isSelected
                                ? "bg-slate-800 text-white shadow-md shadow-slate-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                            )}
                          >
                            {isSelected ? (
                              <>
                                <Check size={16} /> Voted
                              </>
                            ) : (
                              <>
                                <ThumbsUp size={16} /> Vote for this
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Admin Add Option */}
              {userRole === 'admin' && !isVotingLocked && (
                <div className="mt-6 flex gap-3 pt-4 border-t border-slate-100 border-dashed">
                  <input
                    type="text"
                    placeholder="Type new food option here..."
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm bg-slate-50 focus:bg-white transition-colors"
                    value={newOptionInput[meal.id] || ''}
                    onChange={(e) => setNewOptionInput(prev => ({ ...prev, [meal.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOption(meal.id)}
                  />
                  <button
                    onClick={() => handleAddOption(meal.id)}
                    className="px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                  >
                    <Plus size={16} /> Add Option
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
