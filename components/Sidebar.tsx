
import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Shield, 
  Users,
  Moon,
  Sun,
  UserCircle,
  Headphones,
  Activity,
  FileSpreadsheet,
  Lock,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import { ViewState, UserRole } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userRole: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isDarkMode, 
  toggleDarkMode, 
  userRole, 
  onLogout 
}) => {
  
  const studentItems = [
    { id: ViewState.DASHBOARD, label: 'Principal', icon: LayoutDashboard },
    { id: ViewState.LEARNING_PATH, label: 'Aprendizaje / Ruta', icon: TrendingUp },
    { id: ViewState.COURSES, label: 'Cursos', icon: BookOpen },
    { id: ViewState.EXAMS, label: 'Exámenes', icon: FileText },
    { id: ViewState.PLANS, label: 'Planes', icon: Shield },
    { id: ViewState.PAYMENTS, label: 'Pagos', icon: CreditCard },
  ];

  const staffItems = [
    { id: ViewState.STAFF_SUMMARY, label: 'Resumen', icon: Activity },
    { id: ViewState.STAFF_USERS, label: 'Usuarios', icon: Users },
    { id: ViewState.STAFF_GRADES, label: 'Calificaciones', icon: GraduationCap },
    { id: ViewState.STAFF_COURSES, label: 'Cursos', icon: BookOpen },
    { id: ViewState.STAFF_FINANCE, label: 'Pagos', icon: DollarSign },
    { id: ViewState.STAFF_PRIVACY, label: 'Privacidad', icon: Shield },
    { id: ViewState.STAFF_LOGS, label: 'Auditoría', icon: Lock },
    { id: ViewState.STAFF_REPORTS, label: 'Reportes', icon: FileSpreadsheet },
  ];

  // Choose which menu to display
  const mainMenuItems = userRole === UserRole.STAFF ? staffItems : studentItems;

  const bottomItems = [
    { id: ViewState.SUPPORT, label: 'Soporte', icon: Headphones },
    { id: ViewState.PROFILE, label: 'Mi Cuenta', icon: UserCircle },
    { id: ViewState.SETTINGS, label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className={`h-screen w-64 border-r flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-blue-100 text-slate-700'}`}>
      <div className="p-6 border-b border-opacity-10 border-current flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>
          <BookOpen size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight">Tecnokids</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <p className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {userRole === UserRole.STAFF ? 'Administración' : 'Menú Principal'}
        </p>
        <ul className="space-y-1 px-3 mb-6">
          {mainMenuItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentView === item.id || (item.id === ViewState.COURSES && currentView === ViewState.COURSE_DETAIL);
             return (
              <li key={item.id}>
                <button
                  onClick={() => onChangeView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-700') 
                      : (isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600')
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              </li>
             );
          })}
        </ul>
        
        <div className="mt-2 px-3">
          <p className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Cuenta
          </p>
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onChangeView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                       isActive 
                      ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-700') 
                      : (isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600')
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                </li>
              );
            })}
             <li>
                <button
                  onClick={toggleDarkMode}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                     isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                  {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                </button>
              </li>
          </ul>
        </div>
      </nav>

      <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-blue-100'}`}>
        <button 
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isDarkMode ? 'text-red-400 hover:bg-slate-800' : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
