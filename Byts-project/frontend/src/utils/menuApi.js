import { api } from './api';

const BASE = '/menu';

export const menuApi = {
    getWeek: (weekId) => api.get(weekId ? `${BASE}/week?weekId=${weekId}` : `${BASE}/week`),
    getFinal: (weekId) => api.get(weekId ? `${BASE}/final?weekId=${weekId}` : `${BASE}/final`),
    getMyVotes: (weekId) => api.get(weekId ? `${BASE}/my-votes?weekId=${weekId}` : `${BASE}/my-votes`),
    vote: (body) => api.post(`${BASE}/vote`, body),
    createWeek: (weekStartDate) => api.post(`${BASE}/week`, { weekStartDate }),
    addOptions: (weeklyMenuId, options) => api.post(`${BASE}/options`, { weeklyMenuId, options }),
    getVotes: (weekId) => api.get(`${BASE}/votes?weekId=${weekId}`),
    finalize: (weeklyMenuId) => api.post(`${BASE}/finalize`, { weeklyMenuId }),
    listWeeks: () => api.get(`${BASE}/weeks`),
};