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

// Types
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalHours: string;
  thisWeekHours: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  status: string;
  timeEntries?: Record<string, string>;
}

interface CalendarEvent {
  start: Date;
  end: Date;
}

// UI Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// Utility Functions
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${String(minutes).padStart(2, '0')}`;
};

const calculateTotalSeconds = (events: CalendarEvent[], startDate?: Date): number => {
  return events
    .filter(event => !startDate || event.start >= startDate)
    .reduce((acc, event) => {
      return acc + (event.end.getTime() - event.start.getTime()) / 1000;
    }, 0);
};

const parseTimeEntry = (timeStr: string): number => {
  if (typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
  
  const [h, m, s] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  
  // Return total seconds
  return (h * 3600) + (m * 60) + (s || 0);
};

const calculateProjectTime = (timeEntries: Record<string, string> = {}): { hours: number; minutes: number; seconds: number } => {
  const totalSeconds = Object.values(timeEntries).reduce((acc, time) => {
    return acc + parseTimeEntry(time);
  }, 0);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  return { hours, minutes, seconds };
};

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    default: 'bg-yellow-100 text-yellow-700'
  };
  return statusColors[status] || statusColors.default;
};

// Dashboard Components
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

const ProjectListItem: React.FC<{ project: Project }> = ({ project }) => {
  const { hours, minutes, seconds } = calculateProjectTime(project.timeEntries);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center flex-1">
        <div
          className="w-3 h-3 rounded-full mr-3"
          style={{ backgroundColor: project.color }}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{project.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {hours}h {minutes}m {seconds}s logged
          </p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
        {project.status}
      </span>
    </div>
  );
};

const EmptyState: React.FC<{ message: string; linkText: string; linkTo: string }> = ({ 
  message, 
  linkText, 
  linkTo 
}) => (
  <div className="text-center py-8">
    <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
    <p className="text-sm text-gray-500">{message}</p>
    <Link 
      to={linkTo} 
      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
    >
      {linkText}
    </Link>
  </div>
);

const TimeOverviewCard: React.FC<{
  title: string;
  time: string;
  icon: React.ReactNode;
  bgColor: string;
  iconBgColor: string;
}> = ({ title, time, icon, bgColor, iconBgColor }) => (
  <div className={`flex items-center justify-between p-4 ${bgColor} rounded-lg`}>
    <div className="flex items-center">
      <div className={`${iconBgColor} p-3 rounded-lg mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{time}</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const totalSeconds = calculateTotalSeconds(events);
    const weekSeconds = calculateTotalSeconds(events, oneWeekAgo);

    setStats({
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalHours: formatTime(totalSeconds),
      thisWeekHours: formatTime(weekSeconds),
    });
  };

  const getTodayTime = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySeconds = events
      .filter(e => {
        const eventDate = new Date(e.start);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      })
      .reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 1000, 0);
    
    return formatTime(todaySeconds);
  };

  const getMonthTime = (): string => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSeconds = calculateTotalSeconds(events, monthStart);
    return formatTime(monthSeconds);
  };

  const quickActions = [
    { 
      title: 'Projects', 
      description: 'View and manage all projects', 
      icon: <FolderKanban size={24} className="text-blue-600" />, 
      to: '/projects', 
      iconBg: 'bg-blue-50' 
    },
    { 
      title: 'Calendar', 
      description: 'Schedule and track time entries', 
      icon: <Calendar size={24} className="text-purple-600" />, 
      to: '/calendar', 
      iconBg: 'bg-purple-50' 
    },
    { 
      title: 'Timesheet', 
      description: 'Review time logs and reports', 
      icon: <Clock size={24} className="text-green-600" />, 
      to: '/timesheet', 
      iconBg: 'bg-green-50' 
    },
    { 
      title: 'Users', 
      description: 'Manage team members', 
      icon: <Users size={24} className="text-orange-600" />, 
      to: '/user', 
      iconBg: 'bg-orange-50' 
    },
    { 
      title: 'Clients', 
      description: 'View and manage clients', 
      icon: <Building2 size={24} className="text-pink-600" />, 
      to: '/client', 
      iconBg: 'bg-pink-50' 
    },
    { 
      title: 'Roles', 
      description: 'Configure user permissions', 
      icon: <Shield size={24} className="text-indigo-600" />, 
      to: '/role', 
      iconBg: 'bg-indigo-50' 
    }
  ];

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
          {quickActions.map(action => (
            <QuickActionCard key={action.to} {...action} />
          ))}
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
                  {projects.slice(0, 5).map(project => (
                    <ProjectListItem key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No projects yet"
                  linkText="Create your first project"
                  linkTo="/projects"
                />
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
                <TimeOverviewCard
                  title="Today"
                  time={getTodayTime()}
                  icon={<Clock size={20} className="text-blue-600" />}
                  bgColor="bg-blue-50"
                  iconBgColor="bg-blue-100"
                />
                <TimeOverviewCard
                  title="This Week"
                  time={stats.thisWeekHours}
                  icon={<Calendar size={20} className="text-purple-600" />}
                  bgColor="bg-purple-50"
                  iconBgColor="bg-purple-100"
                />
                <TimeOverviewCard
                  title="This Month"
                  time={getMonthTime()}
                  icon={<TrendingUp size={20} className="text-green-600" />}
                  bgColor="bg-green-50"
                  iconBgColor="bg-green-100"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;