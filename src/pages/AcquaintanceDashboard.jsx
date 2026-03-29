import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Clock, Flame, Heart, Leaf, LogOut, Droplets, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAcquaintanceDashboard, markNotificationRead } from '../api/acquaintance.api';

const ROLE_COLORS = {
  'Family Member': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  'Trusted Friend': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  'Therapist': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  'Sponsor / Mentor': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
};

export default function AcquaintanceDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('diet');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAcquaintanceDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setData(prev => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map(n => n._id === id ? { ...n, read: true } : n),
      }));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D9ECA2] border-t-[#7D9C6D] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const roleStyle = ROLE_COLORS[data?.relationship] || ROLE_COLORS['Family Member'];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {/* Header */}
      <div className="bg-white rounded-b-[32px] shadow-sm px-6 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Support Dashboard</p>
            <h1 className="text-2xl font-extrabold text-gray-800 mt-1">
              Monitoring {data?.addictName || 'User'}
            </h1>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border}`}>
            {data?.relationship || 'Support Contact'}
          </span>
          {data?.unreadCount > 0 && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
              <Bell size={12} /> {data.unreadCount} new alert{data.unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          {[
            { id: 'diet', label: 'Diet Plan', icon: Leaf },
            { id: 'alerts', label: 'Alerts', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7D9C6D] text-white shadow-md'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'alerts' && data?.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {data.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Diet Plan Tab */}
        {activeTab === 'diet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={18} className="text-[#7D9C6D]" />
              <h2 className="text-lg font-extrabold text-gray-800">
                {data?.addictName}'s Diet Plan
              </h2>
            </div>

            {data?.dietPlan?.meals?.length ? (
              <div className="space-y-4">
                {/* Daily Goals Summary */}
                {data.dietPlan.dailyGoals && (
                  <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Daily Targets</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Calories', value: data.dietPlan.dailyGoals.calories, unit: 'kcal', icon: Flame, color: 'text-orange-500' },
                        { label: 'Protein', value: data.dietPlan.dailyGoals.protein, unit: 'g', icon: Heart, color: 'text-[#7D9C6D]' },
                        { label: 'Water', value: data.dietPlan.dailyGoals.hydration, unit: 'ml', icon: Droplets, color: 'text-blue-500' },
                      ].map(item => (
                        <div key={item.label} className="bg-gray-50 p-3 rounded-2xl text-center">
                          <item.icon size={16} className={`mx-auto ${item.color} mb-1`} />
                          <p className="text-lg font-bold text-gray-800">{item.value}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meal Cards */}
                {data.dietPlan.meals.map((meal, i) => (
                  <div key={meal.mealId || i} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-2xl">{meal.heroEmoji || '🍽️'}</span>
                        <h3 className="text-base font-extrabold text-gray-800 mt-1">{meal.title}</h3>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">
                          {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)} · {meal.time}
                        </p>
                      </div>
                      {meal.completed && (
                        <span className="px-2 py-1 rounded-lg bg-[#EEF6DA] text-[#7D9C6D] text-xs font-bold">
                          Completed
                        </span>
                      )}
                    </div>
                    {meal.nutrients && (
                      <div className="flex gap-3 text-xs text-gray-500 font-medium">
                        <span>{meal.nutrients.calories} kcal</span>
                        <span>P: {meal.nutrients.protein}g</span>
                        <span>C: {meal.nutrients.carbs}g</span>
                        <span>F: {meal.nutrients.fats}g</span>
                      </div>
                    )}
                    {meal.ingredients?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {meal.ingredients.map((ing, j) => (
                          <span key={j} className="px-2 py-1 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600">
                            {ing.icon || ''} {ing.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[24px] border border-gray-100 text-center">
                <Leaf size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">No diet plan available yet.</p>
                <p className="text-gray-300 text-sm mt-1">A plan will appear once {data?.addictName} logs in.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-[#7D9C6D]" />
              <h2 className="text-lg font-extrabold text-gray-800">Coping Alerts</h2>
            </div>

            {data?.notifications?.length ? (
              <div className="space-y-3">
                {data.notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-4 rounded-[20px] border shadow-sm transition-colors cursor-pointer ${
                      notification.read
                        ? 'bg-white border-gray-100'
                        : 'bg-red-50 border-red-200'
                    }`}
                    onClick={() => !notification.read && handleMarkRead(notification._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        notification.read ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-500'
                      }`}>
                        {notification.read ? <BellOff size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {notification.read && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-400">
                              <CheckCircle2 size={12} /> Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-[24px] border border-gray-100 text-center">
                <Bell size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-semibold">No alerts yet.</p>
                <p className="text-gray-300 text-sm mt-1">You'll be notified when {data?.addictName} needs support.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
