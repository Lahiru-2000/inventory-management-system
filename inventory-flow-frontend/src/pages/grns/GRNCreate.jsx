import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const GRNCreate = () => {
  const [selectedPOId, setSelectedPOId] = useState(null)
  const [selectedPO, setSelectedPO] = useState(null)
  const [grnLines, setGrnLines] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: posData } = useQuery('purchase-orders', () =>
    api.get('/purchase-orders').then(res => res.data.data)
  )

  const createMutation = useMutation(
    (data) => api.post(`/grns/po/${selectedPOId}`, data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('grns')
        queryClient.invalidateQueries('stocks')
        queryClient.invalidateQueries('purchase-orders')
        const grnId = response.data.data?.id
        if (grnId) {
          navigate(`/grns/${grnId}`)
        } else {
          navigate('/grns')
        }
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to create GRN')
      }
    }
  )

  const approvedPOs = (posData || []).filter(po => {
    const status = po.status?.toUpperCase() || po.status
    return status === 'APPROVED'
  })

  const handleSelectPO = (poIdValue) => {
    setError(null)
    
    if (!poIdValue || poIdValue === '') {
      setSelectedPOId(null)
      setSelectedPO(null)
      setGrnLines([])
      return
    }
    
    const poIdNum = Number(poIdValue)
    const po = approvedPOs.find(p => Number(p.id) === poIdNum)
    
    if (po) {
      setSelectedPOId(poIdNum)
      setSelectedPO(po)
      setGrnLines([])
      
      api.get(`/purchase-orders/${poIdNum}`)
        .then(res => {
          const fullPO = res.data.data
          
          if (!fullPO.orderLines || fullPO.orderLines.length === 0) {
            setError('Selected Purchase Order has no items')
            setSelectedPOId(null)
            setSelectedPO(null)
            setGrnLines([])
            return
          }
          
          const lines = fullPO.orderLines.map(line => ({
            itemId: line.itemId || line.item?.id,
            itemName: line.itemName || line.item?.name,
            itemSku: line.itemSku || line.item?.sku,
            quantityOrdered: line.quantity || 0,
            quantityReceived: line.quantity || 0,
            unitPrice: parseFloat(line.unitPrice || 0)
          }))
          
          setGrnLines(lines)
          setError(null)
        })
        .catch(err => {
          const errorMsg = err.response?.data?.message || 'Failed to load PO details'
          setError(errorMsg)
          setSelectedPOId(null)
          setSelectedPO(null)
          setGrnLines([])
        })
    } else {
      setError('Selected Purchase Order not found')
      setSelectedPOId(null)
      setSelectedPO(null)
      setGrnLines([])
    }
  }

  const updateGrnLine = (index, field, value) => {
    const updated = [...grnLines]
    updated[index] = { ...updated[index], [field]: value }
    
    if (field === 'quantityReceived' || field === 'unitPrice') {
      const qty = field === 'quantityReceived' ? parseInt(value) || 0 : updated[index].quantityReceived
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updated[index].unitPrice) || 0
      updated[index].totalPrice = qty * price
    }
    
    setGrnLines(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    
    if (!user?.id) {
      setError('User not found. Please login again.')
      return
    }

    if (!selectedPOId) {
      setError('Please select a Purchase Order')
      return
    }

    if (grnLines.length === 0) {
      setError('Please add at least one item')
      return
    }

    const invalidLines = grnLines.filter(line => 
      !line.itemId || 
      !line.quantityReceived || 
      parseInt(line.quantityReceived) <= 0 ||
      !line.unitPrice || 
      parseFloat(line.unitPrice) <= 0
    )

    if (invalidLines.length > 0) {
      setError('Please ensure all items have valid quantity and unit price')
      return
    }

    const formData = new FormData(e.target)
    
    const data = {
      receiveDate: formData.get('receiveDate') || new Date().toISOString().split('T')[0],
      remarks: formData.get('remarks') || '',
      receivedById: user.id,
      grnLines: grnLines.map(line => ({
        itemId: Number(line.itemId),
        quantityOrdered: parseInt(line.quantityOrdered) || 0,
        quantityReceived: parseInt(line.quantityReceived) || 0,
        unitPrice: parseFloat(line.unitPrice) || 0
      }))
    }

    createMutation.mutate(data)
  }

  const calculateGrandTotal = () => {
    return grnLines.reduce((sum, line) => {
      const qty = parseInt(line.quantityReceived) || 0
      const price = parseFloat(line.unitPrice) || 0
      return sum + (qty * price)
    }, 0)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600">
        <button
          onClick={() => navigate('/grns')}
          className="hover:text-blue-600"
        >
          GRNs
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Create GRN</span>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Create Goods Receive Note</h1>
            <button
              onClick={() => navigate('/grns')}
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
                Select Approved Purchase Order *
              </label>
              <select
                value={selectedPOId ? String(selectedPOId) : ''}
                onChange={(e) => handleSelectPO(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select PO</option>
                {approvedPOs.length === 0 ? (
                  <option disabled>No approved POs available</option>
                ) : (
                  approvedPOs.map((po) => (
                    <option key={po.id} value={String(po.id)}>
                      {po.poNumber} - {po.supplierName}
                    </option>
                  ))
                )}
              </select>
              {selectedPOId && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {selectedPO?.poNumber}
                </p>
              )}
              {approvedPOs.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  You need approved Purchase Orders to create GRN
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receive Date *
              </label>
              <input
                name="receiveDate"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {selectedPO && (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium">PO Details:</p>
                <p className="text-xs text-gray-600">PO Number: {selectedPO.poNumber}</p>
                <p className="text-xs text-gray-600">Supplier: {selectedPO.supplierName}</p>
                <p className="text-xs text-gray-600">Order Date: {selectedPO.orderDate}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* GRN Lines */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Received Items</h3>
                {grnLines.length > 0 ? (
                  <div className="border rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received *</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {grnLines.map((line, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium">{line.itemName}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{line.itemSku}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-right">{line.quantityOrdered}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={line.quantityOrdered * 2}
                                value={line.quantityReceived}
                                onChange={(e) => updateGrnLine(index, 'quantityReceived', e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.unitPrice}
                                onChange={(e) => updateGrnLine(index, 'unitPrice', e.target.value)}
                                required
                                className="w-full px-3 py-2 border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              Rs. {(line.totalPrice || (line.quantityReceived * line.unitPrice)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="5" className="px-4 py-3 text-right text-sm font-medium">Grand Total:</td>
                          <td className="px-4 py-3 text-right text-lg font-bold">
                            Rs. {calculateGrandTotal().toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center border rounded">
                    Select a Purchase Order to load items
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/grns')}
              className="px-6 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedPOId || grnLines.length === 0 || createMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSave /> {createMutation.isLoading ? 'Creating...' : 'Create GRN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GRNCreate

