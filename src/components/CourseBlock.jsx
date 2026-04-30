import { useDraggable } from '@dnd-kit/core'

const studentColors = [
  'from-blue-500 to-blue-600',
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
]

function formatCourseTimeRange(course) {
  if (!course?.startTime || !course?.endTime) return ''

  const start = new Date(course.startTime)
  const end = new Date(course.endTime)
  const startLabel = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  const endLabel = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`

  return `${startLabel} - ${endLabel}`
}

function getStudentGradientClass(course, studentName) {
  if (course.status === 'completed') {
    return 'from-emerald-500 to-teal-600'
  }

  const seed = course.studentId || studentName || course.subject || ''
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return studentColors[hash % studentColors.length]
}

export default function CourseBlock({ course, studentName, style, onClick, compact = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: course.id
  })

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 30,
        willChange: 'transform',
        ...style
      }
    : style

  const isCompleted = course.status === 'completed'
  const gradientClass = getStudentGradientClass(course, studentName)
  const timeRange = formatCourseTimeRange(course)

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`absolute cursor-grab select-none overflow-hidden rounded-lg bg-gradient-to-br text-white shadow-sm transition-all hover:shadow-md active:cursor-grabbing touch-none ${
        compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
      } ${gradientClass}`}
      style={dragStyle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`truncate font-medium leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>{studentName}</div>
        {isCompleted && (
          <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
            完成
          </span>
        )}
      </div>
      <div className={`truncate opacity-85 ${compact ? 'mt-0 text-[11px]' : 'mt-0.5 text-xs'}`}>{timeRange}</div>
    </div>
  )
}
