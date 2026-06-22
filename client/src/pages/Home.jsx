import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FileText, MessageSquare, Zap, ArrowRight } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <FileText className="w-10 h-10 text-white" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">QueriDoc AI</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Intelligent Multi-Document Chat Platform powered by AI. Upload your documents and chat with them using Retrieval-Augmented Generation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 rounded-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-blue-600 transition"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 text-white">
            <FileText className="w-12 h-12 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multiple Formats</h3>
            <p className="text-blue-100">
              Support for PDF, DOCX, TXT, and Markdown files.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 text-white">
            <MessageSquare className="w-12 h-12 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat Interface</h3>
            <p className="text-blue-100">
              Intuitive chat to ask questions and get instant answers.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 text-white">
            <Zap className="w-12 h-12 text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Powered</h3>
            <p className="text-blue-100">
              Built with Google Gemini AI for intelligent responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
