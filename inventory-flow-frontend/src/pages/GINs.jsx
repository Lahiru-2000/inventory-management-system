import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaEye, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import api from '../services/api'

const GINs = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: ginsData } = useQuery('gins', () =>
    api.get('/gins').then(res => res.data.data)
  )

  const approveMutation = useMutation(
    (id) => api.put(`/gins/${id}/status?status=CONFIRMED`),
    {
      onMutate: async (id) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('gins')
        
        // Snapshot the previous value
        const previousGins = queryClient.getQueryData('gins')
        
        // Optimistically update to the new value
        queryClient.setQueryData('gins', (old) => {
          if (!old) return old
          return old.map((gin) =>
            gin.id === id ? { ...gin, status: 'CONFIRMED' } : gin
          )
        })
        
        return { previousGins }
      },
      onError: (err, id, context) => {
        // Rollback to the previous value
        if (context?.previousGins) {
          queryClient.setQueryData('gins', context.previousGins)
        }
        alert(err.response?.data?.message || 'Failed to approve GIN')
      },
      onSuccess: () => {
        queryClient.invalidateQueries('gins')
      }
    }
  )

  const cancelMutation = useMutation(
    (id) => api.put(`/gins/${id}/status?status=CANCELLED`),
    {
      onMutate: async (id) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('gins')
        
        // Snapshot the previous value
        const previousGins = queryClient.getQueryData('gins')
        
        // Optimistically update to the new value
        queryClient.setQueryData('gins', (old) => {
          if (!old) return old
          return old.map((gin) =>
            gin.id === id ? { ...gin, status: 'CANCELLED' } : gin
          )
        })
        
        return { previousGins }
      },
      onError: (err, id, context) => {
        // Rollback to the previous value
        if (context?.previousGins) {
          queryClient.setQueryData('gins', context.previousGins)
        }
        alert(err.response?.data?.message || 'Failed to cancel GIN')
      },
      onSuccess: () => {
        queryClient.invalidateQueries('gins')
      }
    }
  )

  const handleApprove = (id, ginNumber) => {
    if (window.confirm(`Are you sure you want to approve GIN ${ginNumber}?`)) {
      approveMutation.mutate(id)
    }
  }

  const handleCancel = (id, ginNumber) => {
    if (window.confirm(`Are you sure you want to cancel GIN ${ginNumber}?`)) {
      cancelMutation.mutate(id)
    }
  }

  const gins = ginsData || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Goods Issue Notes (GINs)</h1>
        <button
          onClick={() => navigate('/gins/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create GIN
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GIN Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gins.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No GINs found. Click "Create GIN" to add one.
                </td>
              </tr>
            ) : (
              gins.map((gin) => (
                <tr key={gin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gin.ginNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gin.soNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gin.issueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gin.issuedByName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      gin.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      gin.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {gin.status || 'DRAFT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {(gin.status === 'CONFIRMED' || gin.status === 'CANCELLED') && (
                        <button
                          onClick={() => navigate(`/gins/${gin.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                          title="View GIN"
                        >
                          <FaEye size={16} />
                        </button>
                      )}
                      {gin.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => navigate(`/gins/${gin.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50"
                            title="Edit GIN"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleApprove(gin.id, gin.ginNumber)}
                            disabled={approveMutation.isLoading}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve GIN"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleCancel(gin.id, gin.ginNumber)}
                            disabled={cancelMutation.isLoading}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel GIN"
                          >
                            <FaTimes size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GINs
