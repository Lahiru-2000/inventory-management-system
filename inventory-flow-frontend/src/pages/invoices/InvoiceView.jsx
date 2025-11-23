import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaEdit } from 'react-icons/fa'
import api from '../../services/api'

const InvoiceView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)

  const { data: invoice, isLoading, error: invoiceError } = useQuery(
    ['invoice', id],
    () => api.get(`/invoices/${id}`).then(res => res.data.data),
    { enabled: !!id }
  )

  const updatePaymentStatusMutation = useMutation(
    (status) => api.put(`/invoices/${id}/payment-status`, { paymentStatus: status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('invoices')
        queryClient.invalidateQueries(['invoice', id])
        setError(null)
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update payment status')
      }
    }
  )

  const handleUpdatePaymentStatus = (status) => {
    if (window.confirm(`Are you sure you want to mark this invoice as ${status}?`)) {
      updatePaymentStatusMutation.mutate(status)
    }
  }

  const getPaymentStatusBadge = (status) => {
    const statusClass = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClass[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (invoiceError || !invoice) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Failed to load invoice</p>
          <button
            onClick={() => navigate('/invoices')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600">
        <button
          onClick={() => navigate('/invoices')}
          className="hover:text-blue-600"
        >
          Invoices
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{invoice.invoiceNumber}</span>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
              <p className="text-sm text-gray-500 mt-1">Invoice Number: {invoice.invoiceNumber}</p>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">SO Number</p>
              <p className="font-medium">{invoice.soNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Invoice Date</p>
              <p className="font-medium">{invoice.invoiceDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Due Date</p>
              <p className="font-medium">{invoice.dueDate || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <div className="mt-1">{getPaymentStatusBadge(invoice.paymentStatus)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Created By</p>
              <p className="font-medium">{invoice.createdByName || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Customer</p>
              <p className="font-medium">{invoice.customerName || 'N/A'}</p>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rs. {parseFloat(invoice.subtotal || 0).toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-Rs. {parseFloat(invoice.discount || 0).toFixed(2)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">+Rs. {parseFloat(invoice.tax || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total Amount:</span>
                <span className="text-blue-600">Rs. {parseFloat(invoice.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Invoice Lines */}
          {invoice.invoiceLines && invoice.invoiceLines.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Invoice Items</h3>
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
                    {invoice.invoiceLines.map((line, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium">{line.itemName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{line.itemSku || 'N/A'}</td>
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
                </table>
              </div>
            </div>
          )}

          {/* Payment Status Update */}
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <h3 className="text-lg font-semibold mb-3">Update Payment Status</h3>
            <div className="flex space-x-2">
              {invoice.paymentStatus !== 'PAID' && (
                <button
                  onClick={() => handleUpdatePaymentStatus('PAID')}
                  disabled={updatePaymentStatusMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <FaEdit /> {updatePaymentStatusMutation.isLoading ? 'Updating...' : 'Mark as Paid'}
                </button>
              )}
              {invoice.paymentStatus !== 'PENDING' && (
                <button
                  onClick={() => handleUpdatePaymentStatus('PENDING')}
                  disabled={updatePaymentStatusMutation.isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <FaEdit /> {updatePaymentStatusMutation.isLoading ? 'Updating...' : 'Mark as Pending'}
                </button>
              )}
              {invoice.paymentStatus !== 'CANCELLED' && (
                <button
                  onClick={() => handleUpdatePaymentStatus('CANCELLED')}
                  disabled={updatePaymentStatusMutation.isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <FaEdit /> {updatePaymentStatusMutation.isLoading ? 'Updating...' : 'Mark as Cancelled'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceView

