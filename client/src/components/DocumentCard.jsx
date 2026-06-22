import { FileText, Trash2, MessageSquare, Edit2 } from 'lucide-react'
import { formatDate, formatFileSize } from '../utils/helpers'

export const DocumentCard = ({ document, onChat, onDelete, onRename }) => {
  return (
    <div className="card flex flex-col border border-gray-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-800">{document.title}</h3>
            <p className="text-sm text-gray-500">{document.fileType.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Created: {formatDate(document.createdAt)}</p>
      </div>

      <div className="flex items-center space-x-2 mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={() => onChat(document._id)}
          className="flex-1 flex items-center justify-center space-x-1 btn-primary text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onRename(document._id, document.title)}
          className="btn-secondary p-2"
          title="Rename"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(document._id)}
          className="btn-secondary p-2 text-red-600 hover:text-red-700"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
