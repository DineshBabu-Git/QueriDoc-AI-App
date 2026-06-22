export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
)

export const ErrorMessage = ({ message, onDismiss }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
    <span>{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="text-red-700 hover:text-red-900">
        ✕
      </button>
    )}
  </div>
)

export const SuccessMessage = ({ message, onDismiss }) => (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex justify-between items-center">
    <span>{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="text-green-700 hover:text-green-900">
        ✕
      </button>
    )}
  </div>
)

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12">
    {Icon && <Icon className="w-16 h-16 mx-auto text-gray-400 mb-4" />}
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-gray-500 mt-2">{description}</p>
  </div>
)
