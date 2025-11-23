import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { FaPlus, FaTimes, FaSave, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const SalesOrderCreate = () => {
  const { id } = useParams()
  const isEditMode = !!id
  const [orderLines, setOrderLines] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: itemsData } = useQuery('items-active', () =>
    api.get('/items/active').then(res => res.data.data)
  )

  const { data: stocksData } = useQuery('stocks', () =>
    api.get('/stocks').then(res => res.data.data)
  )

  // Load SO data if editing
  const { data: soData, isLoading: isLoadingSO } = useQuery(
    ['sales-order', id],
    () => api.get(`/sales-orders/${id}`).then(res => res.data.data),
    { enabled: isEditMode && !!id }
  )

  const createMutation = useMutation(
    (data) => api.post('/sales-orders', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales-orders')
        navigate('/sales-orders')
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to create sales order')
      }
    }
  )

  const updateMutation = useMutation(
    (data) => api.put(`/sales-orders/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales-orders')
        queryClient.invalidateQueries(['sales-order', id])
        navigate(`/sales-orders/${id}`)
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update sales order')
      }
    }
  )

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
    
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? parseFloat(value) || 0 : updated[index].quantity
      const price = field === 'unitPrice' ? parseFloat(value) || 0 : updated[index].unitPrice
      updated[index].totalPrice = qty * price
    }
    
    setOrderLines(updated)
  }

  const calculateSubtotal = () => {
    return orderLines.reduce((sum, line) => {
      const qty = parseInt(line.quantity) || 0
      const price = parseFloat(line.unitPrice) || 0
      return sum + (qty * price)
    }, 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!user?.id) {
      setError('User not found. Please login again.')
      return
    }

    if (orderLines.length === 0) {
      setError('Please add at least one item')
      return
    }

    const invalidLines = orderLines.filter(line => 
      !line.itemId || 
      !line.quantity || 
      parseInt(line.quantity) <= 0 ||
      !line.unitPrice || 
      parseFloat(line.unitPrice) <= 0
    )

    if (invalidLines.length > 0) {
      setError('Please ensure all items have valid quantity and unit price')
      return
    }

    const formData = new FormData(e.target)
    const subtotal = calculateSubtotal()
    const discountValue = discount
    const taxValue = tax
    const total = subtotal - discountValue + taxValue
    
    const data = {
      orderDate: formData.get('orderDate') || new Date().toISOString().split('T')[0],
      deliveryDate: formData.get('deliveryDate') || null,
      customerName: formData.get('customerName') || '',
      customerAddress: formData.get('customerAddress') || '',
      customerPhone: formData.get('customerPhone') || '',
      status: isEditMode && soData ? soData.status : 'DRAFT',
      discount: discountValue,
      tax: taxValue,
      totalAmount: total,
      remarks: formData.get('remarks') || '',
      createdById: user.id,
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

  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const subtotal = calculateSubtotal()
  const grandTotal = subtotal - discount + tax

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && soData) {
      setOrderLines(
        soData.orderLines?.map(line => ({
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: parseFloat(line.unitPrice || 0),
          totalPrice: parseFloat(line.totalPrice || 0)
        })) || []
      )
      setDiscount(parseFloat(soData.discount || 0))
      setTax(parseFloat(soData.tax || 0))
    }
  }, [isEditMode, soData])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600">
        <button
          onClick={() => navigate('/sales-orders')}
          className="hover:text-blue-600"
        >
          Sales Orders
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{isEditMode ? 'Edit Sales Order' : 'Create Sales Order'}</span>
      </div>

      {isLoadingSO ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales order...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Sales Order' : 'Create Sales Order'}</h1>
            <button
              onClick={() => navigate('/sales-orders')}
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

          {/* Customer Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  name="customerName"
                  required
                  defaultValue={isEditMode && soData ? soData.customerName : ''}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Phone
                </label>
                <input
                  name="customerPhone"
                  type="tel"
                  defaultValue={isEditMode && soData ? soData.customerPhone : ''}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone Number"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Address
                </label>
                <textarea
                  name="customerAddress"
                  rows="2"
                  defaultValue={isEditMode && soData ? soData.customerAddress : ''}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address"
                />
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <input
                name="orderDate"
                type="date"
                defaultValue={isEditMode && soData ? soData.orderDate : new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                name="deliveryDate"
                type="date"
                defaultValue={isEditMode && soData && soData.deliveryDate ? soData.deliveryDate : ''}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                                  {item.name} ({item.sku}) - Rs. {item.sellingPrice?.toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {selectedItem ? (() => {
                              const availableStock = getAvailableStock(selectedItem.id)
                              const orderedQty = parseInt(line.quantity) || 0
                              const hasStock = availableStock > 0
                              const sufficientStock = availableStock >= orderedQty
                              return (
                                <span className={`text-sm font-medium ${
                                  !hasStock 
                                    ? 'text-red-600' 
                                    : !sufficientStock 
                                      ? 'text-orange-600' 
                                      : 'text-green-600'
                                }`}>
                                  {availableStock}
                                </span>
                              )
                            })() : (
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
                        Subtotal:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        Rs. {subtotal.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (Rs.)
                </label>
                <input
                  name="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax (Rs.)
                </label>
                <input
                  name="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Grand Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Rs. {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              rows="3"
              defaultValue={isEditMode && soData ? soData.remarks : ''}
              placeholder="Additional notes..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/sales-orders')}
              className="px-6 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
            <button
              type="submit"
              disabled={orderLines.length === 0 || createMutation.isLoading || updateMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSave /> {
                isEditMode 
                  ? (updateMutation.isLoading ? 'Updating...' : 'Update Sales Order')
                  : (createMutation.isLoading ? 'Creating...' : 'Create Sales Order')
              }
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  )
}

export default SalesOrderCreate

