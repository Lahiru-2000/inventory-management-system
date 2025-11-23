import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../../services/api'

const PurchaseReport = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
  
  const [filters, setFilters] = useState({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: '',
    supplier: ''
  })
  const [loading, setLoading] = useState(false)

  const { data: purchaseData } = useQuery(
    ['purchase-report', filters.startDate, filters.endDate],
    () => api.get(`/reports/purchase?startDate=${filters.startDate}&endDate=${filters.endDate}`).then(res => res.data.data),
    { enabled: true }
  )

  const { data: suppliersData } = useQuery('suppliers', () =>
    api.get('/suppliers').then(res => res.data.data)
  )

  const suppliers = suppliersData || []
  let purchases = purchaseData || []

  // Apply filters
  if (filters.status) {
    purchases = purchases.filter(po => po.status === filters.status)
  }
  if (filters.supplier) {
    purchases = purchases.filter(po => 
      po.supplierName?.toLowerCase().includes(filters.supplier.toLowerCase())
    )
  }

  const downloadPDF = async () => {
    setLoading(true)
    try {
      const response = await api.get(
        `/reports/export/purchase/pdf?startDate=${filters.startDate}&endDate=${filters.endDate}`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'purchase-report.pdf'
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
      const response = await api.get(
        `/reports/export/purchase/excel?startDate=${filters.startDate}&endDate=${filters.endDate}`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'purchase-report.xlsx'
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

  const setDateRange = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setFilters(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }))
  }

  const clearFilters = () => {
    setDateRange(30)
    setFilters(prev => ({ ...prev, status: '', supplier: '' }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Report</h1>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input
              type="text"
              placeholder="Search supplier..."
              value={filters.supplier}
              onChange={(e) => handleFilterChange('supplier', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setDateRange(7)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateRange(30)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange(90)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Last 90 Days
          </button>
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Clear Filters
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Showing {purchases.length} purchase order(s) for period {filters.startDate} to {filters.endDate}
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No purchase orders found for the selected period
                </td>
              </tr>
            ) : (
              purchases.map((purchase, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.poNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.supplierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      purchase.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      purchase.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PurchaseReport

