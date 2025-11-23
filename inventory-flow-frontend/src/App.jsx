import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Items from './pages/Items'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import PurchaseOrders from './pages/PurchaseOrders'
import PurchaseOrderCreate from './pages/purchase-orders/PurchaseOrderCreate'
import PurchaseOrderView from './pages/purchase-orders/PurchaseOrderView'
import GRNs from './pages/GRNs'
import GRNCreate from './pages/grns/GRNCreate'
import GRNView from './pages/grns/GRNView'
import SalesOrders from './pages/SalesOrders'
import SalesOrderCreate from './pages/sales-orders/SalesOrderCreate'
import SalesOrderView from './pages/sales-orders/SalesOrderView'
import GINs from './pages/GINs'
import GINCreate from './pages/gins/GINCreate'
import GINView from './pages/gins/GINView'
import Invoices from './pages/Invoices'
import InvoiceCreate from './pages/invoices/InvoiceCreate'
import InvoiceView from './pages/invoices/InvoiceView'
import Stock from './pages/Stock'
import Reports from './pages/Reports'
import StockReport from './pages/reports/StockReport'
import LowStockReport from './pages/reports/LowStockReport'
import PurchaseReport from './pages/reports/PurchaseReport'
import SalesReport from './pages/reports/SalesReport'
import ProfitReport from './pages/reports/ProfitReport'
import Users from './pages/Users'
import Layout from './components/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="items" element={<Items />} />
              <Route path="categories" element={<Categories />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="purchase-orders/new" element={<PurchaseOrderCreate />} />
              <Route path="purchase-orders/:id/edit" element={<PurchaseOrderCreate />} />
              <Route path="purchase-orders/:id" element={<PurchaseOrderView />} />
              <Route path="grns" element={<GRNs />} />
              <Route path="grns/new" element={<GRNCreate />} />
              <Route path="grns/:id" element={<GRNView />} />
              <Route path="sales-orders" element={<SalesOrders />} />
              <Route path="sales-orders/new" element={<SalesOrderCreate />} />
              <Route path="sales-orders/:id/edit" element={<SalesOrderCreate />} />
              <Route path="sales-orders/:id" element={<SalesOrderView />} />
              <Route path="gins" element={<GINs />} />
              <Route path="gins/new" element={<GINCreate />} />
              <Route path="gins/:id/edit" element={<GINCreate />} />
              <Route path="gins/:id" element={<GINView />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/new" element={<InvoiceCreate />} />
              <Route path="invoices/:id" element={<InvoiceView />} />
              <Route path="stock" element={<Stock />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/stock" element={<StockReport />} />
              <Route path="reports/low-stock" element={<LowStockReport />} />
              <Route path="reports/purchase" element={<PurchaseReport />} />
              <Route path="reports/sales" element={<SalesReport />} />
              <Route path="reports/profit" element={<ProfitReport />} />
              <Route path="users" element={<Users />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App


