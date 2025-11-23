import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'

const StockReport = () => {
  const [filters, setFilters] = useState({
    category: '',
    searchTerm: ''
  })
  const [loading, setLoading] = useState(false)

  const { data: stockData, refetch } = useQuery(
    ['stock-report', filters],
    () => api.get('/reports/stock').then(res => res.data.data),
    {
      enabled: true,
      select: (data) => {
        let filtered = data || []
        
        if (filters.category) {
          filtered = filtered.filter(stock => 
            stock.categoryName?.toLowerCase().includes(filters.category.toLowerCase())
          )
        }
        
        if (filters.searchTerm) {
          filtered = filtered.filter(stock =>
            stock.itemName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            stock.itemSku?.toLowerCase().includes(filters.searchTerm.toLowerCase())
          )
        }
        
        return filtered
      }
    }
  )

  const { data: categoriesData } = useQuery('categories', () =>
    api.get('/categories').then(res => res.data.data)
  )

  const categories = categoriesData || []
  const stocks = stockData || []

  const totalStockValue = stocks.reduce((sum, stock) => 
    sum + parseFloat(stock.stockValue || 0), 0
  )

  const downloadPDF = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/export/stock/pdf', {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'stock-report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF report')
    } finally {
      setLoading(false)
    }
  }

  const downloadExcel = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reports/export/stock/excel', {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'stock-report.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading Excel:', error)
      alert('Failed to download Excel report')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ category: '', searchTerm: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
        <div className="flex space-x-2">
          <button
            onClick={downloadPDF}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button
            onClick={downloadExcel}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Downloading...' : 'Download Excel'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Item</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {stocks.length} item(s) | Total Stock Value: Rs. {totalStockValue.toFixed(2)}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity on Hand</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No stock items found
                </td>
              </tr>
            ) : (
              stocks.map((stock, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.itemSku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{stock.quantityOnHand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    Rs. {parseFloat(stock.stockValue || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {stocks.length > 0 && (
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium">Total Stock Value:</td>
                <td className="px-6 py-4 text-right text-sm font-bold">Rs. {totalStockValue.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

export default StockReport

