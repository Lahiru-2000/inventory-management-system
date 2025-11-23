import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FaEdit, FaTimes, FaSave } from 'react-icons/fa'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const Stock = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [newQuantity, setNewQuantity] = useState(0)
  const [error, setError] = useState(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: stocksData } = useQuery('stocks', () =>
    api.get('/stocks').then(res => res.data.data)
  )

  const adjustStockMutation = useMutation(
    ({ itemId, newQuantity, reason, adjustedById }) =>
      api.post(`/stocks/adjust/${itemId}`, null, {
        params: {
          newQuantity,
          reason,
          adjustedById
        }
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stocks')
        setIsModalOpen(false)
        setSelectedStock(null)
        setError(null)
        alert('Stock adjusted successfully!')
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to adjust stock')
      }
    }
  )

  const stocks = stocksData || []

  const handleAdjustClick = (stock) => {
    setSelectedStock(stock)
    setNewQuantity(stock.quantityOnHand)
    setIsModalOpen(true)
    setError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!user?.id) {
      setError('User not found. Please login again.')
      return
    }

    const formData = new FormData(e.target)
    const quantityValue = parseInt(formData.get('newQuantity'))
    const reason = formData.get('reason') || 'Manual adjustment'

    if (isNaN(quantityValue) || quantityValue < 0) {
      setError('Please enter a valid quantity (0 or greater)')
      return
    }

    adjustStockMutation.mutate({
      itemId: selectedStock.itemId,
      newQuantity: quantityValue,
      reason,
      adjustedById: user.id
    })
  }

  const calculateDifference = () => {
    if (!selectedStock) return 0
    return newQuantity - selectedStock.quantityOnHand
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Management</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity on Hand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No stock items found.
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.itemSku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.quantityOnHand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {stock.stockValue?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleAdjustClick(stock)}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                      title="Adjust Stock"
                    >
                      <FaEdit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {isModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedStock(null)
                  setNewQuantity(0)
                  setError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form id="adjustStockForm" onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium text-gray-900">{selectedStock.itemName}</p>
                  <p className="text-xs text-gray-500">SKU: {selectedStock.itemSku}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
                <input
                  type="number"
                  value={selectedStock.quantityOnHand}
                  disabled
                  className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Quantity *</label>
                <input
                  name="newQuantity"
                  type="number"
                  min="0"
                  value={newQuantity}
                  required
                  onChange={(e) => {
                    setNewQuantity(parseInt(e.target.value) || 0)
                    setError(null)
                  }}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Difference: <span className={`font-medium ${calculateDifference() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateDifference() >= 0 ? '+' : ''}{calculateDifference()}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  name="reason"
                  rows="3"
                  placeholder="Enter reason for stock adjustment (e.g., Physical count, Damage, Return, etc.)"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setSelectedStock(null)
                    setNewQuantity(0)
                    setError(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustStockMutation.isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave /> {adjustStockMutation.isLoading ? 'Adjusting...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Stock


