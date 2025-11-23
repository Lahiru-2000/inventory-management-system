import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaEye } from 'react-icons/fa'
import api from '../services/api'

const GRNs = () => {
  const navigate = useNavigate()

  const { data: grnsData } = useQuery('grns', () =>
    api.get('/grns').then(res => res.data.data)
  )

  const grns = grnsData || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Goods Receive Notes (GRNs)</h1>
        <button
          onClick={() => navigate('/grns/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create GRN
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GRN Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receive Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {grns.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No GRNs found. Click "Create GRN" to add one.
                </td>
              </tr>
            ) : (
              grns.map((grn) => (
                <tr key={grn.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grn.grnNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grn.poNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grn.receiveDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grn.receivedByName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/grns/${grn.id}`)}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                      title="View GRN"
                    >
                      <FaEye size={16} />
                    </button>
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

export default GRNs
