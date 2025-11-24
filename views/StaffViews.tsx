

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  AlertCircle, 
  FileText, 
  Shield, 
  Activity, 
  Download, 
  FileSpreadsheet,
  Search,
  Edit,
  Trash2,
  Eye,
  Lock,
  CheckCircle,
  GraduationCap,
  CreditCard,
  XCircle,
  Check,
  Plus,
  Save,
  X,
  Video,
  List,
  EyeOff
} from 'lucide-react';
import { RegisteredUser } from '../App'; 
import { PaymentRequest, AuditLog, ViewState, Course, Lesson } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StaffDashboardProps {
  currentView: ViewState;
  isBW: boolean;
  users: RegisteredUser[];
  paymentRequests: PaymentRequest[];
  auditLogs: AuditLog[];
  courses: Course[];
  onPaymentAction: (id: string, action: 'approve' | 'reject') => void;
  onSaveCourse: (course: Course) => void;
  onDeleteCourse?: (id: string) => void;
}

// --- HELPER: Download CSV (Excel) ---
const downloadCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(fieldName => {
            // Handle commas inside strings
            const val = row[fieldName] ? row[fieldName].toString() : '';
            return `"${val}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- HELPER: Download Mock PDF ---
const downloadMockPDF = (title: string, content: string) => {
    const blob = new Blob([`REPORTE OFICIAL TECNOKIDS\n\n${title}\n\n${content}`], { type: 'text/plain' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.txt`); 
    link.click();
};

