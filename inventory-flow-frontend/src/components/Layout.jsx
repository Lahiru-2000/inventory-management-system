import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false)

  // Auto-open reports dropdown if on a report page
  useEffect(() => {
    if (location.pathname.startsWith('/reports') && location.pathname !== '/reports') {
      setReportsDropdownOpen(true)
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuSections = [
    {
      title: 'Dashboard',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { path: '/items', label: 'Items', icon: '📦' },
        { path: '/categories', label: 'Categories', icon: '📁' },
        { path: '/stock', label: 'Stock', icon: '📊' }
      ]
    },
    {
      title: 'Purchase',
      items: [
        { path: '/suppliers', label: 'Suppliers', icon: '🏢' },
        { path: '/purchase-orders', label: 'Purchase Orders', icon: '🛒' },
        { path: '/grns', label: 'GRNs', icon: '📥' }
      ]
    },
    {
      title: 'Sales',
      items: [
        { path: '/sales-orders', label: 'Sales Orders', icon: '💰' },
        { path: '/gins', label: 'GINs', icon: '📤' },
        { path: '/invoices', label: 'Invoices', icon: '🧾' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { path: '/reports/stock', label: 'Stock Report', icon: '📦' },
        { path: '/reports/low-stock', label: 'Low Stock Report', icon: '⚠️' },
        { path: '/reports/purchase', label: 'Purchase Report', icon: '🛒' },
        { path: '/reports/sales', label: 'Sales Report', icon: '💰' },
        { path: '/reports/profit', label: 'Profit Report', icon: '📊' }
      ]
    }
  ]

  // Add Administration section for admin users
  if (user?.role === 'ADMIN') {
    menuSections.push({
      title: 'Administration',
      items: [
        { path: '/users', label: 'Users', icon: '👥' }
      ]
    })
  }

  // Flatten all menu items for finding active route in header
  const allMenuItems = menuSections.flatMap(section => section.items)

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white shadow-lg fixed h-full z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">InventoryFlow</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6 px-3">
              {menuSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Header */}
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  {/* Section Menu Items */}
                  {section.title === 'Reports' ? (
                    <div className="mt-2">
                      <button
                        onClick={() => setReportsDropdownOpen(!reportsDropdownOpen)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          section.items.some(item => isActive(item.path))
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-lg">📈</span>
                          <span>Reports</span>
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform ${reportsDropdownOpen ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {reportsDropdownOpen && (
                        <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                          {section.items.map((item) => {
                            const active = isActive(item.path)
                            return (
                              <li key={item.path}>
                                <Link
                                  to={item.path}
                                  onClick={() => {
                                    setSidebarOpen(false)
                                    setReportsDropdownOpen(false)
                                  }}
                                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                    active
                                      ? 'bg-blue-50 text-blue-600 font-medium'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }`}
                                >
                                  <span className="mr-2 text-sm">{item.icon}</span>
                                  <span>{item.label}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <ul className="space-y-1 mt-2">
                      {section.items.map((item) => {
                        const active = isActive(item.path)
                        return (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                active
                                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <span className="mr-3 text-lg">{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Logout Button at Bottom */}
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 w-full lg:w-auto">
        {/* Top Header Bar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  {(() => {
                    const activeItem = allMenuItems.find(item => isActive(item.path))
                    if (activeItem) return activeItem.label
                    
                    if (location.pathname.startsWith('/reports') && location.pathname !== '/reports') {
                      const reportName = location.pathname.split('/').pop()
                      const formatted = reportName.split('-').map(w => 
                        w.charAt(0).toUpperCase() + w.slice(1)
                      ).join(' ')
                      return formatted + ' Report'
                    }
                    
                    return 'Dashboard'
                  })()}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* User Details */}
                <div className="hidden md:flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <FaUserCircle className="text-gray-500 text-xl" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</span>
                    <span className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ') || 'Role'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout


