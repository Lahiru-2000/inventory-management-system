import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'

const ProfitReport = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
  
  const [filters, setFilters] = useState({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const { data: profitData } = useQuery(
    ['profit-report', filters.startDate, filters.endDate],
    () => api.get(`/reports/profit?startDate=${filters.startDate}&endDate=${filters.endDate}`).then(res => res.data.data),
    { enabled: true }
  )

  const profit = profitData || 0

  const downloadPDF = async () => {
    setLoading(true)
    try {
      const response = await api.get(
        `/reports/export/profit/pdf?startDate=${filters.startDate}&endDate=${filters.endDate}`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'profit-report.pdf'
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const setDateRange = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setFilters({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    })
  }

  const isProfit = parseFloat(profit) >= 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profit Report</h1>
        <button
          onClick={downloadPDF}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => setDateRange(30)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange(90)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Last 90 Days
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Period: {filters.startDate} to {filters.endDate}
        </div>
      </div>

      {/* Profit Display */}
      <div className="bg-white shadow rounded-lg p-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Total Profit</p>
          <p className={`text-5xl font-bold mb-4 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            Rs. {parseFloat(profit).toFixed(2)}
          </p>
          <p className={`text-sm font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {isProfit ? 'Profit' : 'Loss'}
          </p>
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">
              Profit = Total Sales - Total Cost
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This calculation is based on sales orders and purchase orders within the selected period.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfitReport

