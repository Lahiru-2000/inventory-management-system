import { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const { data: stockData } = useQuery('stock-report', () =>
    api.get('/reports/stock').then(res => res.data.data)
  )

  const { data: lowStockData } = useQuery('low-stock-report', () =>
    api.get('/reports/low-stock').then(res => res.data.data)
  )

  const { data: purchaseData } = useQuery(
    ['purchase-report', startDate, endDate],
    () => api.get(`/reports/purchase?startDate=${startDate}&endDate=${endDate}`).then(res => res.data.data),
    { enabled: selectedReport === 'purchase' || selectedReport === 'profit' }
  )

  const { data: salesData } = useQuery(
    ['sales-report', startDate, endDate],
    () => api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`).then(res => res.data.data),
    { enabled: selectedReport === 'sales' || selectedReport === 'profit' }
  )

  const { data: profitData } = useQuery(
    ['profit-report', startDate, endDate],
    () => api.get(`/reports/profit?startDate=${startDate}&endDate=${endDate}`).then(res => res.data.data),
    { enabled: selectedReport === 'profit' }
  )

  const downloadPDF = async (reportType) => {
    setLoading(true)
    try {
      let url = ''
      if (reportType === 'stock') {
        url = '/reports/export/stock/pdf'
      } else if (reportType === 'low-stock') {
        url = '/reports/export/low-stock/pdf'
      } else if (reportType === 'purchase') {
        url = `/reports/export/purchase/pdf?startDate=${startDate}&endDate=${endDate}`
      } else if (reportType === 'sales') {
        url = `/reports/export/sales/pdf?startDate=${startDate}&endDate=${endDate}`
      } else if (reportType === 'profit') {
        url = `/reports/export/profit/pdf?startDate=${startDate}&endDate=${endDate}`
      }

      const response = await api.get(url, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `${reportType}-report.pdf`
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

  const downloadExcel = async (reportType) => {
    setLoading(true)
    try {
      let url = ''
      if (reportType === 'stock') {
        url = '/reports/export/stock/excel'
      } else if (reportType === 'low-stock') {
        url = '/reports/export/low-stock/excel'
      } else if (reportType === 'purchase') {
        url = `/reports/export/purchase/excel?startDate=${startDate}&endDate=${endDate}`
      } else if (reportType === 'sales') {
        url = `/reports/export/sales/excel?startDate=${startDate}&endDate=${endDate}`
      }

      const response = await api.get(url, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `${reportType}-report.xlsx`
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

  const viewReport = (reportType) => {
    setSelectedReport(reportType)
  }

  const renderReportData = () => {
    if (!selectedReport) return null

    switch (selectedReport) {
      case 'stock':
        return (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Stock Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(stockData || []).map((stock, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{stock.itemName}</td>
                      <td className="px-4 py-3 text-sm">{stock.itemSku}</td>
                      <td className="px-4 py-3 text-sm">{stock.categoryName}</td>
                      <td className="px-4 py-3 text-sm text-right">{stock.quantityOnHand}</td>
                      <td className="px-4 py-3 text-sm text-right">Rs. {parseFloat(stock.stockValue || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'low-stock':
        return (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Low Stock Items Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(lowStockData || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.reorderLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'purchase':
        return (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Purchase Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(purchaseData || []).map((purchase, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{purchase.poNumber}</td>
                      <td className="px-4 py-3 text-sm">{purchase.supplierName}</td>
                      <td className="px-4 py-3 text-sm">{purchase.orderDate}</td>
                      <td className="px-4 py-3 text-sm">{purchase.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'sales':
        return (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(salesData || []).map((sale, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{sale.soNumber}</td>
                      <td className="px-4 py-3 text-sm">{sale.customerName}</td>
                      <td className="px-4 py-3 text-sm">{sale.orderDate}</td>
                      <td className="px-4 py-3 text-sm text-right">Rs. {parseFloat(sale.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">{sale.status}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-sm font-medium text-right">Total:</td>
                    <td className="px-4 py-3 text-sm font-bold text-right">
                      Rs. {(salesData || []).reduce((sum, sale) => sum + parseFloat(sale.totalAmount || 0), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      case 'profit':
        return (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Profit Report</h3>
            <div className="text-center p-8">
              <p className="text-3xl font-bold text-green-600">
                Rs. {parseFloat(profitData || 0).toFixed(2)}
              </p>
              <p className="text-gray-600 mt-2">Total Profit</p>
              <p className="text-sm text-gray-500 mt-4">
                Period: {startDate} to {endDate}
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      {/* Date Range Selector (for reports that need it) */}
      {(selectedReport === 'purchase' || selectedReport === 'sales' || selectedReport === 'profit') && (
        <div className="bg-white p-4 shadow rounded-lg mb-6">
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <button
                onClick={() => {
                  const today = new Date()
                  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
                  setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
                  setEndDate(new Date().toISOString().split('T')[0])
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Stock Report</h2>
          <p className="text-sm text-gray-600 mb-4">View current stock levels for all items</p>
          <div className="space-y-2">
            <button
              onClick={() => viewReport('stock')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Report
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadPDF('stock')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'PDF'}
              </button>
              <button
                onClick={() => downloadExcel('stock')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Low Stock Items</h2>
          <p className="text-sm text-gray-600 mb-4">Items that are below reorder level</p>
          <div className="space-y-2">
            <button
              onClick={() => viewReport('low-stock')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Report
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadPDF('low-stock')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'PDF'}
              </button>
              <button
                onClick={() => downloadExcel('low-stock')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Purchase Report</h2>
          <p className="text-sm text-gray-600 mb-4">Purchase orders within date range</p>
          <div className="space-y-2">
            <button
              onClick={() => viewReport('purchase')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Report
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadPDF('purchase')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'PDF'}
              </button>
              <button
                onClick={() => downloadExcel('purchase')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Sales Report</h2>
          <p className="text-sm text-gray-600 mb-4">Sales orders within date range</p>
          <div className="space-y-2">
            <button
              onClick={() => viewReport('sales')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Report
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadPDF('sales')}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'PDF'}
              </button>
              <button
                onClick={() => downloadExcel('sales')}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? '...' : 'Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Profit Report</h2>
          <p className="text-sm text-gray-600 mb-4">Profit calculation (Sales - Cost) within date range</p>
          <div className="space-y-2">
            <button
              onClick={() => viewReport('profit')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Report
            </button>
            <button
              onClick={() => downloadPDF('profit')}
              disabled={loading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Data Display */}
      {renderReportData()}
    </div>
  )
}

export default Reports
