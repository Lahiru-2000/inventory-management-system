import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaEye, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import api from '../services/api'

const SalesOrders = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: sosData } = useQuery('sales-orders', () =>
    api.get('/sales-orders').then(res => res.data.data)
  )

  const approveMutation = useMutation(
    (id) => api.put(`/sales-orders/${id}/status?status=CONFIRMED`),
    {
      onMutate: async (id) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('sales-orders')
        
        // Snapshot the previous value
        const previousSOs = queryClient.getQueryData('sales-orders')
        
        // Optimistically update to the new value
        queryClient.setQueryData('sales-orders', (old) => {
          if (!old) return old
          return old.map((so) =>
            so.id === id ? { ...so, status: 'CONFIRMED' } : so
          )
        })
        
        return { previousSOs }
      },
      onError: (err, id, context) => {
        // Rollback to the previous value
        if (context?.previousSOs) {
          queryClient.setQueryData('sales-orders', context.previousSOs)
        }
        alert(err.response?.data?.message || 'Failed to approve sales order')
      },
      onSuccess: () => {
        queryClient.invalidateQueries('sales-orders')
      }
    }
  )

  const cancelMutation = useMutation(
    (id) => api.put(`/sales-orders/${id}/status?status=CANCELLED`),
    {
      onMutate: async (id) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('sales-orders')
        
        // Snapshot the previous value
        const previousSOs = queryClient.getQueryData('sales-orders')
        
        // Optimistically update to the new value
        queryClient.setQueryData('sales-orders', (old) => {
          if (!old) return old
          return old.map((so) =>
            so.id === id ? { ...so, status: 'CANCELLED' } : so
          )
        })
        
        return { previousSOs }
      },
      onError: (err, id, context) => {
        // Rollback to the previous value
        if (context?.previousSOs) {
          queryClient.setQueryData('sales-orders', context.previousSOs)
        }
        alert(err.response?.data?.message || 'Failed to cancel sales order')
      },
      onSuccess: () => {
        queryClient.invalidateQueries('sales-orders')
      }
    }
  )

  const handleApprove = (id, soNumber) => {
    if (window.confirm(`Are you sure you want to approve sales order ${soNumber}?`)) {
      approveMutation.mutate(id)
    }
  }

  const handleCancel = (id, soNumber) => {
    if (window.confirm(`Are you sure you want to cancel sales order ${soNumber}?`)) {
      cancelMutation.mutate(id)
    }
  }

  const sos = sosData || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
        <button
          onClick={() => navigate('/sales-orders/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create SO
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No sales orders found. Click "Create SO" to add one.
                </td>
              </tr>
            ) : (
              sos.map((so) => (
                <tr key={so.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{so.soNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{so.customerName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{so.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rs. {parseFloat(so.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      so.status === 'INVOICED' ? 'bg-green-100 text-green-800' :
                      so.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      so.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {so.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {(so.status === 'CONFIRMED' || so.status === 'CANCELLED' || so.status === 'INVOICED') && (
                        <button
                          onClick={() => navigate(`/sales-orders/${so.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                          title="View Sales Order"
                        >
                          <FaEye size={16} />
                        </button>
                      )}
                      {so.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => navigate(`/sales-orders/${so.id}/edit`)}
                            className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded hover:bg-yellow-50"
                            title="Edit Sales Order"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleApprove(so.id, so.soNumber)}
                            disabled={approveMutation.isLoading}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Sales Order"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleCancel(so.id, so.soNumber)}
                            disabled={cancelMutation.isLoading}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel Sales Order"
                          >
                            <FaTimes size={16} />
                          </button>
                        </>
                      )}
                      {(so.status === 'CONFIRMED' || so.status === 'INVOICED') && (
                        <button
                          onClick={() => handleCancel(so.id, so.soNumber)}
                          disabled={cancelMutation.isLoading}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Cancel Sales Order"
                        >
                          <FaTimes size={16} />
                        </button>
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

export default SalesOrders
