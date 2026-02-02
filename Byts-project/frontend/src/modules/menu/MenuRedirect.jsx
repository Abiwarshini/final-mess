import { Navigate } from 'react-router-dom';
import { useMenu } from './MenuContext';

export const MenuRedirect = () => {
    const { week } = useMenu();

    // Redirect to the first day (Monday)
    if (week.days && week.days.length > 0) {
        return <Navigate to={`/menu/${week.days[0].id}`} replace />;
    }

    // Fallback if no days available
    return <div className="p-8 text-center text-slate-500">No menu available</div>;
};
