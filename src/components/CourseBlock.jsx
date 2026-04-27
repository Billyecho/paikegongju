import { useDraggable } from '@dnd-kit/core'

export default function CourseBlock({ course, studentName, style, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: course.id
  })

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        ...style
      }
    : style

  // Color based on subject or random
  const colors = [
    'from-blue-500 to-blue-600',
    'from-indigo-500 to-indigo-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600'
  ]
  const colorIndex = course.subject ? course.subject.charCodeAt(0) % colors.length : 0

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`absolute left-1 right-1 bg-gradient-to-br ${colors[colorIndex]} text-white px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all overflow-hidden`}
      style={dragStyle}
    >
      <div className="font-medium text-sm truncate leading-tight">{course.subject}</div>
      <div className="text-xs opacity-85 truncate mt-0.5">{studentName}</div>
      {course.notes && (
        <div className="text-xs opacity-70 truncate mt-0.5 leading-tight">{course.notes}</div>
      )}
    </div>
  )
}
