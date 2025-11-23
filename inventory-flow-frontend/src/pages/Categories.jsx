import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FaEdit, FaPlus, FaSave, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import api from '../services/api'

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery('categories', () =>
    api.get('/categories').then(res => res.data.data)
  )

  const createMutation = useMutation(
    (data) => api.post('/categories', data),
    { onSuccess: () => queryClient.invalidateQueries('categories') }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/categories/${id}`, data),
    { onSuccess: () => queryClient.invalidateQueries('categories') }
  )

  const toggleActiveMutation = useMutation(
    ({ id, data }) => api.put(`/categories/${id}`, data),
    { 
      onSuccess: () => {
        queryClient.invalidateQueries('categories')
      }
    }
  )

  const categories = categoriesData || []

  const handleToggleActive = (category) => {
    const newActiveStatus = (category.active === 1 || category.active === true) ? 0 : 1
    toggleActiveMutation.mutate({ 
      id: category.id, 
      data: {
        name: category.name,
        description: category.description,
        active: newActiveStatus
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      active: formData.get('active') === 'on' ? 1 : 0
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data })
    } else {
      createMutation.mutate(data)
    }

    setIsModalOpen(false)
    setEditingCategory(null)
    e.target.reset()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{category.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    (category.active === 1 || category.active === true) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(category.active === 1 || category.active === true) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setIsModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                      title="Edit Category"
                    >
                      <FaEdit size={16} />
                    </button>
                    {(category.active === 1 || category.active === true) ? (
                      <button
                        onClick={() => handleToggleActive(category)}
                        disabled={toggleActiveMutation.isLoading}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Deactivate Category"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleActive(category)}
                        disabled={toggleActiveMutation.isLoading}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Activate Category"
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    name="name"
                    placeholder="Enter category name"
                    defaultValue={editingCategory?.name}
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter category description (optional)"
                    defaultValue={editingCategory?.description}
                    rows="3"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      name="active"
                      type="checkbox"
                      defaultChecked={editingCategory?.active === 1 || editingCategory?.active === true || editingCategory === null}
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
                    setEditingCategory(null)
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

export default Categories


