import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { documentService, chatService } from '../services'
import { ChatWindow } from '../components/ChatWindow'
import { LoadingSpinner, ErrorMessage } from '../components/UI'

export default function Chat() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const [docData, setDocData] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDocumentAndMessages()
  }, [documentId])

  const fetchDocumentAndMessages = async () => {
    try {
      setInitialLoading(true)
      setError(null)

      // Fetch document
      const docResponse = await documentService.getDocument(documentId)
      setDocData(docResponse.data.document)

      // Fetch chat history
      const chatResponse = await chatService.getChatHistory(documentId)
      setMessages(chatResponse.data.messages)
    } catch (err) {
      setError('Failed to load document')
      console.error(err)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSendMessage = async (message) => {
    try {
      setLoading(true)
      setError(null)

      const response = await chatService.sendMessage({
        documentId,
        message,
      })

      // Add messages to list
      setMessages([
        ...messages,
        { role: 'user', content: response.data.chat.userMessage },
        { role: 'assistant', content: response.data.chat.assistantMessage },
      ])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner message="Loading chat..." />
      </div>
    )
  }

  if (!docData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message="Document not found" />
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary mt-4"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-70px)]">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
        documentTitle={docData.title}
      />
    </div>
  )
}
