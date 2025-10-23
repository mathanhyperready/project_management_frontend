import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAppContext } from '../../../contexts/AppContext';

// Simple inline Card components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalHours: string;
  thisWeekHours: string;
}

const DashboardPage: React.FC = () => {
  const { projects, events } = useAppContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalHours: '0:00',
    thisWeekHours: '0:00',
  });

  useEffect(() => {
    calculateStats();
  }, [projects, events]);

  const calculateStats = () => {
    let totalSeconds = 0;
    let weekSeconds = 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    events.forEach(event => {
      const duration = (event.end.getTime() - event.start.getTime()) / 1000;
      totalSeconds += duration;
      
      if (event.start >= oneWeekAgo) {
        weekSeconds += duration;
      }
    });

    const formatHours = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    };

    setStats({
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalHours: formatHours(totalSeconds),
      thisWeekHours: formatHours(weekSeconds),
    });
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
  }> = ({ title, value, icon, iconBg }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`${iconBg} p-4 rounded-xl`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActionCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    to: string;
    iconBg: string;
  }> = ({ title, description, icon, to, iconBg }) => (
    <Link
      to={to}
      className="group block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`${iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight 
          size={20} 
          className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
        />
      </div>
    </Link>
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<FolderKanban size={24} className="text-blue-600" />}
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={<CheckCircle2 size={24} className="text-green-600" />}
            iconBg="bg-green-50"
          />
          <StatCard
            title="Total Hours"
            value={stats.totalHours}
            icon={<Clock size={24} className="text-purple-600" />}
            iconBg="bg-purple-50"
          />
          <StatCard
            title="This Week"
            value={stats.thisWeekHours}
            icon={<TrendingUp size={24} className="text-orange-600" />}
            iconBg="bg-orange-50"
          />
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <QuickActionCard
            title="Projects"
            description="View and manage all projects"
            icon={<FolderKanban size={24} className="text-blue-600" />}
            to="/projects"
            iconBg="bg-blue-50"
          />
          <QuickActionCard
            title="Calendar"
            description="Schedule and track time entries"
            icon={<Calendar size={24} className="text-purple-600" />}
            to="/calendar"
            iconBg="bg-purple-50"
          />
          <QuickActionCard
            title="Timesheet"
            description="Review time logs and reports"
            icon={<Clock size={24} className="text-green-600" />}
            to="/timesheet"
            iconBg="bg-green-50"
          />
          <QuickActionCard
            title="Users"
            description="Manage team members"
            icon={<Users size={24} className="text-orange-600" />}
            to="/user"
            iconBg="bg-orange-50"
          />
          <QuickActionCard
            title="Clients"
            description="View and manage clients"
            icon={<Building2 size={24} className="text-pink-600" />}
            to="/client"
            iconBg="bg-pink-50"
          />
          <QuickActionCard
            title="Roles"
            description="Configure user permissions"
            icon={<Shield size={24} className="text-indigo-600" />}
            to="/role"
            iconBg="bg-indigo-50"
          />
        </div>

        {/* Recent Projects and Time Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                <Link 
                  to="/projects" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  View all
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-0">
                  {projects.slice(0, 5).map((project) => {
                    const totalHours = Object.values(project.timeEntries).reduce((acc, time) => {
                      const [h, m] = time.split(':').map(Number);
                      return acc + h + (m / 60);
                    }, 0);
                    
                    return (
                      <div 
                        key={project.id} 
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center flex-1">
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: project.color }}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {totalHours.toFixed(1)} hours logged
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No projects yet</p>
                  <Link 
                    to="/projects" 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                  >
                    Create your first project
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Time Overview</h3>
                <Link 
                  to="/timesheet" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  View timesheet
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Today's Hours */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const todaySeconds = events
                            .filter(e => {
                              const eventDate = new Date(e.start);
                              eventDate.setHours(0, 0, 0, 0);
                              return eventDate.getTime() === today.getTime();
                            })
                            .reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 1000, 0);
                          const hours = Math.floor(todaySeconds / 3600);
                          const minutes = Math.floor((todaySeconds % 3600) / 60);
                          return `${hours}:${String(minutes).padStart(2, '0')}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* This Week */}
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                      <Calendar size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.thisWeekHours}</p>
                    </div>
                  </div>
                </div>

                {/* This Month */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(() => {
                          const now = new Date();
                          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                          const monthSeconds = events
                            .filter(e => e.start >= monthStart)
                            .reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 1000, 0);
                          const hours = Math.floor(monthSeconds / 3600);
                          const minutes = Math.floor((monthSeconds % 3600) / 60);
                          return `${hours}:${String(minutes).padStart(2, '0')}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;