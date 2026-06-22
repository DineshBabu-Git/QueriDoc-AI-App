import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { documentService } from '../services'
import { UploadForm } from '../components/UploadForm'
import { DocumentCard } from '../components/DocumentCard'
import { LoadingSpinner, ErrorMessage, SuccessMessage, EmptyState } from '../components/UI'
import { FileText, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [renaming, setRenaming] = useState(null)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('[GET DOCS] Fetching documents...')

      const response = await documentService.getUserDocuments()
      console.log('[GET DOCS] Success:', response.data)

      setDocuments(response.data.documents)
    } catch (err) {
      console.error('[GET DOCS] Error:', err.message)
      console.error('[GET DOCS] Response:', err.response?.data)

      let errorMessage = 'Failed to fetch documents'
      if (err.response?.status === 401) {
        errorMessage = 'Session expired - Please log in again'
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error - Please check your connection'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (data) => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', data.file[0])
      formData.append('title', data.title)

      console.log('[UPLOAD] Starting upload:', { title: data.title, fileSize: data.file[0].size, fileType: data.file[0].type })

      const response = await documentService.uploadDocument(formData)
      console.log('[UPLOAD] Success:', response.data)

      setDocuments([response.data.document, ...documents])
      setSuccess('Document uploaded successfully')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      console.error('[UPLOAD] Error:', err.message)
      console.error('[UPLOAD] Response:', err.response?.data)

      let errorMessage = 'Upload failed'
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error - Please check your connection and try again'
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout - Try with a smaller file'
      }

      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      setError(null)
      await documentService.deleteDocument(docId)
      setDocuments(documents.filter(doc => doc._id !== docId))
      setSuccess('Document deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to delete document')
    }
  }

  const handleRenameDocument = async (docId, currentTitle) => {
    setRenaming(docId)
    setNewTitle(currentTitle)
  }

  const saveRename = async (docId) => {
    if (!newTitle.trim() || newTitle === documents.find(d => d._id === docId)?.title) {
      setRenaming(null)
      return
    }

    try {
      setError(null)
      await documentService.updateDocument(docId, { title: newTitle })
      setDocuments(documents.map(doc =>
        doc._id === docId ? { ...doc, title: newTitle } : doc
      ))
      setSuccess('Document renamed successfully')
      setTimeout(() => setSuccess(null), 3000)
      setRenaming(null)
    } catch (err) {
      setError('Failed to rename document')
    }
  }

  const handleChatClick = (docId) => {
    navigate(`/chat/${docId}`)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Messages */}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* Upload Section */}
        <div className="md:col-span-1">
          <UploadForm onSubmit={handleUpload} loading={uploading} />
        </div>

        {/* Documents Section */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Documents ({documents.length})
            </h2>
          </div>

          {documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents yet"
              description="Upload your first document to get started"
            />
          ) : (
            <div className="grid gap-4">
              {documents.map(doc => (
                <div key={doc._id}>
                  {renaming === doc._id ? (
                    <div className="card flex items-center gap-2">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="input-field flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(doc._id)}
                        className="btn-primary"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setRenaming(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <DocumentCard
                      document={doc}
                      onChat={handleChatClick}
                      onDelete={handleDeleteDocument}
                      onRename={handleRenameDocument}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
