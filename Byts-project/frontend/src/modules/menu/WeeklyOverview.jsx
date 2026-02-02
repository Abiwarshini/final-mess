import React from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from './MenuContext';
import { Calendar, ChevronRight, Utensils } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const WeeklyOverview = () => {
    const { week, userRole, updateWeekStatus } = useMenu();

    const handleCloseVoting = () => {
        if (window.confirm('Are you sure you want to close voting for this week?')) {
            updateWeekStatus('Voting Closed');
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Weekly Menu Plan</h1>
                    <p className="text-slate-500 mt-1">
                        {userRole === 'admin'
                            ? 'Manage, vote, and finalize meals for the upcoming week.'
                            : 'View and vote on meals for the upcoming week.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Status</p>
                        {week.status === 'Voting Open' ? (
                            <Badge variant="success" className="text-sm">
                                Voting Open
                            </Badge>
                        ) : week.status === 'Voting Closed' ? (
                            <Badge variant="warning" className="text-sm">
                                Voting Closed
                            </Badge>
                        ) : (
                            <Badge variant="primary" className="text-sm">
                                {week.status}
                            </Badge>
                        )}
                    </div>

                    {userRole === 'admin' && week.status === 'Voting Open' && (
                        <button
                            onClick={handleCloseVoting}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                        >
                            Close Voting
                        </button>
                    )}
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {week.days.map((day) => (
                    <Link
                        key={day.id}
                        to={`/menu/${day.id}`}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-slate-400" />
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700">
                                    {day.name}
                                </h3>
                            </div>
                            <ChevronRight className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" size={18} />
                        </div>

                        <div className="space-y-2">
                            {day.meals.map((meal) => (
                                <div key={meal.id} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 uppercase text-xs font-medium tracking-wide">
                                        {meal.type}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Utensils size={14} />
                                        <span className="font-medium">{meal.options.length} options</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>

            {week.days.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <Calendar size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No menu available for this week</p>
                </div>
            )}
        </div>
    );
};
