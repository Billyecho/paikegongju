import { useDraggable } from '@dnd-kit/core'

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
  const colors = [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600'
  ]
  const colorIndex = course.subject ? course.subject.charCodeAt(0) % colors.length : 0
  const gradientClass = isCompleted ? 'from-emerald-500 to-teal-600' : colors[colorIndex]

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`absolute bg-gradient-to-br ${gradientClass} text-white rounded-lg shadow-sm transition-all overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing hover:shadow-md ${
        compact ? 'px-2 py-1' : 'px-2.5 py-1.5'
      }`}
      style={dragStyle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`font-medium truncate leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>{course.subject}</div>
        {isCompleted && (
          <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
            完成
          </span>
        )}
      </div>
      <div className={`truncate opacity-85 ${compact ? 'mt-0 text-[11px]' : 'mt-0.5 text-xs'}`}>{studentName}</div>
      {!compact && course.notes && (
        <div className="text-xs opacity-70 truncate mt-0.5 leading-tight">{course.notes}</div>
      )}
    </div>
  )
}
