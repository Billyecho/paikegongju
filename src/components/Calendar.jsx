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
  subWeeks,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useCoursesContext } from '../hooks/useCoursesContext'
import { useStudentsContext } from '../hooks/useStudentsContext'
import CourseBlock from './CourseBlock'

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8)
const HALF_HOUR_SLOTS = HOURS.flatMap((hour) => [hour, hour + 0.5])
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const STUDENT_COLORS = [
  'bg-blue-500 hover:bg-blue-600',
  'bg-indigo-500 hover:bg-indigo-600',
  'bg-violet-500 hover:bg-violet-600',
  'bg-amber-500 hover:bg-amber-600',
  'bg-rose-500 hover:bg-rose-600',
  'bg-cyan-500 hover:bg-cyan-600',
]

function formatTimeRange(course) {
  if (!course?.startTime || !course?.endTime) return ''

  const start = new Date(course.startTime)
  const end = new Date(course.endTime)
  const startLabel = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  const endLabel = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`

  return `${startLabel} - ${endLabel}`
}

function getStudentColorClass(course, studentName) {
  if (course.status === 'completed') {
    return 'bg-emerald-500 hover:bg-emerald-600'
  }

  const seed = course.studentId || studentName || course.subject || ''
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return STUDENT_COLORS[hash % STUDENT_COLORS.length]
}

function formatSlotLabel(slot) {
  const hour = Math.floor(slot)
  const minute = slot % 1 === 0.5 ? '30' : '00'
  return `${hour}:${minute}`
}

function getSlotOffset(slot, hourHeight) {
  return (slot - 8) * hourHeight
}

export default function Calendar({
  onCourseClick,
  view,
  currentDate,
  onViewChange,
  onCurrentDateChange,
}) {
  const [activeCourse, setActiveCourse] = useState(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const { courses, updateCourse } = useCoursesContext()
  const { students } = useStudentsContext()

  const hourHeight = isMobile ? 38 : 60
  const halfHourHeight = hourHeight / 2

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
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 14 },
    })
  )

  const handlePrev = () => {
    if (view === 'week') onCurrentDateChange(subWeeks(currentDate, 1))
    else if (view === 'day') onCurrentDateChange(addDays(currentDate, -1))
    else onCurrentDateChange(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    if (view === 'week') onCurrentDateChange(addWeeks(currentDate, 1))
    else if (view === 'day') onCurrentDateChange(addDays(currentDate, 1))
    else onCurrentDateChange(addMonths(currentDate, 1))
  }

  const handleToday = () => onCurrentDateChange(new Date())

  const handleDragStart = (event) => {
    const course = courses.find((item) => item.id === event.active.id)
    setActiveCourse(course || null)
  }

  const handleDragEnd = async (event) => {
    setActiveCourse(null)
    if (!event.over) return

    const course = courses.find((item) => item.id === event.active.id)
    if (!course) return

    const [newDateStr, newSlotStr] = String(event.over.id).split('|')
    const [year, month, day] = newDateStr.split('-').map(Number)
    const originalStart = new Date(course.startTime)
    const originalEnd = new Date(course.endTime)
    const duration = originalEnd.getTime() - originalStart.getTime()
    const nextStart = new Date(year, month - 1, day)

    if (newSlotStr !== undefined) {
      const slot = Number(newSlotStr)
      const nextHour = Math.floor(slot)
      const nextMinute = slot % 1 === 0.5 ? 30 : 0
      nextStart.setHours(nextHour, nextMinute, 0, 0)
    } else {
      nextStart.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0)
    }

    const nextEnd = new Date(nextStart.getTime() + duration)

    try {
      await updateCourse(course.id, {
        startTime: nextStart.toISOString(),
        endTime: nextEnd.toISOString(),
      })
      onCurrentDateChange(nextStart)
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

  const overlayStudentName = activeCourse ? getStudentName(activeCourse.studentId) : ''

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{getHeaderText()}</h2>
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
                  { key: 'month', label: '月' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onViewChange(item.key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                      view === item.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
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
              halfHourHeight={halfHourHeight}
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
              halfHourHeight={halfHourHeight}
              isMobile={isMobile}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              courses={courses}
              onCourseClick={onCourseClick}
              getStudentName={getStudentName}
            />
          )}
        </div>

        <DragOverlay>
          {activeCourse && (
            <div
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white shadow-xl ${
                activeCourse.status === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}
            >
              <div className="truncate">{overlayStudentName}</div>
              <div className="mt-0.5 text-xs opacity-90">{formatTimeRange(activeCourse)}</div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

function WeekView({ currentDate, courses, onCourseClick, getStudentName, hourHeight, halfHourHeight, isMobile }) {
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

    const top = getSlotOffset(start.getHours() + start.getMinutes() / 60, hourHeight)
    const height = (end.getTime() - start.getTime()) / (1000 * 60 * 60) * hourHeight

    return { dayIndex, top, height }
  }

  return (
    <div className={isMobile ? 'min-w-0' : 'min-w-[680px] md:min-w-[800px]'}>
      <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-white shadow-sm">
        <div className={`${isMobile ? 'w-14' : 'w-20'} shrink-0`} />
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today)

          return (
            <div
              key={index}
              className={`min-w-0 flex-1 border-l border-slate-100 text-center ${isMobile ? 'py-2' : 'py-3'} ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`${isMobile ? 'text-[11px]' : 'text-xs'} font-medium tracking-wide text-slate-500`}>
                {format(day, 'EEE', { locale: zhCN })}
              </div>
              <div
                className={`${isMobile ? 'mt-0.5 text-lg' : 'mt-1 text-xl'} font-bold ${
                  isToday ? 'text-blue-600' : 'text-slate-800'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative bg-white">
        <div className={`absolute left-0 z-10 ${isMobile ? 'w-14' : 'w-20'} bg-white`}>
          {HALF_HOUR_SLOTS.map((slot) => (
            <div
              key={slot}
              className={`flex items-start justify-end ${isMobile ? 'pr-2' : 'pr-3'} pt-1`}
              style={{ height: halfHourHeight }}
            >
              <span className={`${isMobile ? 'text-[11px]' : 'text-xs'} font-semibold text-slate-500`}>
                {formatSlotLabel(slot)}
              </span>
            </div>
          ))}
        </div>

        <div className={`flex ${isMobile ? 'ml-14' : 'ml-20'}`}>
          {weekDays.map((day, dayIndex) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayCourses = coursesForWeek.filter((course) => isSameDay(new Date(course.startTime), day))

            return (
              <div
                key={dayIndex}
                className="relative flex-1 border-l border-slate-100"
                style={{ height: HOURS.length * hourHeight }}
              >
                {HALF_HOUR_SLOTS.map((slot) => (
                  <DroppableTimeSlot
                    key={slot}
                    id={`${dateStr}|${slot}`}
                    className={`absolute left-0 right-0 transition-colors hover:bg-blue-50/60 ${
                      slot % 1 === 0 ? 'border-t border-slate-100' : 'border-t border-slate-100/70'
                    }`}
                    style={{ top: getSlotOffset(slot, hourHeight), height: halfHourHeight }}
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
                        right: isMobile ? 2 : 4,
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

function DayView({ currentDate, courses, onCourseClick, getStudentName, hourHeight, halfHourHeight, isMobile }) {
  const today = new Date()

  const dayCourses = courses
    .filter((course) => course.startTime && isSameDay(new Date(course.startTime), currentDate))
    .sort((left, right) => new Date(left.startTime) - new Date(right.startTime))

  const getCoursePosition = (course) => {
    if (!course.startTime || !course.endTime) return null

    const start = new Date(course.startTime)
    const end = new Date(course.endTime)
    const top = getSlotOffset(start.getHours() + start.getMinutes() / 60, hourHeight)
    const height = (end.getTime() - start.getTime()) / (1000 * 60 * 60) * hourHeight

    return { top, height }
  }

  return (
    <div className="mx-auto max-w-4xl p-2 sm:p-4">
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm sm:rounded-2xl">
        <div className={`border-b border-slate-100 px-3 py-3 sm:px-6 sm:py-4 ${isSameDay(currentDate, today) ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl ${
                isSameDay(currentDate, today) ? 'bg-blue-500' : 'bg-slate-100'
              }`}
            >
              <span
                className={`text-base font-bold sm:text-lg ${
                  isSameDay(currentDate, today) ? 'text-white' : 'text-slate-600'
                }`}
              >
                {format(currentDate, 'd')}
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500 sm:text-sm">{format(currentDate, 'EEEE', { locale: zhCN })}</div>
              <div className="text-base font-bold text-slate-800 sm:text-xl">
                {format(currentDate, 'M月d日', { locale: zhCN })}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-slate-500 sm:text-sm">{dayCourses.length} 节课</div>
            </div>
          </div>
        </div>

        <div className="relative" style={{ height: HOURS.length * hourHeight }}>
          <div className="absolute left-0 w-16 border-r border-slate-100 bg-slate-50 sm:w-24">
            {HALF_HOUR_SLOTS.map((slot) => (
              <div key={slot} className="flex items-start justify-end pr-3 pt-1" style={{ height: halfHourHeight }}>
                <span className="text-xs font-semibold text-slate-500">{formatSlotLabel(slot)}</span>
              </div>
            ))}
          </div>

          <div className="relative ml-16 sm:ml-24">
            {HALF_HOUR_SLOTS.map((slot) => (
              <DroppableTimeSlot
                key={slot}
                id={`${format(currentDate, 'yyyy-MM-dd')}|${slot}`}
                className={`absolute left-0 right-0 transition-colors hover:bg-blue-50/60 ${
                  slot % 1 === 0 ? 'border-t border-slate-100' : 'border-t border-slate-100/70'
                }`}
                style={{ top: getSlotOffset(slot, hourHeight), height: halfHourHeight }}
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

function MonthView({ currentDate, courses, onCourseClick, getStudentName }) {
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
                <div
                  className={`mb-1 text-sm font-medium ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayCourses.slice(0, 3).map((course) => {
                    const studentName = getStudentName(course.studentId)

                    return (
                      <div
                        key={course.id}
                        onClick={() => onCourseClick(course)}
                        className={`cursor-pointer truncate rounded px-1 py-1 text-[10px] text-white transition-colors sm:px-1.5 sm:text-xs ${getStudentColorClass(
                          course,
                          studentName
                        )}`}
                      >
                        {studentName}
                      </div>
                    )
                  })}
                  {dayCourses.length > 3 && <div className="text-xs text-slate-500">+{dayCourses.length - 3} 更多</div>}
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

  return <div ref={setNodeRef} data-date={id} className={`${className} ${isOver ? 'bg-blue-100/70' : ''}`} style={style} />
}
