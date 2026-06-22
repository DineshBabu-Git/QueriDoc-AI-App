import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'

export const UploadForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const file = watch('file')

  // Must await onSubmit so the upload completes before the form resets.
  // Previously reset() fired immediately (sync), clearing the file input
  // while the multipart request was still in flight.
  const onSubmitForm = async (data) => {
    try {
      await onSubmit(data)
    } finally {
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Document</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Title
        </label>
        <input
          type="text"
          placeholder="e.g., My Research Paper"
          className="input-field"
          disabled={loading}
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <span className="error-text">{errors.title.message}</span>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select File (PDF, DOCX, TXT, MD)
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            id="file-input"
            disabled={loading}
            {...register('file', { required: 'Please select a file' })}
          />
          <label
            htmlFor="file-input"
            className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition
              ${loading
                ? 'border-gray-200 cursor-not-allowed opacity-60'
                : 'border-blue-300 cursor-pointer hover:border-blue-500'
              }`}
          >
            <Upload className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-gray-600">
              {loading
                ? 'Uploading — please wait…'
                : file?.[0]?.name || 'Click to select file'}
            </span>
          </label>
        </div>
        {errors.file && <span className="error-text">{errors.file.message}</span>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  )
}
