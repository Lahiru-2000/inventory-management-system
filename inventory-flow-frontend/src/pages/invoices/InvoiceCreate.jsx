import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const InvoiceCreate = () => {
  const [selectedSOId, setSelectedSOId] = useState(null)
  const [selectedSO, setSelectedSO] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: sosData } = useQuery('sales-orders', () =>
    api.get('/sales-orders').then(res => res.data.data)
  )

  const { data: invoicesData } = useQuery('invoices', () =>
    api.get('/invoices').then(res => res.data.data)
  )

  const createMutation = useMutation(
    (data) => api.post(`/invoices/so/${selectedSOId}`, data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('invoices')
        queryClient.invalidateQueries('sales-orders')
        const invoiceId = response.data.data?.id
        if (invoiceId) {
          navigate(`/invoices/${invoiceId}`)
        } else {
          navigate('/invoices')
        }
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to create invoice')
      }
    }
  )

  // Only confirmed sales orders without invoices are eligible
  const eligibleSOs = (sosData || []).filter(so => {
    const status = so.status?.toUpperCase() || so.status
    if (status !== 'CONFIRMED' && status !== 'INVOICED') return false
    
    // Check if invoice already exists for this SO
    const hasInvoice = (invoicesData || []).some(inv => Number(inv.soId) === Number(so.id))
    return !hasInvoice
  })

  const handleSelectSO = (soIdValue) => {
    setError(null)
    
    if (!soIdValue || soIdValue === '') {
      setSelectedSOId(null)
      setSelectedSO(null)
      return
    }
    
    const soIdNum = Number(soIdValue)
    const so = eligibleSOs.find(s => Number(s.id) === soIdNum)
    
    if (so) {
      setSelectedSOId(soIdNum)
      setSelectedSO(so)
      
      // Load full SO details to get amounts
      api.get(`/sales-orders/${soIdNum}`)
        .then(res => {
          const fullSO = res.data.data
          setSelectedSO(fullSO)
          setError(null)
        })
        .catch(err => {
          const errorMsg = err.response?.data?.message || 'Failed to load SO details'
          setError(errorMsg)
          setSelectedSOId(null)
          setSelectedSO(null)
        })
    } else {
      setError('Selected Sales Order not found or already has an invoice')
      setSelectedSOId(null)
      setSelectedSO(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    
    if (!user?.id) {
      setError('User not found. Please login again.')
      return
    }

    if (!selectedSOId) {
      setError('Please select a Sales Order')
      return
    }

    const formData = new FormData(e.target)
    
    const data = {
      invoiceDate: formData.get('invoiceDate') || new Date().toISOString().split('T')[0],
      dueDate: formData.get('dueDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentStatus: formData.get('paymentStatus') || 'PENDING',
      createdById: user.id
    }

    createMutation.mutate(data)
  }

  // Calculate invoice amounts from selected SO
  const subtotal = selectedSO ? (selectedSO.totalAmount || 0) + (selectedSO.discount || 0) - (selectedSO.tax || 0) : 0
  const discount = selectedSO ? (selectedSO.discount || 0) : 0
  const tax = selectedSO ? (selectedSO.tax || 0) : 0
  const totalAmount = selectedSO ? (selectedSO.totalAmount || 0) : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600">
        <button
          onClick={() => navigate('/invoices')}
          className="hover:text-blue-600"
        >
          Invoices
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Create Invoice</span>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Confirmed/Invoiced Sales Order *
              </label>
              <select
                value={selectedSOId ? String(selectedSOId) : ''}
                onChange={(e) => handleSelectSO(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select SO</option>
                {eligibleSOs.length === 0 ? (
                  <option disabled>No eligible SOs available</option>
                ) : (
                  eligibleSOs.map((so) => (
                    <option key={so.id} value={String(so.id)}>
                      {so.soNumber} - {so.customerName || 'N/A'} ({so.status})
                    </option>
                  ))
                )}
              </select>
              {selectedSOId && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {selectedSO?.soNumber}
                </p>
              )}
              {eligibleSOs.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  You need confirmed Sales Orders without invoices to create an invoice
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date *
              </label>
              <input
                name="invoiceDate"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                name="dueDate"
                type="date"
                defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status *
              </label>
              <select
                name="paymentStatus"
                defaultValue="PENDING"
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {selectedSO && (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="text-lg font-semibold mb-4">SO Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">SO Number</p>
                    <p className="font-medium">{selectedSO.soNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="font-medium">{selectedSO.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="font-medium">{selectedSO.orderDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <p className="font-medium">{selectedSO.status}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded">
                <h3 className="text-lg font-semibold mb-4">Invoice Amounts</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-Rs. {discount.toFixed(2)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">+Rs. {tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="px-6 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSOId || createMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSave /> {createMutation.isLoading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvoiceCreate

