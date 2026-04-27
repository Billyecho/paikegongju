import { useEffect, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { useCoursesContext } from '../hooks/useCoursesContext'
import { useStudentsContext } from '../hooks/useStudentsContext'
import CourseBlock from './CourseBlock'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8)
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Calendar({ onCourseClick }) {
  const [view, setView] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week'))
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeCourse, setActiveCourse] = useState(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const { courses, updateCourse } = useCoursesContext()
  const { students } = useStudentsContext()

  const hourHeight = isMobile ? 38 : 60

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 14 }
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
    const course = courses.find((item) => item.id === event.active.id)
    setActiveCourse(course || null)
  }

  const handleDragEnd = async (event) => {
    setActiveCourse(null)
    if (!event.over) return

    const course = courses.find((item) => item.id === event.active.id)
    if (!course) return

    const [newDateStr, newHourStr] = String(event.over.id).split('|')
    const [year, month, day] = newDateStr.split('-').map(Number)
    const originalStart = new Date(course.startTime)
    const originalEnd = new Date(course.endTime)
    const duration = originalEnd.getTime() - originalStart.getTime()
    const nextStart = new Date(year, month - 1, day)

    if (newHourStr !== undefined) {
      nextStart.setHours(Number(newHourStr), 0, 0, 0)
    } else {
      nextStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0)
    }

    const nextEnd = new Date(nextStart.getTime() + duration)

    try {
      await updateCourse(course.id, {
        startTime: nextStart.toISOString(),
        endTime: nextEnd.toISOString()
      })
    } catch (error) {
      alert(error.message || '拖动更新课程失败')
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find((item) => item.id === studentId)
    return student ? student.name : '未知学生'
  }

  const getHeaderText = () => {
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
      return `${format(weekStart, 'M月d日', { locale: zhCN })} - ${format(weekEnd, 'M月d日', { locale: zhCN })}`
    }

    if (view === 'day') {
      return format(currentDate, 'yyyy年M月d日 EEEE', { locale: zhCN })
    }

    return format(currentDate, 'yyyy年M月', { locale: zhCN })
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                {getHeaderText()}
              </h2>
              <button
                onClick={handleToday}
                className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
              >
                今天
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {[
                  { key: 'day', label: '日' },
                  { key: 'week', label: '周' },
                  { key: 'month', label: '月' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      view === item.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  onClick={handlePrev}
                  className="rounded-md p-2 text-slate-600 transition-all hover:bg-white hover:shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-md p-2 text-slate-600 transition-all hover:bg-white hover:shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              courses={courses}
              onCourseClick={onCourseClick}
              getStudentName={getStudentName}
              hourHeight={hourHeight}
              isMobile={isMobile}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              courses={courses}
              onCourseClick={onCourseClick}
              getStudentName={getStudentName}
              hourHeight={hourHeight}
              isMobile={isMobile}
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

        <DragOverlay>
          {activeCourse && (
            <div className={`rounded-lg px-3 py-2 text-sm font-medium text-white shadow-xl ${
              activeCourse.status === 'completed'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}>
              {activeCourse.subject}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

function WeekView({ currentDate, courses, onCourseClick, getStudentName, hourHeight, isMobile }) {
  const weekStart = startOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { locale: zhCN, weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const today = new Date()

  const coursesForWeek = courses.filter((course) => {
    if (!course.startTime) return false
    const courseDate = new Date(course.startTime)
    return courseDate >= weekStart && courseDate <= weekEnd
  })

  const getCoursePosition = (course) => {
    if (!course.startTime || !course.endTime) return null

    const start = new Date(course.startTime)
    const end = new Date(course.endTime)
    const dayIndex = weekDays.findIndex((day) => isSameDay(day, start))

    if (dayIndex === -1) return null

    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const endHour = end.getHours()
    const endMinute = end.getMinutes()
    const top = (startHour - 8) * hourHeight + (startMinute / 60) * hourHeight
    const height = (endHour - startHour) * hourHeight + ((endMinute - startMinute) / 60) * hourHeight

    return { dayIndex, top, height }
  }

  return (
    <div className={isMobile ? 'min-w-0' : 'min-w-[680px] md:min-w-[800px]'}>
      <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white shadow-sm">
        <div className={`${isMobile ? 'w-12' : 'w-16'} shrink-0`} />
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today)

          return (
            <div
              key={index}
              className={`min-w-0 flex-1 border-l border-slate-100 ${isMobile ? 'py-2' : 'py-3'} text-center ${isToday ? 'bg-blue-50' : ''}`}
            >
              <div className={`${isMobile ? 'text-[11px]' : 'text-xs'} font-medium tracking-wide text-slate-500`}>
                {format(day, 'EEE', { locale: zhCN })}
              </div>
              <div className={`${isMobile ? 'mt-0.5 text-lg' : 'mt-1 text-xl'} font-bold ${isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative bg-white">
        <div className={`absolute left-0 z-10 ${isMobile ? 'w-12' : 'w-16'} bg-white`}>
          {HOURS.map((hour) => (
            <div key={hour} className={`flex items-start justify-end ${isMobile ? 'pr-2' : 'pr-3'} pt-1`} style={{ height: hourHeight }}>
              <span className={`${isMobile ? 'text-[11px]' : 'text-xs'} font-medium text-slate-400`}>{hour}:00</span>
            </div>
          ))}
        </div>

        <div className={`flex ${isMobile ? 'ml-12' : 'ml-16'}`}>
          {weekDays.map((day, dayIndex) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayCourses = coursesForWeek.filter((course) => isSameDay(new Date(course.startTime), day))

            return (
              <div
                key={dayIndex}
                className="relative flex-1 border-l border-slate-100"
                style={{ height: HOURS.length * hourHeight }}
              >
                {HOURS.map((hour) => (
                  <DroppableTimeSlot
                    key={hour}
                    id={`${dateStr}|${hour}`}
                    className="absolute left-0 right-0 border-t border-slate-100 transition-colors hover:bg-blue-50/60"
                    style={{ top: (hour - 8) * hourHeight, height: hourHeight }}
                  />
                ))}

                {dayCourses.map((course) => {
                  const pos = getCoursePosition(course)
                  if (!pos) return null

                  return (
                    <CourseBlock
                      key={course.id}
                      compact={isMobile}
                      course={course}
                      studentName={getStudentName(course.studentId)}
                      style={{
                        top: pos.top,
                        height: Math.max(pos.height, isMobile ? 26 : 30),
                        left: isMobile ? 2 : 4,
                        right: isMobile ? 2 : 4
                      }}
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

function DayView({ currentDate, courses, onCourseClick, getStudentName, hourHeight, isMobile }) {
  const today = new Date()

  const dayCourses = courses
    .filter((course) => course.startTime && isSameDay(new Date(course.startTime), currentDate))
    .sort((left, right) => new Date(left.startTime) - new Date(right.startTime))

  const getCoursePosition = (course) => {
    if (!course.startTime || !course.endTime) return null

    const start = new Date(course.startTime)
    const end = new Date(course.endTime)
    const startHour = start.getHours()
    const startMinute = start.getMinutes()
    const endHour = end.getHours()
    const endMinute = end.getMinutes()
    const top = (startHour - 8) * hourHeight + (startMinute / 60) * hourHeight
    const height = (endHour - startHour) * hourHeight + ((endMinute - startMinute) / 60) * hourHeight

    return { top, height }
  }

  return (
    <div className="mx-auto max-w-4xl p-2 sm:p-4">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm sm:rounded-2xl">
        <div className={`border-b border-slate-100 px-3 py-3 sm:px-6 sm:py-4 ${isSameDay(currentDate, today) ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl ${
              isSameDay(currentDate, today) ? 'bg-blue-500' : 'bg-slate-100'
            }`}>
              <span className={`text-base font-bold sm:text-lg ${isSameDay(currentDate, today) ? 'text-white' : 'text-slate-600'}`}>
                {format(currentDate, 'd')}
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500 sm:text-sm">{format(currentDate, 'EEEE', { locale: zhCN })}</div>
              <div className="text-base font-bold text-slate-800 sm:text-xl">{format(currentDate, 'M月d日', { locale: zhCN })}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-slate-500 sm:text-sm">{dayCourses.length} 节课</div>
            </div>
          </div>
        </div>

        <div className="relative" style={{ height: HOURS.length * hourHeight }}>
          <div className="absolute left-0 w-14 border-r border-slate-100 bg-slate-50 sm:w-20">
            {HOURS.map((hour) => (
              <div key={hour} className="flex items-start justify-end pr-3 pt-1" style={{ height: hourHeight }}>
                <span className="text-xs font-medium text-slate-400">{hour}:00</span>
              </div>
            ))}
          </div>

          <div className="relative ml-14 sm:ml-20">
            {HOURS.map((hour) => (
              <DroppableTimeSlot
                key={hour}
                id={`${format(currentDate, 'yyyy-MM-dd')}|${hour}`}
                className="absolute left-0 right-0 border-t border-slate-100 transition-colors hover:bg-blue-50/60"
                style={{ top: (hour - 8) * hourHeight, height: hourHeight }}
              />
            ))}

            {dayCourses.map((course) => {
              const pos = getCoursePosition(course)
              if (!pos) return null

              return (
                <CourseBlock
                  key={course.id}
                  compact={isMobile}
                  course={course}
                  studentName={getStudentName(course.studentId)}
                  style={{ top: pos.top, height: Math.max(pos.height, isMobile ? 26 : 30), left: 8, right: 8 }}
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

function MonthView({ currentDate, courses, onCourseClick }) {
  const today = new Date()
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { locale: zhCN, weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { locale: zhCN, weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const monthCourses = courses.filter((course) => {
    if (!course.startTime) return false
    return isWithinInterval(new Date(course.startTime), { start: monthStart, end: monthEnd })
  })

  return (
    <div className="mx-auto max-w-6xl p-2 sm:p-4">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm sm:rounded-2xl">
        <div className="flex border-b border-slate-100 bg-slate-50">
          {WEEKDAYS.map((day) => (
            <div key={day} className="flex-1 py-2 text-center text-xs font-medium text-slate-500 sm:py-3 sm:text-sm">
              周{day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, today)
            const dayCourses = monthCourses.filter((course) => isSameDay(new Date(course.startTime), day))

            return (
              <div
                key={index}
                className={`min-h-[100px] border-b border-r border-slate-100 p-2 ${
                  isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                } ${isToday ? 'bg-blue-50/50' : ''}`}
              >
                <div className={`mb-1 text-sm font-medium ${
                  isToday ? 'text-blue-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayCourses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      onClick={() => onCourseClick(course)}
                      className={`cursor-pointer truncate rounded px-1 py-1 text-[10px] text-white transition-colors sm:px-1.5 sm:text-xs ${
                        course.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
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
