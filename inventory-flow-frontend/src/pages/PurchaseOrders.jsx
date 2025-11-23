import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaEye, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import Swal from 'sweetalert2'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const PurchaseOrders = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: posData } = useQuery('purchase-orders', () =>
    api.get('/purchase-orders').then(res => res.data.data)
  )

  const approveMutation = useMutation(
    (id) => api.post(`/purchase-orders/${id}/approve?approvedById=${user?.id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('purchase-orders')
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Purchase Order approved successfully!',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: true
        })
      },
      onError: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to approve Purchase Order',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  )

  const rejectMutation = useMutation(
    (id) => api.post(`/purchase-orders/${id}/reject?rejectedById=${user?.id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('purchase-orders')
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Purchase Order rejected successfully!',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: true
        })
      },
      onError: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to reject Purchase Order',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  )

  const pos = posData || []

  const handleApprove = (id) => {
    if (!user?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'User not found. Please login again.',
        confirmButtonColor: '#ef4444'
      })
      return
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this Purchase Order?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        approveMutation.mutate(id)
      }
    })
  }

  const handleReject = (id) => {
    if (!user?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'User not found. Please login again.',
        confirmButtonColor: '#ef4444'
      })
      return
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject/cancel this Purchase Order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        rejectMutation.mutate(id)
      }
    })
  }

  const canEdit = (status) => {
    return status === 'DRAFT' || status === 'PENDING_APPROVAL'
  }

  const isViewOnly = (status) => {
    return status === 'APPROVED' || status === 'REJECTED'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <button
          onClick={() => navigate('/purchase-orders/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create PO
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pos.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No purchase orders found. Click "Create PO" to add one.
                </td>
              </tr>
            ) : (
              pos.map((po) => (
                <tr key={po.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      po.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      po.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      po.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {isViewOnly(po.status) ? (
                        <button
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                          title="View Purchase Order"
                        >
                          <FaEye size={16} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/purchase-orders/${po.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                            title="Edit Purchase Order"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleApprove(po.id)}
                            disabled={approveMutation.isLoading}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Purchase Order"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(po.id)}
                            disabled={rejectMutation.isLoading}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject/Cancel Purchase Order"
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

export default PurchaseOrders


