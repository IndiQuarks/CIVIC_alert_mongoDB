const STATUS_MAP = {
  pending:     { label: 'Pending',     bg: 'bg-yellow-100',  text: 'text-yellow-800' },
  assigned:    { label: 'Assigned',    bg: 'bg-blue-100',    text: 'text-blue-800'   },
  in_progress: { label: 'In Progress', bg: 'bg-orange-100',  text: 'text-orange-800' },
  resolved:    { label: 'Resolved',    bg: 'bg-green-100',   text: 'text-green-800'  },
  rejected:    { label: 'Rejected',    bg: 'bg-red-100',     text: 'text-red-800'    },
  disputed:    { label: 'Disputed',    bg: 'bg-purple-100',  text: 'text-purple-800' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const s = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700' }
  const sz = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${s.bg} ${s.text} ${sz}`}>
      {s.label}
    </span>
  )
}
