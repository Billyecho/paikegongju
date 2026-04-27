import { useState } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  isSameDay,
  isSameMonth,
  isWithinInterval
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable } from '@dnd-kit/core'
import { useCoursesContext } from '../hooks/useCoursesContext'
import { useStudentsContext } from '../hooks/useStudentsContext'
import CourseBlock from './CourseBlock'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8)
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function Calendar({ onCourseClick }) {
  const [view, setView] = useState('week') // 'week' | 'day' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeCourse, setActiveCourse] = useState(null)
  const { courses, updateCourse } = useCoursesContext()
  const { students } = useStudentsContext()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  const handlePrev = () => {
    if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else if (view === 'day') setCurrentDate(addDays(currentDate, -1))
    else setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else if (view === 'day') setCurrentDate(addDays(currentDate, 1))
    else setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  const handleDragStart = (event) => {
    const course = courses.find(c => c.id === event.active.id)
    setActiveCourse(course)
  }

  const handleDragEnd = async (event) => {
    setActiveCourse(null)
    if (!event.over) return

    const { active, over } = event
    const courseId = active.id
    const [newDateStr, newHourStr] = String(over.id).split('|')
    const newHour = newHourStr === undefined ? null : Number(newHourStr)

    const course = courses.find(c => c.id === courseId)
    if (!course) return

    const originalStart = new Date(course.startTime)
    const originalEnd = new Date(course.endTime)
    const duration = originalEnd - originalStart

    const [year, month, day] = newDateStr.split('-').map(Number)
    const newDate = new Date(year, month - 1, day)

    const newStart = new Date(newDate)
    newStart.setHours(newHour ?? originalStart.getHours())
    newStart.setMinutes(newHour === null ? originalStart.getMinutes() : 0)
    newStart.setSeconds(0)
    newStart.setMilliseconds(0)

    const newEnd = new Date(newStart.getTime() + duration)

    try {
      await updateCourse(courseId, {
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString()
      })
    } catch (error) {
      alert(error.message || '拖拽更新课程失败')
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student ? student.name : '未知学生'
  }

  const getHeaderText = () => {
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
      return `${format(weekStart, 'M月d日', { locale: zhCN })} - ${format(weekEnd, 'M月d日', { locale: zhCN })}`
    }
    if (view === 'day') return format(currentDate, 'yyyy年M月d日 EEE', { locale: zhCN })
    return format(currentDate, 'yyyy年M月')
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800">
                {getHeaderText()}
              </h2>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                今天
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* View Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {[
                  { key: 'day', label: '日' },
                  { key: 'week', label: '周' },
                  { key: 'month', label: '月' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      view === item.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Nav Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-auto">
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              courses={courses}
              onCourseClick={onCourseClick}
              getStudentName={getStudentName}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              courses={courses}
              onCourseClick={onCourseClick}
              getStudentName={getStudentName}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              courses={courses}
              onCourseClick={onCourseClick}
            />
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCourse && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-xl">
              {activeCourse.subject}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

// Week View
function WeekView({ currentDate, courses, onCourseClick, getStudentName }) {
  const weekStart = startOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const today = new Date()

  const coursesForWeek = courses.filter(course => {
    if (!course.startTime) return false
    const courseDate = new Date(course.startTime)
    return courseDate >= weekStart && courseDate <= weekEnd
  })

  const getCoursePosition = (course) => {
    if (!course.startTime || !course.endTime) return null
    const start = new Date(course.startTime)
    const end = new Date(course.endTime)
    const dayIndex = weekDays.findIndex(day => isSameDay(day, start))
    if (dayIndex === -1) return null
    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const endHour = end.getHours()
    const endMinute = end.getMinutes()
    const top = ((startHour - 8) * 60 + startMinute)
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute))
    return { dayIndex, top, height }
  }

  return (
    <div className="min-w-[800px]">
      <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="w-16 shrink-0" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className={`flex-1 py-3 text-center border-l border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {format(day, 'EEE', { locale: zhCN })}
              </div>
              <div className={`text-xl font-bold mt-1 ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative bg-white">
        <div className="absolute left-0 w-16 bg-white z-10">
          {HOURS.map(hour => (
            <div key={hour} className="h-[60px] flex items-start justify-end pr-3 pt-1">
              <span className="text-xs font-medium text-slate-400">{hour}:00</span>
            </div>
          ))}
        </div>

        <div className="ml-16 flex">
          {weekDays.map((day, dayIndex) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayCourses = coursesForWeek.filter(c => isSameDay(new Date(c.startTime), day))
            return (
              <div key={dayIndex} className="flex-1 border-l border-slate-100 relative" style={{ height: HOURS.length * 60 }}>
                {HOURS.map(hour => (
                  <DroppableTimeSlot
                    key={hour}
                    id={`${dateStr}|${hour}`}
                    className="absolute left-0 right-0 border-t border-slate-100 hover:bg-blue-50/60 transition-colors"
                    style={{ top: (hour - 8) * 60, height: 60 }}
                  />
                ))}
                {dayCourses.map(course => {
                  const pos = getCoursePosition(course)
                  if (!pos) return null
                  return (
                    <CourseBlock
                      key={course.id}
                      course={course}
                      studentName={getStudentName(course.studentId)}
                      style={{ top: pos.top, height: Math.max(pos.height, 30) }}
                      onClick={() => onCourseClick(course)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Day View
function DayView({ currentDate, courses, onCourseClick, getStudentName }) {
  const today = new Date()

  const dayCourses = courses
    .filter(course => {
      if (!course.startTime) return false
      return isSameDay(new Date(course.startTime), currentDate)
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  const getCoursePosition = (course) => {
    if (!course.startTime || !course.endTime) return null
    const start = new Date(course.startTime)
    const end = new Date(course.endTime)
    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const endHour = end.getHours()
    const endMinute = end.getMinutes()
    const top = ((startHour - 8) * 60 + startMinute)
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute))
    return { top, height }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Day Header */}
        <div className={`px-6 py-4 border-b border-slate-100 ${isSameDay(currentDate, today) ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSameDay(currentDate, today) ? 'bg-blue-500' : 'bg-slate-100'}`}>
              <span className={`text-lg font-bold ${isSameDay(currentDate, today) ? 'text-white' : 'text-slate-600'}`}>
                {format(currentDate, 'd')}
              </span>
            </div>
            <div>
              <div className="text-sm text-slate-500">{format(currentDate, 'EEEE', { locale: zhCN })}</div>
              <div className="text-xl font-bold text-slate-800">{format(currentDate, 'M月d日')}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-slate-500">{dayCourses.length} 节课</div>
            </div>
          </div>
        </div>

        {/* Time Grid */}
        <div className="relative" style={{ height: HOURS.length * 60 }}>
          <div className="absolute left-0 w-20 bg-slate-50 border-r border-slate-100">
            {HOURS.map(hour => (
              <div key={hour} className="h-[60px] flex items-start justify-end pr-3 pt-1">
                <span className="text-xs font-medium text-slate-400">{hour}:00</span>
              </div>
            ))}
          </div>

          <div className="ml-20 relative">
            {HOURS.map(hour => (
              <DroppableTimeSlot
                key={hour}
                id={`${format(currentDate, 'yyyy-MM-dd')}|${hour}`}
                className="absolute left-0 right-0 border-t border-slate-100 hover:bg-blue-50/60 transition-colors"
                style={{ top: (hour - 8) * 60, height: 60 }}
              />
            ))}

            {dayCourses.map(course => {
              const pos = getCoursePosition(course)
              if (!pos) return null
              return (
                <CourseBlock
                  key={course.id}
                  course={course}
                  studentName={getStudentName(course.studentId)}
                  style={{ top: pos.top, height: Math.max(pos.height, 30), left: 8, right: 8 }}
                  onClick={() => onCourseClick(course)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Month View
function MonthView({ currentDate, courses, onCourseClick }) {
  const today = new Date()
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: zhCN, weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { locale: zhCN, weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const monthCourses = courses.filter(course => {
    if (!course.startTime) return false
    const courseDate = new Date(course.startTime)
    return isWithinInterval(courseDate, { start: monthStart, end: monthEnd })
  })

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Weekday Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="flex-1 py-3 text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, today)
            const dayCourses = monthCourses.filter(c => isSameDay(new Date(c.startTime), day))

            return (
              <div
                key={i}
                className={`min-h-[100px] border-b border-r border-slate-100 p-2 ${
                  isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                } ${isToday ? 'bg-blue-50/50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayCourses.slice(0, 3).map(course => (
                    <div
                      key={course.id}
                      onClick={() => onCourseClick(course)}
                      className="text-xs px-1.5 py-1 bg-blue-500 text-white rounded truncate cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                      {course.subject}
                    </div>
                  ))}
                  {dayCourses.length > 3 && (
                    <div className="text-xs text-slate-500">+{dayCourses.length - 3} 更多</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DroppableTimeSlot({ id, className, style }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      data-date={id}
      className={`${className} ${isOver ? 'bg-blue-100/70' : ''}`}
      style={style}
    />
  )
}
