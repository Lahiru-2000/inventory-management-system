import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { FaPlus, FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const PurchaseOrderCreate = () => {
  const { id } = useParams()
  const isEditMode = !!id
  const [orderLines, setOrderLines] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: suppliersData } = useQuery('suppliers', () =>
    api.get('/suppliers').then(res => res.data.data)
  )

  const { data: itemsData } = useQuery('items-active', () =>
    api.get('/items/active').then(res => res.data.data)
  )

  const { data: stocksData } = useQuery('stocks', () =>
    api.get('/stocks').then(res => res.data.data)
  )

  // Load PO data if editing
  const { data: poData, isLoading: isLoadingPO } = useQuery(
    ['purchase-order', id],
    () => api.get(`/purchase-orders/${id}`).then(res => res.data.data),
    { enabled: isEditMode && !!id }
  )

  const createMutation = useMutation(
    (data) => api.post('/purchase-orders', data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('purchase-orders')
        const poId = response.data.data?.id
        if (poId) {
          navigate(`/purchase-orders/${poId}`)
        } else {
          navigate('/purchase-orders')
        }
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to create purchase order')
      }
    }
  )

  const updateMutation = useMutation(
    (data) => api.put(`/purchase-orders/${id}`, data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('purchase-orders')
        queryClient.invalidateQueries(['purchase-order', id])
        navigate(`/purchase-orders/${id}`)
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update purchase order')
      }
    }
  )

  const suppliers = (suppliersData || []).filter(supplier => supplier.active === 1 || supplier.active === true)
  const items = itemsData || []
  const stocks = stocksData || []

  // Build stock lookup map
  const stockMap = stocks.reduce((acc, stock) => {
    const itemId = stock.itemId
    const qty = stock.quantityOnHand || 0
    acc[itemId] = qty
    acc[String(itemId)] = qty
    acc[Number(itemId)] = qty
    return acc
  }, {})

  const getAvailableStock = (itemId) => {
    if (!itemId) return 0
    return stockMap[itemId] !== undefined 
      ? stockMap[itemId] 
      : (stockMap[String(itemId)] !== undefined 
        ? stockMap[String(itemId)] 
        : (stockMap[Number(itemId)] !== undefined
          ? stockMap[Number(itemId)]
          : 0))
  }

  const addOrderLine = () => {
    setOrderLines([
      ...orderLines,
      { itemId: '', quantity: 1, unitPrice: 0 }
    ])
  }

  const removeOrderLine = (index) => {
    setOrderLines(orderLines.filter((_, i) => i !== index))
  }

  const updateOrderLine = (index, field, value) => {
    const updated = [...orderLines]
    updated[index] = { ...updated[index], [field]: value }
    
    // Calculate total price for the line
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : updated[index].quantity
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : updated[index].unitPrice
      updated[index].totalPrice = qty * price
    }
    
    setOrderLines(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.target)
    
    if (orderLines.length === 0) {
      setError('Please add at least one item to the purchase order')
      return
    }

    const data = {
      supplierId: Number(formData.get('supplierId')),
      orderDate: formData.get('orderDate') || new Date().toISOString().split('T')[0],
      dueDate: formData.get('dueDate') || null,
      status: poData?.status || 'DRAFT', // Keep existing status when editing
      remarks: formData.get('remarks') || '',
      createdById: user?.id,
      orderLines: orderLines.map(line => ({
        itemId: Number(line.itemId),
        quantity: parseInt(line.quantity) || 1,
        unitPrice: parseFloat(line.unitPrice) || 0
      }))
    }

    if (isEditMode) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const getSelectedItem = (itemId) => {
    return items.find(item => item.id === Number(itemId))
  }

  const calculateGrandTotal = () => {
    return orderLines.reduce((sum, line) => {
      const qty = parseInt(line.quantity) || 0
      const price = parseFloat(line.unitPrice) || 0
      return sum + (qty * price)
    }, 0)
  }

  // Load PO data into form when editing
  useEffect(() => {
    if (isEditMode && poData) {
      setOrderLines(poData.orderLines?.map(line => ({
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: parseFloat(line.unitPrice),
        totalPrice: parseFloat(line.totalPrice)
      })) || [])
    }
  }, [isEditMode, poData])

  if (isEditMode && isLoadingPO) {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>
  }

  // Check if PO can be edited
  if (isEditMode && poData && poData.status !== 'DRAFT' && poData.status !== 'PENDING_APPROVAL') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          This Purchase Order cannot be edited. It is already {poData.status}.
        </div>
        <button
          onClick={() => navigate('/purchase-orders')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Purchase Orders
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="hover:text-blue-600"
        >
          Purchase Orders
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}</span>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
            <button
              onClick={() => navigate('/purchase-orders')}
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
                Supplier *
              </label>
              <select
                name="supplierId"
                required
                defaultValue={poData?.supplierId}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <input
                name="orderDate"
                type="date"
                defaultValue={poData?.orderDate || new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                defaultValue={poData?.dueDate || ''}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              rows="3"
              placeholder="Additional notes..."
              defaultValue={poData?.remarks || ''}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Order Lines */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <button
                type="button"
                onClick={addOrderLine}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <FaPlus /> Add Item
              </button>
            </div>

            {orderLines.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500 mb-2">No items added</p>
                <button
                  type="button"
                  onClick={addOrderLine}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Click here to add items
                </button>
              </div>
            ) : (
              <div className="border rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderLines.map((line, index) => {
                      const selectedItem = getSelectedItem(line.itemId)
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <select
                              value={line.itemId}
                              onChange={(e) => updateOrderLine(index, 'itemId', e.target.value)}
                              required
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Item</option>
                              {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.sku}) - Rs. {item.costPrice?.toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {selectedItem ? (
                              <span className="text-sm font-medium text-gray-700">
                                {getAvailableStock(selectedItem.id)}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => updateOrderLine(index, 'quantity', e.target.value)}
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
                              onChange={(e) => updateOrderLine(index, 'unitPrice', e.target.value)}
                              required
                              className="w-full px-3 py-2 border rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            Rs. {(line.totalPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeOrderLine(index)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
                              title="Remove"
                            >
                              <FaTimes size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium">
                        Grand Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold">
                        Rs. {calculateGrandTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/purchase-orders')}
              className="px-6 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={orderLines.length === 0 || createMutation.isLoading || updateMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSave /> {isEditMode 
                ? (updateMutation.isLoading ? 'Updating...' : 'Update Purchase Order')
                : (createMutation.isLoading ? 'Creating...' : 'Create Purchase Order')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PurchaseOrderCreate

