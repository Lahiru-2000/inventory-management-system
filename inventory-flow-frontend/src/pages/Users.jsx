import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { FaEdit, FaPlus, FaSave, FaTimes } from 'react-icons/fa'
import api from '../services/api'

const Users = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const queryClient = useQueryClient()

  const { data: usersData } = useQuery('users', () =>
    api.get('/users').then(res => res.data.data)
  )

  const { data: rolesData } = useQuery('roles', () =>
    api.get('/roles').then(res => res.data.data).catch(() => [])
  )

  const createMutation = useMutation(
    (data) => api.post('/users', data),
    { onSuccess: () => queryClient.invalidateQueries('users') }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/users/${id}`, data),
    { onSuccess: () => queryClient.invalidateQueries('users') }
  )

  const users = usersData || []
  const roles = rolesData || [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'STORE_MANAGER' },
    { id: 3, name: 'STAFF' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      fullName: formData.get('fullName'),
      roleId: Number(formData.get('roleId')),
      active: formData.get('active') === 'on'
    }

    // Only include password for new users or if it's being changed
    if (!editingUser) {
      const password = formData.get('password')
      if (password) {
        data.password = password
      }
    } else {
      // For editing, only include password if provided (password change)
      const password = formData.get('password')
      if (password && password.trim() !== '') {
        data.password = password
      }
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data })
    } else {
      createMutation.mutate(data)
    }

    setIsModalOpen(false)
    setEditingUser(null)
    e.target.reset()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add User
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.roleName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.active ? 'Active' : 'Inactive'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingUser(user)
                      setIsModalOpen(true)
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                    title="Edit User"
                  >
                    <FaEdit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input 
                    name="username" 
                    placeholder="Enter username" 
                    defaultValue={editingUser?.username} 
                    required 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input 
                    name="fullName" 
                    placeholder="Enter full name" 
                    defaultValue={editingUser?.fullName} 
                    required 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter email address" 
                    defaultValue={editingUser?.email} 
                    required 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editingUser ? '' : '*'}
                  </label>
                  <input 
                    name="password" 
                    type="password" 
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"} 
                    required={!editingUser}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  {!editingUser && (
                    <p className="mt-1 text-xs text-gray-500">
                      If no password is provided, default password will be: <strong>password123</strong>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select 
                    name="roleId" 
                    defaultValue={editingUser?.roleId} 
                    required 
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      name="active" 
                      type="checkbox" 
                      defaultChecked={editingUser?.active !== false} 
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingUser(null) }} 
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

export default Users


