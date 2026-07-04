'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, GraduationCap, Users, Eye, EyeOff, Settings } from 'lucide-react';
import { toast } from 'sonner';
import StatCard from '@/components/ui/StatCard';
import Loader from '@/components/ui/Loader';
import { getDashboardStats, getSectionVisibility, updateSectionVisibility } from '@/services/firestore';
import type { DashboardStats } from '@/types';
import type { SectionVisibility } from '@/services/firestore';

const sectionLabels: { key: keyof SectionVisibility; label: string; icon: string }[] = [
  { key: 'services', label: 'Services', icon: '🔧' },
  { key: 'workshops', label: 'Workshops', icon: '🎓' },
  { key: 'events', label: 'Events', icon: '📅' },
  { key: 'blog', label: 'Blog', icon: '📝' },
  { key: 'gallery', label: 'Gallery', icon: '🖼️' },
  { key: 'testimonials', label: 'Testimonials', icon: '⭐' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [visibility, setVisibility] = useState<SectionVisibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, visibilityData] = await Promise.all([
          getDashboardStats(),
          getSectionVisibility(),
        ]);
        setStats(statsData);
        setVisibility(visibilityData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleToggle = async (key: keyof SectionVisibility) => {
    if (!visibility || toggling) return;
    setToggling(key);
    const newValue = !visibility[key];
    try {
      await updateSectionVisibility({ [key]: newValue });
      setVisibility({ ...visibility, [key]: newValue });
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} section ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling section:', error);
      toast.error('Failed to update setting');
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-2xl font-bold text-text mb-1">Dashboard Overview</h1>
        <p className="text-sm text-text/50">Welcome to the Divya Urja admin panel.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Posts" value={stats?.totalPosts || 0} icon={FileText} color="#0F766E" index={0} />
        <StatCard title="Total Events" value={stats?.totalEvents || 0} icon={Calendar} color="#D4AF37" index={1} />
        <StatCard title="Total Workshops" value={stats?.totalWorkshops || 0} icon={GraduationCap} color="#8B5CF6" index={2} />
        <StatCard title="Total Leads" value={stats?.totalLeads || 0} icon={Users} color="#EF4444" index={3} />
      </div>

      {/* Section Visibility Toggles */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-playfair text-lg font-bold text-text">Section Visibility</h2>
            <p className="text-xs text-text/50">Enable or disable sections on your website</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibility && sectionLabels.map(({ key, label, icon }) => {
            const isEnabled = visibility[key];
            const isLoading = toggling === key;
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  isEnabled
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-text">{label}</p>
                    <p className="text-[11px] text-text/40">
                      {isEnabled ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Eye className="w-3 h-3" /> Visible to users
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500">
                          <EyeOff className="w-3 h-3" /> Hidden from users
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  disabled={isLoading}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                    isEnabled ? 'bg-primary' : 'bg-gray-300'
                  } ${isLoading ? 'opacity-50' : ''}`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
