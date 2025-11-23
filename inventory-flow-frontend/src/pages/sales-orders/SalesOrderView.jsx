import { useQuery } from 'react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus } from 'react-icons/fa'
import api from '../../services/api'

const SalesOrderView = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: so, isLoading, error: soError } = useQuery(
    ['sales-order', id],
    () => api.get(`/sales-orders/${id}`).then(res => res.data.data),
    { enabled: !!id }
  )

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales order...</p>
        </div>
      </div>
    )
  }

  if (soError || !so) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Failed to load sales order</p>
          <button
            onClick={() => navigate('/sales-orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Sales Orders
          </button>
        </div>
      </div>
    )
  }

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
        <span className="text-gray-900">{so.soNumber}</span>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Order Details</h1>
              <p className="text-sm text-gray-500 mt-1">SO Number: {so.soNumber}</p>
            </div>
            <button
              onClick={() => navigate('/sales-orders')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Customer Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                <p className="font-medium">{so.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer Phone</p>
                <p className="font-medium">{so.customerPhone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Customer Address</p>
                <p className="font-medium">{so.customerAddress || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Order Date</p>
              <p className="font-medium">{so.orderDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
              <p className="font-medium">{so.deliveryDate || 'Not set'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                so.status === 'INVOICED' ? 'bg-green-100 text-green-800' :
                so.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                so.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {so.status}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Created By</p>
              <p className="font-medium">{so.createdByName || 'N/A'}</p>
            </div>
          </div>

          {so.remarks && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <div className="px-3 py-2 bg-gray-50 rounded border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{so.remarks}</p>
              </div>
            </div>
          )}

          {/* Order Lines */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            {so.orderLines && so.orderLines.length > 0 ? (
              <div className="border rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {so.orderLines.map((line, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium">{line.itemName || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{line.itemSku || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">{line.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                          Rs. {parseFloat(line.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          Rs. {parseFloat(line.totalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium">
                        Subtotal:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        Rs. {parseFloat(so.totalAmount + (so.discount || 0) - (so.tax || 0)).toFixed(2)}
                      </td>
                    </tr>
                    {so.discount > 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right text-sm text-gray-500">
                          Discount:
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-red-600">
                          -Rs. {parseFloat(so.discount || 0).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {so.tax > 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right text-sm text-gray-500">
                          Tax:
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-500">
                          +Rs. {parseFloat(so.tax || 0).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right text-lg font-bold">
                        Grand Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold">
                        Rs. {parseFloat(so.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center border rounded">
                No items found in this sales order.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {(so.status === 'CONFIRMED' || so.status === 'INVOICED') && (
              <>
                <button
                  onClick={() => {
                    navigate('/gins')
                    setTimeout(() => {
                      alert(`To create GIN for ${so.soNumber}, go to GINs page and select this SO when creating a new GIN.`)
                    }, 100)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaPlus /> Create GIN from this SO
                </button>
                {so.status === 'CONFIRMED' && (
                  <button
                    onClick={() => {
                      navigate('/invoices')
                      setTimeout(() => {
                        alert(`To create Invoice for ${so.soNumber}, go to Invoices page and select this SO when creating a new Invoice.`)
                      }, 100)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <FaPlus /> Create Invoice from this SO
                  </button>
                )}
              </>
            )}
            {so.status === 'DRAFT' && (
              <div className="text-sm text-gray-500 italic">
                Confirm the SO first to create GIN or Invoice.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesOrderView

