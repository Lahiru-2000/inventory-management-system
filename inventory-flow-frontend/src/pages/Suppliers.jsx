import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FaEdit, FaPlus, FaSave, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import api from '../services/api'

const Suppliers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const queryClient = useQueryClient()

  const { data: suppliersData } = useQuery('suppliers', () =>
    api.get('/suppliers').then(res => res.data.data)
  )

  const createMutation = useMutation(
    (data) => api.post('/suppliers', data),
    { onSuccess: () => queryClient.invalidateQueries('suppliers') }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/suppliers/${id}`, data),
    { onSuccess: () => queryClient.invalidateQueries('suppliers') }
  )

  const toggleActiveMutation = useMutation(
    ({ id, data }) => api.put(`/suppliers/${id}`, data),
    { 
      onSuccess: () => {
        queryClient.invalidateQueries('suppliers')
        queryClient.invalidateQueries('suppliers-active') // Also invalidate active suppliers query
      }
    }
  )

  const suppliers = suppliersData || []

  const handleToggleActive = (supplier) => {
    const newActiveStatus = (supplier.active === 1 || supplier.active === true) ? 0 : 1
    toggleActiveMutation.mutate({ 
      id: supplier.id, 
      data: {
        name: supplier.name,
        address: supplier.address,
        phone: supplier.phone,
        email: supplier.email,
        active: newActiveStatus
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      active: formData.get('active') === 'on' ? 1 : 0
    }

    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data })
    } else {
      createMutation.mutate(data)
    }

    setIsModalOpen(false)
    setEditingSupplier(null)
    e.target.reset()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Supplier
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{supplier.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    (supplier.active === 1 || supplier.active === true) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(supplier.active === 1 || supplier.active === true) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSupplier(supplier)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                      title="Edit Supplier"
                    >
                      <FaEdit size={16} />
                    </button>
                    {(supplier.active === 1 || supplier.active === true) ? (
                      <button
                        onClick={() => handleToggleActive(supplier)}
                        disabled={toggleActiveMutation.isLoading}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deactivate Supplier"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(supplier)}
                        disabled={toggleActiveMutation.isLoading}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Activate Supplier"
                      >
                        <FaCheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input 
                    name="name" 
                    placeholder="Enter supplier name" 
                    defaultValue={editingSupplier?.name} 
                    required 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea 
                    name="address" 
                    placeholder="Enter supplier address" 
                    defaultValue={editingSupplier?.address} 
                    rows="3"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input 
                    name="phone" 
                    type="tel"
                    placeholder="Enter phone number" 
                    defaultValue={editingSupplier?.phone} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter email address" 
                    defaultValue={editingSupplier?.email} 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={editingSupplier?.active === 1 || editingSupplier?.active === true || editingSupplier === null}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingSupplier(null) }} 
                  className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-gray-50"
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaSave /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Suppliers


