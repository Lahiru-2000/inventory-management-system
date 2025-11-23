import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FaEdit, FaPlus, FaSave, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { itemService } from '../services/itemService'
import api from '../services/api'

const Items = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const queryClient = useQueryClient()

  const { data: itemsData } = useQuery('items', () =>
    itemService.getAll().then(res => res.data.data)
  )

  const { data: categoriesData } = useQuery('categories', () =>
    api.get('/categories').then(res => res.data.data)
  )

  const createMutation = useMutation(
    (data) => itemService.create(data),
    { onSuccess: () => queryClient.invalidateQueries('items') }
  )

  const updateMutation = useMutation(
    ({ id, data }) => itemService.update(id, data),
    { onSuccess: () => queryClient.invalidateQueries('items') }
  )

  const toggleActiveMutation = useMutation(
    ({ id, data }) => itemService.update(id, data),
    { 
      onSuccess: () => {
        queryClient.invalidateQueries('items')
        queryClient.invalidateQueries('items-active') // Also invalidate active items query
      }
    }
  )

  const items = itemsData || []
  const categories = (categoriesData || []).filter(cat => cat.active === 1 || cat.active === true)

  const handleToggleActive = (item) => {
    const newActiveStatus = (item.active === 1 || item.active === true) ? 0 : 1
    // Update item with all existing data but change active status
    toggleActiveMutation.mutate({ 
      id: item.id, 
      data: {
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        unit: item.unit,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        reorderLevel: item.reorderLevel,
        active: newActiveStatus
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      categoryId: Number(formData.get('categoryId')),
      unit: formData.get('unit'),
      costPrice: parseFloat(formData.get('costPrice')),
      sellingPrice: parseFloat(formData.get('sellingPrice')),
      reorderLevel: parseInt(formData.get('reorderLevel')),
      active: formData.get('active') === 'on' ? 1 : 0
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data })
    } else {
      createMutation.mutate(data)
    }

    setIsModalOpen(false)
    setEditingItem(null)
    e.target.reset()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Item
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoryName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {item.costPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {item.sellingPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    (item.active === 1 || item.active === true) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(item.active === 1 || item.active === true) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                      title="Edit Item"
                    >
                      <FaEdit size={16} />
                    </button>
                    {(item.active === 1 || item.active === true) ? (
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={toggleActiveMutation.isLoading}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deactivate Item"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={toggleActiveMutation.isLoading}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Activate Item"
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
          <div className="relative top-10 md:top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white m-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingItem(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    name="name"
                    placeholder="Enter item name"
                    defaultValue={editingItem?.name}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    name="sku"
                    placeholder="Enter SKU code"
                    defaultValue={editingItem?.sku}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    defaultValue={editingItem?.categoryId}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <input
                    name="unit"
                    placeholder="e.g., kg, pcs, liters, etc"
                    defaultValue={editingItem?.unit}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price (Rs.) *
                  </label>
                  <input
                    name="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    defaultValue={editingItem?.costPrice}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (Rs.) *
                  </label>
                  <input
                    name="sellingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    defaultValue={editingItem?.sellingPrice}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level *
                  </label>
                  <input
                    name="reorderLevel"
                    type="number"
                    min="0"
                    placeholder="Minimum stock level"
                    defaultValue={editingItem?.reorderLevel}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={editingItem?.active === 1 || editingItem?.active === true}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingItem(null)
                  }}
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

export default Items