// Modal to Create/Edit Course
const CourseEditorModal: React.FC<{ 
  course: Course | null; 
  isDarkMode: boolean; 
  onClose: () => void; 
  onSave: (c: Course) => void; 
}> = ({ course, isDarkMode, onClose, onSave }) => {
  const [formData, setFormData] = useState<Course>(course || {
    id: Math.random().toString(36).substr(2, 9),
    title: '',
    category: 'General',
    description: '',
    image: 'https://picsum.photos/seed/new/400/250',
    price: 0,
    progress: 0,
    instructor: '',
    lessons: [],
    comments: [],
    minPlan: 'free'
  });

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nueva Lección',
      duration: '15 min',
      isCompleted: false,
      videoUrl: '',
      questions: []
    };
    setFormData({...formData, lessons: [...formData.lessons, newLesson]});
  };

  const handleLessonChange = (index: number, field: keyof Lesson, value: any) => {
    const newLessons = [...formData.lessons];
    newLessons[index] = { ...newLessons[index], [field]: value };
    setFormData({ ...formData, lessons: newLessons });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
       <div className={`w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
          <div className="p-6 border-b border-opacity-10 border-current flex justify-between items-center">
             <h2 className="text-2xl font-bold">{course ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
             <button onClick={onClose}><X size={24}/></button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">Título del Curso</label>
                      <input 
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className={`w-full p-2 rounded border bg-transparent ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">Categoría</label>
                      <input 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className={`w-full p-2 rounded border bg-transparent ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">Instructor</label>
                      <input 
                        value={formData.instructor} 
                        onChange={e => setFormData({...formData, instructor: e.target.value})}
                        className={`w-full p-2 rounded border bg-transparent ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">Precio</label>
                      <input 
                        type="number"
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className={`w-full p-2 rounded border bg-transparent ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
                      />
                   </div>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">Plan Mínimo</label>
                      <select 
                        value={formData.minPlan}
                        onChange={e => setFormData({...formData, minPlan: e.target.value as any})}
                        className={`w-full p-2 rounded border bg-transparent ${isDarkMode ? 'border-slate-700 text-white' : 'border-slate-300'}`}
                      >
                         <option value="free">Gratuito</option>
                         <option value="individual">Individual</option>
                         <option value="business">Business</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">URL Imagen</label>
                      <input 
                        value={formData.image} 
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        className={`w-full p-2 rounded border bg-transparent ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase opacity-60 mb-1">Descripción</label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className={`w-full p-2 rounded border bg-transparent h-24 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}
                      />
                   </div>
                </div>
             </div>

             <div className="border-t border-opacity-10 border-current pt-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg">Malla Curricular (Lecciones)</h3>
                   <button 
                    onClick={handleAddLesson}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium flex items-center gap-1"
                   >
                      <Plus size={16}/> Añadir Lección
                   </button>
                </div>
                
                <div className="space-y-2">
                   {formData.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className={`p-3 rounded border flex items-center justify-between ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                         <div className="flex items-center gap-4 flex-1">
                            <span className="opacity-50 font-mono">{idx + 1}</span>
                            <input 
                              value={lesson.title} 
                              onChange={(e) => handleLessonChange(idx, 'title', e.target.value)}
                              className="bg-transparent font-medium outline-none w-full"
                              placeholder="Título de la lección"
                            />
                         </div>
                         <div className="flex items-center gap-2">
                             <input 
                                value={lesson.duration}
                                onChange={(e) => handleLessonChange(idx, 'duration', e.target.value)}
                                className={`w-20 p-1 text-xs rounded border bg-transparent text-center ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                             />
                             <button 
                                onClick={() => {
                                    const updated = formData.lessons.filter((_, i) => i !== idx);
                                    setFormData({...formData, lessons: updated});
                                }}
                                className="text-red-500 p-1 hover:bg-red-100 rounded"
                             >
                                <Trash2 size={16}/>
                             </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-opacity-10 border-current flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 rounded font-medium opacity-70 hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
             <button 
                onClick={() => onSave(formData)}
                className="px-6 py-2 rounded font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
             >
                <Save size={18} /> Guardar Curso
             </button>
          </div>
       </div>
    </div>
  );
};

// Modal to View Enrolled Students
const CourseStudentsModal: React.FC<{
    course: Course;
    users: RegisteredUser[];
    isDarkMode: boolean;
    onClose: () => void;
}> = ({ course, users, isDarkMode, onClose }) => {
    // Filter users who have this course in their course list
    const enrolledStudents = users.filter(u => u.courses.some(c => c.course_id === course.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                <div className="p-4 border-b border-opacity-10 border-current flex justify-between items-center">
                    <h3 className="font-bold text-lg">Alumnos en: {course.title}</h3>
                    <button onClick={onClose}><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-0">
                    <table className="w-full text-left text-sm">
                        <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                            <tr>
                                <th className="p-4">Estudiante</th>
                                <th className="p-4">Progreso</th>
                                <th className="p-4">Lecciones Completadas</th>
                                <th className="p-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                            {enrolledStudents.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center opacity-60">No hay alumnos activos en este curso.</td></tr>
                            ) : enrolledStudents.map(u => {
                                const data = u.courses.find(c => c.course_id === course.id);
                                const completedLessons = Math.floor(((data?.progress || 0) / 100) * course.lessons.length);
                                return (
                                    <tr key={u.id}>
                                        <td className="p-4 font-medium">
                                            {u.name} 
                                            <div className="text-xs opacity-60">{u.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${data?.progress || 0}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold">{Math.round(data?.progress || 0)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {completedLessons} / {course.lessons.length}
                                        </td>
                                        <td className="p-4">
                                            {data?.is_completed ? (
                                                <span className="text-green-600 font-bold text-xs flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full w-fit"><CheckCircle size={12}/> Completado</span>
                                            ) : (
                                                <span className="text-blue-600 text-xs font-bold flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full w-fit"><BookOpen size={12}/> En curso</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentView, isBW, users, paymentRequests, auditLogs, courses, onPaymentAction, onSaveCourse, onDeleteCourse }) => {
  const isDarkMode = isBW;
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewingStudentsCourse, setViewingStudentsCourse] = useState<Course | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [showPasswords, setShowPasswords] = useState(false); // Toggle visibility locally

  // Calculate Stats
  const pendingPaymentsCount = paymentRequests.filter(p => p.status === 'pending').length;
  const totalRevenue = paymentRequests.filter(p => p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
  const totalProgressPoints = users.reduce((acc, user) => acc + user.courses.reduce((sum, c) => sum + c.progress, 0), 0);
  const totalLessonsEstimated = Math.floor(totalProgressPoints / 10); 

  // Generate Real Chart Data
  useEffect(() => {
      if (users.length === 0) {
          // Empty chart for start
          setChartData([
              { name: 'Inicio', users: 0, activity: 0 },
          ]);
          return;
      }

      // Group users by join date (simplified to just show accumulation or activity)
      // Since we might not have historical activity data for "activity", we will just plot the current state
      // For a real dashboard, you'd query historical data.
      // Here we will create a simple "Current Status"
      
      const activeUsers = users.length;
      const totalActivity = users.reduce((acc, u) => acc + u.courses.length, 0);

      setChartData([
          { name: 'Anterior', users: 0, activity: 0 },
          { name: 'Actual', users: activeUsers, activity: totalActivity }
      ]);

  }, [users]);


  const mockConsentLogs = users.map((u, i) => ({
    id: i + 1,
    user: u.name,
    doc: 'Términos y Condiciones v2.1',
    status: 'Aceptado',
    date: u.joinDate,
    ip: `192.168.1.${10+i}`
  }));

  // Report Handler
  const handleDownloadReport = (type: 'Excel' | 'PDF', reportName: string) => {
    let dataToExport = [];
    
    if (reportName.includes('Estudiante')) {
        dataToExport = users.map(u => ({
            Nombre: u.name,
            Email: u.email,
            Password: u.password, // Include in export
            Pais: u.country,
            Plan: u.planId,
            Cursos_Iniciados: u.courses.length,
            Fecha_Registro: u.joinDate
        }));
    } else if (reportName.includes('Financiero')) {
        dataToExport = paymentRequests.map(p => ({
            ID: p.id,
            Usuario: p.userEmail,
            Plan: p.planName,
            Monto: p.amount,
            Estado: p.status,
            Fecha: p.date
        }));
    }

    if (type === 'Excel') {
        downloadCSV(dataToExport, reportName);
    } else {
        const content = dataToExport.map(row => Object.values(row).join(' | ')).join('\n');
        downloadMockPDF(reportName, content);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className={isDarkMode ? "text-slate-400" : "text-slate-500"}>Gestión integral de Tecnokids</p>
        </div>
      </div>

      {/* Modals */}
      {isEditorOpen && (
          <CourseEditorModal 
            course={editingCourse} 
            isDarkMode={isDarkMode} 
            onClose={() => { setIsEditorOpen(false); setEditingCourse(null); }}
            onSave={(c) => { onSaveCourse(c); setIsEditorOpen(false); setEditingCourse(null); }}
          />
      )}
      {viewingStudentsCourse && (
          <CourseStudentsModal 
            course={viewingStudentsCourse} 
            users={users} 
            isDarkMode={isDarkMode} 
            onClose={() => setViewingStudentsCourse(null)} 
          />
      )}

      {/* Content Area */}
      <div className="animate-fade-in">
        
        {/* OVERVIEW TAB */}
        {currentView === ViewState.STAFF_SUMMARY && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Estudiantes Totales', value: users.length.toString(), icon: Users, color: 'blue' },
                { title: 'Ingresos Totales', value: `$${totalRevenue}`, icon: DollarSign, color: 'green' },
                { title: 'Pagos Pendientes', value: pendingPaymentsCount.toString(), icon: CreditCard, color: 'orange' },
                { title: 'Lecciones Vistas', value: totalLessonsEstimated.toString(), icon: BookOpen, color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium opacity-70 mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-slate-700 text-white' : `bg-${stat.color}-50 text-${stat.color}-600`
                    }`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-xl border mb-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-blue-100 shadow-sm'}`}>
               <h3 className="text-xl font-bold mb-6">Estadísticas Globales de la Página</h3>
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#eee"} vertical={false} />
                        <XAxis dataKey="name" stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                        <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                        <Tooltip 
                            contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                            color: isDarkMode ? '#fff' : '#000'
                            }} 
                        />
                        <Area type="monotone" dataKey="activity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActivity)" name="Actividad (Lecciones)" />
                        <Area type="monotone" dataKey="users" stroke="#10b981" fill="none" name="Usuarios Totales" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {currentView === ViewState.STAFF_USERS && (
           <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
             <div className="p-4 border-b border-opacity-10 border-current flex justify-between items-center">
                <h3 className="font-bold">Directorio de Estudiantes y Progreso</h3>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowPasswords(!showPasswords)}
                        className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 border ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                        {showPasswords ? <EyeOff size={14}/> : <Eye size={14}/>} 
                        {showPasswords ? 'Ocultar Contraseñas' : 'Ver Contraseñas'}
                    </button>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <Search size={16} className="opacity-50"/>
                        <input type="text" placeholder="Buscar usuario..." className="bg-transparent outline-none text-sm w-48"/>
                    </div>
                </div>
             </div>
             <table className="w-full text-left text-sm">
                <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                    <tr>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Credenciales</th>
                        <th className="p-4">Cursos Iniciados</th>
                        <th className="p-4">Progreso General</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Fecha Registro</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {users.length === 0 ? (
                         <tr>
                             <td colSpan={7} className="p-8 text-center opacity-50">No hay usuarios registrados aún.</td>
                         </tr>
                    ) : users.map((user, idx) => {
                        // Calculate stats for this user
                        const startedCourses = user.courses.length;
                        const completedCourses = user.courses.filter(c => c.is_completed).length;
                        const avgProgress = startedCourses > 0 
                            ? Math.round(user.courses.reduce((a, b) => a + b.progress, 0) / startedCourses) 
                            : 0;

                        return (
                        <tr key={idx} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                            <td className="p-4 font-bold">{user.name}</td>
                            <td className="p-4">
                                <div className="text-xs opacity-70 mb-1">Email: {user.email}</div>
                                {showPasswords && (
                                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded w-fit font-mono text-xs">
                                        <Lock size={10}/> {user.password || '******'}
                                    </div>
                                )}
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className={`font-bold ${startedCourses > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {startedCourses} Cursos
                                    </span>
                                    {startedCourses > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {user.courses.map(uc => {
                                                const cName = courses.find(c => c.id === uc.course_id)?.title;
                                                return cName ? <span key={uc.course_id} className="text-[10px] px-1 bg-blue-100 text-blue-700 rounded">{cName}</span> : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="w-full max-w-[100px]">
                                    <span className="text-xs font-bold">{avgProgress}%</span>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${avgProgress}%` }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    user.planId === 'free' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {user.planId}
                                </span>
                            </td>
                            <td className="p-4 opacity-70">{user.joinDate}</td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button title="Descargar Reporte Individual" onClick={() => handleDownloadReport('PDF', `Estudiante_${user.name}`)} className="p-1 hover:bg-blue-100 rounded text-blue-600"><FileText size={16}/></button>
                                    <button title="Editar" className="p-1 hover:bg-blue-100 rounded text-blue-600"><Edit size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    )})}
                </tbody>
             </table>
           </div>
        )}

        {/* GRADES TAB */}
        {currentView === ViewState.STAFF_GRADES && (
           <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
             <div className="p-4 border-b border-opacity-10 border-current">
                <h3 className="font-bold flex items-center gap-2"><GraduationCap size={18}/> Registro de Calificaciones</h3>
                <p className="text-sm opacity-60 mt-1">Resultados de los exámenes finales por curso.</p>
             </div>
             <table className="w-full text-left text-sm">
                <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                    <tr>
                        <th className="p-4">Estudiante</th>
                        <th className="p-4">Curso</th>
                        <th className="p-4">Calificación</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Fecha</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {users.flatMap(user => 
                        user.exams.map((exam, idx) => (
                            <tr key={`${user.email}-${idx}`} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                                <td className="p-4 font-bold">{user.name}</td>
                                <td className="p-4">{exam.courseName}</td>
                                <td className="p-4 font-mono font-bold">{exam.score}/100</td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                        exam.status === 'passed' 
                                        ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') 
                                        : (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                                    }`}>
                                        {exam.status === 'passed' ? 'Aprobado' : 'Reprobado'}
                                    </span>
                                </td>
                                <td className="p-4 opacity-70">{exam.date}</td>
                            </tr>
                        ))
                    )}
                    {users.every(u => u.exams.length === 0) && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center opacity-50">No hay exámenes registrados todavía.</td>
                        </tr>
                    )}
                </tbody>
             </table>
           </div>
        )}

        {/* COURSES TAB (Real Management) */}
        {currentView === ViewState.STAFF_COURSES && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Gestión de Contenido y Alumnos</h3>
                    <button 
                        onClick={() => { setEditingCourse(null); setIsEditorOpen(true); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"
                    >
                        <Plus size={18}/> Crear Nuevo Curso
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {courses.map((c) => {
                        const enrolledCount = users.filter(u => u.courses.some(uc => uc.course_id === c.id)).length;
                        return (
                        <div key={c.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-4">
                                <img src={c.image} alt={c.title} className="w-16 h-16 rounded-lg object-cover" />
                                <div>
                                    <h4 className="font-bold text-lg">{c.title}</h4>
                                    <p className="text-sm opacity-60">{c.category} • {c.lessons.length} Lecciones</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs opacity-50 border px-1 rounded">{c.minPlan === 'free' ? 'Gratuito' : `Plan ${c.minPlan}`}</span>
                                        <span className="text-xs font-bold text-blue-600">{enrolledCount} Alumnos Activos</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setEditingCourse(c); setIsEditorOpen(true); }}
                                    className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
                                >
                                    <Edit size={14} /> Editar
                                </button>
                                <button 
                                    onClick={() => setViewingStudentsCourse(c)}
                                    className={`px-3 py-2 rounded text-sm font-medium flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                >
                                    <Users size={14} /> Ver Alumnos
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
             </div>
        )}

        {/* PRIVACY & CONSENT TAB */}
        {currentView === ViewState.STAFF_PRIVACY && (
            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="p-4 border-b border-opacity-10 border-current">
                    <h3 className="font-bold flex items-center gap-2"><Shield size={18}/> Registro de Consentimiento y Normativa</h3>
                    <p className="text-sm opacity-60 mt-1">Historial de aceptación de términos, condiciones y políticas de privacidad.</p>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                        <tr>
                            <th className="p-4">Usuario</th>
                            <th className="p-4">Documento</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Fecha y Hora</th>
                            <th className="p-4">IP Origen</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                        {users.length === 0 ? (
                             <tr>
                                <td colSpan={5} className="p-8 text-center opacity-50">No hay datos de consentimiento.</td>
                             </tr>
                        ) : mockConsentLogs.map((log) => (
                            <tr key={log.id} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                                <td className="p-4 font-medium">{log.user}</td>
                                <td className="p-4">{log.doc}</td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                                        <CheckCircle size={12} /> {log.status}
                                    </span>
                                </td>
                                <td className="p-4 opacity-70">{log.date}</td>
                                <td className="p-4 font-mono text-xs opacity-60">{log.ip}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* AUDIT LOGS TAB */}
        {currentView === ViewState.STAFF_LOGS && (
            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="p-4 border-b border-opacity-10 border-current">
                    <h3 className="font-bold flex items-center gap-2"><Activity size={18}/> Auditoría de Actividad</h3>
                    <p className="text-sm opacity-60 mt-1">Registro completo de operaciones realizadas por los usuarios.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Acción</th>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Detalles</th>
                                <th className="p-4">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                            {auditLogs.length === 0 ? (
                                 <tr>
                                    <td colSpan={5} className="p-8 text-center opacity-50">No hay actividad registrada.</td>
                                 </tr>
                            ) : auditLogs.map((log) => (
                                <tr key={log.id} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                                    <td className="p-4 opacity-50">#{log.id}</td>
                                    <td className="p-4 font-medium">{log.action}</td>
                                    <td className="p-4">{log.user}</td>
                                    <td className="p-4 opacity-70">{log.details}</td>
                                    <td className="p-4 opacity-70">{log.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* REPORTS TAB */}
        {currentView === ViewState.STAFF_REPORTS && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileSpreadsheet size={20}/> Reportes Financieros</h3>
                    <p className="text-sm opacity-60 mb-6">Exporta el historial de transacciones, ingresos mensuales y proyecciones.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleDownloadReport('Excel', 'Financiero_Mensual')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                            <Download size={16}/> Excel (.csv)
                        </button>
                        <button 
                            onClick={() => handleDownloadReport('PDF', 'Financiero_Resumen')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                            <Download size={16}/> PDF
                        </button>
                    </div>
                </div>

                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Users size={20}/> Reporte General de Estudiantes</h3>
                    <p className="text-sm opacity-60 mb-6">Progreso detallado, tasas de finalización y datos demográficos de toda la plataforma.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleDownloadReport('Excel', 'Estudiantes_Completo')}
                            className={`flex-1 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                            <Download size={16}/> Excel (.csv)
                        </button>
                        <button 
                             onClick={() => handleDownloadReport('PDF', 'Estudiantes_Resumen')}
                             className={`flex-1 py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
                        >
                            <Download size={16}/> PDF
                        </button>
                    </div>
                </div>

                 <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield size={20}/> Logs de Auditoría</h3>
                    <p className="text-sm opacity-60 mb-6">Exportación completa de logs de seguridad y accesos para cumplimiento normativo.</p>
                    <button 
                        onClick={() => handleDownloadReport('Excel', 'Auditoria_Seguridad')}
                        className={`w-full py-2 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
                    >
                         <Download size={16}/> Exportar CSV Completo
                    </button>
                </div>
             </div>
        )}

        {/* FINANCE TAB */}
        {currentView === ViewState.STAFF_FINANCE && (
             <div className="space-y-8">
                <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="p-4 border-b border-opacity-10 border-current bg-yellow-500/10">
                        <h3 className="font-bold flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <AlertCircle size={18}/> Solicitudes Pendientes de Aprobación
                        </h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                            <tr>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Plan Solicitado</th>
                                <th className="p-4">Monto</th>
                                <th className="p-4">Método</th>
                                <th className="p-4">Detalles</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                            {paymentRequests.filter(r => r.status === 'pending').length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center opacity-50">No hay solicitudes de pago pendientes.</td>
                                </tr>
                            ) : paymentRequests.filter(r => r.status === 'pending').map((req) => (
                                <tr key={req.id} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                                    <td className="p-4">
                                        <div className="font-bold">{req.userName}</div>
                                        <div className="text-xs opacity-60">{req.userEmail}</div>
                                    </td>
                                    <td className="p-4 font-medium text-blue-600">{req.planName}</td>
                                    <td className="p-4 font-bold">${req.amount}</td>
                                    <td className="p-4">{req.method}</td>
                                    <td className="p-4 font-mono text-xs">{req.details}</td>
                                    <td className="p-4 opacity-70">{req.date}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => onPaymentAction(req.id, 'approve')}
                                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Aprobar">
                                                <Check size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => onPaymentAction(req.id, 'reject')}
                                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Rechazar">
                                                <XCircle size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="p-4 border-b border-opacity-10 border-current">
                        <h3 className="font-bold flex items-center gap-2 opacity-70">
                            <DollarSign size={18}/> Historial de Transacciones
                        </h3>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}>
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Plan</th>
                                <th className="p-4">Monto</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                             {paymentRequests.filter(r => r.status !== 'pending').length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center opacity-50">No hay historial de transacciones.</td>
                                </tr>
                            ) : paymentRequests.filter(r => r.status !== 'pending').map((req) => (
                                <tr key={req.id} className="opacity-80">
                                    <td className="p-4 font-mono text-xs opacity-50">#{req.id}</td>
                                    <td className="p-4">{req.userEmail}</td>
                                    <td className="p-4">{req.planName}</td>
                                    <td className="p-4">${req.amount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                            req.status === 'approved' 
                                            ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                                            : (isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
                                        }`}>
                                            {req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                        </span>
                                    </td>
                                    <td className="p-4 opacity-70">{req.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};