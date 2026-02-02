import React from 'react';
import { Link } from 'react-router-dom';
import { useMenu } from './MenuContext';
import { Calendar, ChevronRight } from 'lucide-react';

export const MenuHome = () => {
    const { week } = useMenu();

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Weekly Mess Menu</h1>
                <p className="text-slate-500">Select a day to view and vote on meals</p>
            </header>

            {week.status && (
                <div className="mb-6">
                    {week.status === 'Voting Open' ? (
                        <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-100 w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Voting Open
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-100 w-fit">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            {week.status}
                        </span>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {week.days.map((day) => (
                    <Link
                        key={day.id}
                        to={`/menu/${day.id}`}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700">
                                    {day.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {day.meals.length} meals
                                </p>
                            </div>
                            <ChevronRight className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" size={20} />
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
