import React from 'react';
import { Course } from '../types';
import { User, Star, PlayCircle, Lock } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isDarkMode: boolean;
  onSelect: (course: Course) => void;
  isLocked: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isDarkMode, onSelect, isLocked }) => {
  return (
    <div className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border flex flex-col relative ${
      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
    }`}>
      {isLocked && (
        <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-6 text-center">
           <Lock size={48} className="mb-4 opacity-80" />
           <h3 className="text-xl font-bold mb-2">Curso Bloqueado</h3>
           <p className="text-sm opacity-90">Necesitas el plan {course.minPlan === 'individual' ? 'Individual' : 'Business'} para acceder a este contenido.</p>
        </div>
      )}

      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ${isLocked ? 'grayscale' : ''}`}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
            isDarkMode ? 'bg-black/70 text-white' : 'bg-white/90 text-blue-700'
          }`}>
            {course.category}
          </span>
        </div>
        {!isLocked && course.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div className="h-full bg-green-500" style={{ width: `${course.progress}%` }}></div>
            </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">{course.title}</h3>
        <p className={`text-sm mb-4 line-clamp-2 flex-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-1">
            <User size={14} className={isDarkMode ? 'text-slate-400' : 'text-slate-400'} />
            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{course.instructor}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8</span>
          </div>
        </div>

        <div className="mt-auto">
            {course.progress > 0 ? (
                 <button 
                    onClick={() => !isLocked && onSelect(course)}
                    disabled={isLocked}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                        isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                 >
                    <PlayCircle size={16} />
                    Continuar ({Math.round(course.progress)}%)
                 </button>
            ) : (
                <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-600'}`}>
                        {course.price === 0 ? 'Gratis' : `$${course.price}`}
                    </span>
                    <button 
                        onClick={() => !isLocked && onSelect(course)}
                        disabled={isLocked}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                             isLocked
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : (isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800')
                        }`}
                    >
                        {isLocked ? 'Bloqueado' : 'Empezar Curso'}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;