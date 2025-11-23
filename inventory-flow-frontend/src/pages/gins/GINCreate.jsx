import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const GINCreate = () => {
  const { id } = useParams()
  const isEditMode = !!id
  const [selectedSOId, setSelectedSOId] = useState(null)
  const [selectedSO, setSelectedSO] = useState(null)
  const [ginLines, setGinLines] = useState([])
  const [error, setError] = useState(null)
  const [stockInfo, setStockInfo] = useState({})
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: sosData } = useQuery('sales-orders', () =>
    api.get('/sales-orders').then(res => res.data.data)
  )

  const { data: stockData } = useQuery('stocks', () =>
    api.get('/stocks').then(res => res.data.data)
  )

  // Load GIN data if editing
  const { data: ginData, isLoading: isLoadingGIN } = useQuery(
    ['gin', id],
    () => api.get(`/gins/${id}`).then(res => res.data.data),
    { enabled: isEditMode && !!id }
  )

  // Refresh stocks when modal opens
  useEffect(() => {
    queryClient.invalidateQueries('stocks')
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && ginData && stockData) {
      // Build stock map for this useEffect
      const stocks = stockData || []
      const stockMapLocal = stocks.reduce((acc, stock) => {
        const itemId = stock.itemId
        const qty = stock.quantityOnHand || 0
        acc[itemId] = qty
        acc[String(itemId)] = qty
        acc[Number(itemId)] = qty
        return acc
      }, {})
      
      setSelectedSOId(ginData.salesOrderId)
      
      // Find the SO in the list
      const so = sosData?.find(s => s.id === ginData.salesOrderId)
      if (so) {
        setSelectedSO(so)
      } else {
        setSelectedSO({ 
          id: ginData.salesOrderId, 
          soNumber: ginData.soNumber 
        })
      }
      
      // Update stock info for each line
      // When editing, add back the previously issued quantity to available stock
      // since we'll reverse it when updating
      const updatedLines = ginData.ginLines?.map(line => {
        const itemId = line.itemId
        const currentStock = stockMapLocal[itemId] !== undefined 
          ? stockMapLocal[itemId] 
          : (stockMapLocal[String(itemId)] !== undefined 
            ? stockMapLocal[String(itemId)] 
            : (stockMapLocal[Number(itemId)] !== undefined
              ? stockMapLocal[Number(itemId)]
              : 0))
        // Add back the previously issued quantity since we'll reverse it
        const availableStock = currentStock + (line.quantityIssued || 0)
        
        return {
          itemId: itemId,
          itemName: line.itemName,
          itemSku: line.itemSku,
          quantityOrdered: line.quantityOrdered,
          quantityIssued: line.quantityIssued,
          unitPrice: parseFloat(line.unitPrice || 0),
          availableStock: availableStock
        }
      }) || []
      
      setGinLines(updatedLines)
    }
  }, [isEditMode, ginData, stockData, sosData])

  const createMutation = useMutation(
    (data) => api.post(`/gins/so/${selectedSOId}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gins')
        queryClient.invalidateQueries('stocks')
        navigate('/gins')
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to create GIN')
      }
    }
  )

  const updateMutation = useMutation(
    (data) => api.put(`/gins/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gins')
        queryClient.invalidateQueries('stocks')
        queryClient.invalidateQueries(['gin', id])
        navigate('/gins')
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update GIN')
      }
    }
  )

  const eligibleSOs = (sosData || []).filter(so => 
    so.status === 'CONFIRMED' || so.status === 'INVOICED'
  )
  const stocks = stockData || []

  // Build stock lookup map
  const stockMap = stocks.reduce((acc, stock) => {
    const itemId = stock.itemId
    const qty = stock.quantityOnHand || 0
    acc[itemId] = qty
    acc[String(itemId)] = qty
    acc[Number(itemId)] = qty
    return acc
  }, {})

  const handleSelectSO = (soIdValue) => {
    setError(null)
    
    if (!soIdValue || soIdValue === '') {
      setSelectedSOId(null)
      setSelectedSO(null)
      setGinLines([])
      setStockInfo({})
      return
    }
    
    const soIdNum = Number(soIdValue)
    const so = eligibleSOs.find(s => Number(s.id) === soIdNum)
    
    if (so) {
      setSelectedSOId(soIdNum)
      setSelectedSO(so)
      setGinLines([])
      setStockInfo({})
      
      api.get(`/sales-orders/${soIdNum}`)
        .then(res => {
          const fullSO = res.data.data
          
          if (!fullSO.orderLines || fullSO.orderLines.length === 0) {
            setError('Selected Sales Order has no items')
            setSelectedSOId(null)
            setSelectedSO(null)
            setGinLines([])
            return
          }
          
          const lines = fullSO.orderLines.map(line => {
            const itemId = line.itemId || line.item?.id
            const availableStock = stockMap[itemId] !== undefined 
              ? stockMap[itemId] 
              : (stockMap[String(itemId)] !== undefined 
                ? stockMap[String(itemId)] 
                : (stockMap[Number(itemId)] !== undefined
                  ? stockMap[Number(itemId)]
                  : 0))
            
            return {
              itemId: itemId,
              itemName: line.itemName || line.item?.name,
              itemSku: line.itemSku || line.item?.sku,
              quantityOrdered: line.quantity || 0,
              quantityIssued: line.quantity || 0,
              unitPrice: parseFloat(line.unitPrice || 0),
              availableStock: availableStock
            }
          })
          
          setGinLines(lines)
          setError(null)
        })
        .catch(err => {
          const errorMsg = err.response?.data?.message || 'Failed to load SO details'
          setError(errorMsg)
          setSelectedSOId(null)
          setSelectedSO(null)
          setGinLines([])
        })
    } else {
      setError('Selected Sales Order not found')
      setSelectedSOId(null)
      setSelectedSO(null)
      setGinLines([])
    }
  }

  const updateGinLine = (index, field, value) => {
    const updated = [...ginLines]
    updated[index] = { ...updated[index], [field]: value }
    setGinLines(updated)
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

    if (ginLines.length === 0) {
      setError('Please add at least one item')
      return
    }

    // Validate stock availability
    const stockErrors = []
    ginLines.forEach((line, index) => {
      const itemId = line.itemId
      const availableStock = stockMap[itemId] !== undefined 
        ? stockMap[itemId] 
        : (stockMap[String(itemId)] !== undefined 
          ? stockMap[String(itemId)] 
          : (stockMap[Number(itemId)] !== undefined
            ? stockMap[Number(itemId)]
            : 0))
      const quantityIssued = parseInt(line.quantityIssued) || 0
      
      if (quantityIssued > availableStock) {
        stockErrors.push(`${line.itemName}: Requested ${quantityIssued}, but only ${availableStock} available`)
      }
    })

    if (stockErrors.length > 0) {
      setError(`Stock validation failed:\n${stockErrors.join('\n')}`)
      return
    }

    const formData = new FormData(e.target)
    
    const data = {
      issueDate: formData.get('issueDate') || new Date().toISOString().split('T')[0],
      remarks: formData.get('remarks') || '',
      issuedById: user.id,
      ginLines: ginLines.map(line => ({
        itemId: Number(line.itemId),
        quantityOrdered: parseInt(line.quantityOrdered) || 0,
        quantityIssued: parseInt(line.quantityIssued) || 0,
        unitPrice: parseFloat(line.unitPrice) || 0
      }))
    }

    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600">
        <button
          onClick={() => navigate('/gins')}
          className="hover:text-blue-600"
        >
          GINs
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEditMode ? 'Edit GIN' : 'Create GIN'}</span>
      </div>

      {isLoadingGIN ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading GIN...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Goods Issue Note' : 'Create Goods Issue Note'}</h1>
            <button
              onClick={() => navigate('/gins')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded whitespace-pre-line">
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
                disabled={isEditMode}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  You need confirmed or invoiced Sales Orders to create GIN
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                name="issueDate"
                type="date"
                defaultValue={isEditMode && ginData ? ginData.issueDate : new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {selectedSO && (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium">SO Details:</p>
                <p className="text-xs text-gray-600">SO Number: {selectedSO.soNumber}</p>
                <p className="text-xs text-gray-600">Customer: {selectedSO.customerName || 'N/A'}</p>
                <p className="text-xs text-gray-600">Order Date: {selectedSO.orderDate}</p>
                <p className="text-xs text-gray-600">Status: {selectedSO.status}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  rows="2"
                  defaultValue={isEditMode && ginData ? ginData.remarks : ''}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* GIN Lines */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Issue Items (Adjust quantities if different from ordered. Stock will be reduced.)
                </h3>
                {ginLines.length > 0 ? (
                  <div className="border rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available Stock</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Issue Qty *</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ginLines.map((line, index) => {
                          const itemId = line.itemId
                          const availableStock = line.availableStock !== undefined 
                            ? line.availableStock 
                            : (stockMap[itemId] !== undefined 
                              ? stockMap[itemId] 
                              : (stockMap[String(itemId)] !== undefined 
                                ? stockMap[String(itemId)]
                                : (stockMap[Number(itemId)] !== undefined
                                  ? stockMap[Number(itemId)]
                                  : 0)))
                          const quantityIssued = parseInt(line.quantityIssued) || 0
                          const isOverStock = quantityIssued > availableStock
                          
                          return (
                            <tr key={index} className={isOverStock ? 'bg-red-50' : ''}>
                              <td className="px-4 py-3 text-sm font-medium">{line.itemName}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{line.itemSku}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 text-right">{line.quantityOrdered}</td>
                              <td className={`px-4 py-3 text-sm font-medium text-right ${
                                availableStock <= 0 ? 'text-red-600' : 
                                availableStock < line.quantityOrdered ? 'text-orange-600' : 
                                'text-green-600'
                              }`}>
                                {availableStock}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max={availableStock * 2}
                                  value={line.quantityIssued}
                                  onChange={(e) => updateGinLine(index, 'quantityIssued', e.target.value)}
                                  required
                                  className={`w-full px-3 py-2 border rounded text-right focus:outline-none focus:ring-2 ${
                                    isOverStock 
                                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                                      : 'focus:ring-blue-500'
                                  }`}
                                />
                                {isOverStock && (
                                  <p className="text-xs text-red-600 mt-1">Exceeds stock!</p>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center border rounded">
                    Select a Sales Order to load items
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/gins')}
              className="px-6 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSOId || ginLines.length === 0 || createMutation.isLoading || updateMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSave /> {
                isEditMode 
                  ? (updateMutation.isLoading ? 'Updating...' : 'Update GIN')
                  : (createMutation.isLoading ? 'Creating...' : 'Create GIN')
              }
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  )
}

export default GINCreate

