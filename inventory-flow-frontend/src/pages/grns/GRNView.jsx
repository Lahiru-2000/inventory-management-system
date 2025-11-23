import { useQuery } from 'react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPrint } from 'react-icons/fa'
import api from '../../services/api'

const GRNView = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: grn, isLoading, error: grnError } = useQuery(
    ['grn', id],
    () => api.get(`/grns/${id}`).then(res => res.data.data),
    { enabled: !!id }
  )

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading GRN...</p>
        </div>
      </div>
    )
  }

  if (grnError || !grn) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Failed to load GRN</p>
          <button
            onClick={() => navigate('/grns')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to GRNs
          </button>
        </div>
      </div>
    )
  }

  const calculateGrandTotal = () => {
    if (!grn?.grnLines) return 0
    return grn.grnLines.reduce((sum, line) => {
      return sum + (parseFloat(line.totalPrice) || 0)
    }, 0)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          .print-content {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="max-w-6xl mx-auto print-content">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-600 no-print">
          <button
            onClick={() => navigate('/grns')}
            className="hover:text-blue-600"
          >
            GRNs
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{grn.grnNumber}</span>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GRN Details</h1>
                <p className="text-sm text-gray-500 mt-1">GRN Number: {grn.grnNumber}</p>
              </div>
              <div className="flex gap-2 no-print">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <FaPrint /> Print
                </button>
                <button
                  onClick={() => navigate('/grns')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                >
                  <FaArrowLeft /> Back
                </button>
              </div>
            </div>
          </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">PO Number</p>
              <p className="font-medium">{grn.poNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Receive Date</p>
              <p className="font-medium">{grn.receiveDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Received By</p>
              <p className="font-medium">{grn.receivedByName || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-xs text-gray-500 mb-1">Supplier</p>
              <p className="font-medium">{grn.supplierName || 'N/A'}</p>
            </div>
          </div>

          {grn.remarks && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <div className="px-3 py-2 bg-gray-50 rounded border">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{grn.remarks}</p>
              </div>
            </div>
          )}

          {/* GRN Lines */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Received Items</h3>
            {grn.grnLines && grn.grnLines.length > 0 ? (
              <div className="border rounded overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ordered</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grn.grnLines.map((line, index) => (
                      <tr key={index} className={line.quantityReceived !== line.quantityOrdered ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium">{line.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{line.itemSku}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">{line.quantityOrdered}</td>
                        <td className={`px-4 py-3 text-sm font-medium text-right ${
                          line.quantityReceived !== line.quantityOrdered ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {line.quantityReceived}
                          {line.quantityReceived !== line.quantityOrdered && (
                            <span className="ml-1 text-xs">(Partial)</span>
                          )}
                        </td>
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
                No items found in this GRN.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default GRNView

