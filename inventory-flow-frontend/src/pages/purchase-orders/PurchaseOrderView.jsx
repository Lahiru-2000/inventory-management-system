import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaTimes, FaCheck, FaPlus, FaPrint } from 'react-icons/fa'
import Swal from 'sweetalert2'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const PurchaseOrderView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: po, isLoading, error: poError } = useQuery(
    ['purchase-order', id],
    () => api.get(`/purchase-orders/${id}`).then(res => res.data.data),
    { enabled: !!id }
  )

  const approveMutation = useMutation(
    () => api.post(`/purchase-orders/${id}/approve?approvedById=${user?.id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('purchase-orders')
        queryClient.invalidateQueries(['purchase-order', id])
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
        const errorMessage = error.response?.data?.message || error.message || 'Failed to approve Purchase Order'
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorMessage,
          confirmButtonColor: '#ef4444'
        })
      }
    }
  )

  const handleApprove = () => {
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
        approveMutation.mutate()
      }
    })
  }

  const calculatePOTotal = () => {
    if (!po?.orderLines) return 0
    return po.orderLines.reduce((sum, line) => {
      return sum + (parseFloat(line.totalPrice) || 0)
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading purchase order...</p>
        </div>
      </div>
    )
  }

  if (poError || !po) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Failed to load purchase order</p>
          <button
            onClick={() => navigate('/purchase-orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Purchase Orders
          </button>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          .print-content {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto print-content">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-600 no-print">
          <button
            onClick={() => navigate('/purchase-orders')}
            className="hover:text-blue-600"
          >
            Purchase Orders
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{po.poNumber}</span>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Purchase Order Details</h1>
                <p className="text-sm text-gray-500 mt-1">PO Number: {po.poNumber}</p>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <FaPrint /> Print
                </button>
                <button
                  onClick={() => navigate('/purchase-orders')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                >
                  <FaArrowLeft /> Back
                </button>
              </div>
            </div>
          </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Supplier</p>
              <p className="font-medium">{po.supplierName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                po.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                po.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                po.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {po.status}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Order Date</p>
              <p className="font-medium">{po.orderDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Due Date</p>
              <p className="font-medium">{po.dueDate || 'Not set'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Created By</p>
              <p className="font-medium">{po.createdByName || 'N/A'}</p>
            </div>
            {po.approvedByName && (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xs text-gray-500 mb-1">Approved By</p>
                <p className="font-medium">{po.approvedByName}</p>
              </div>
            )}
          </div>

          {po.remarks && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <div className="px-3 py-2 bg-gray-50 rounded border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{po.remarks}</p>
              </div>
            </div>
          )}

          {/* Order Lines */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            {po.orderLines && po.orderLines.length > 0 ? (
              <div className="border rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {po.orderLines.map((line, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium">{line.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{line.itemSku}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">{line.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                          Rs. {parseFloat(line.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          Rs. {parseFloat(line.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium">
                        Grand Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold">
                        Rs. {calculatePOTotal().toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center border rounded">
                No items found in this purchase order.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t no-print">
            {po.status === 'APPROVED' && (
              <button
                onClick={() => {
                  navigate('/grns')
                  // Note: User can select this PO when creating GRN
                  setTimeout(() => {
                    alert(`To create GRN for ${po.poNumber}, select this PO when creating a new GRN.`)
                  }, 100)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus /> Create GRN from this PO
              </button>
            )}
            {(po.status === 'DRAFT' || po.status === 'PENDING_APPROVAL') && 
             (user?.role === 'ADMIN' || user?.role === 'STORE_MANAGER') && (
              <button
                onClick={handleApprove}
                disabled={approveMutation.isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaCheck /> {approveMutation.isLoading ? 'Approving...' : 'Approve PO'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default PurchaseOrderView

