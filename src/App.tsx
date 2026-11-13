import { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ParticleBackground from '@/components/ParticleBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import Payment from '@/pages/Payment'
import Contact from '@/pages/Contact'
import AuthCallback from '@/pages/AuthCallback'
import Account from '@/pages/Account'
import Orders from '@/pages/Orders'
import Admin from '@/pages/Admin'
import ProductDetailModal from '@/components/ProductDetailModal'
import OrderModal from '@/components/OrderModal'
import CartDrawer from '@/components/CartDrawer'
import type { Product, Order } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function App() {
  const { user, signInWithGoogle } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderProduct, setOrderProduct] = useState<Product | null>(null)
  const navigate = useNavigate()

  const handleSelectProduct = useCallback((p: Product) => setSelectedProduct(p), [])

  const handleBuyProduct = useCallback((p: Product) => {
    setSelectedProduct(null)
    setOrderProduct(p)
  }, [])

  const handleOrderCreated = useCallback(
    (order: Order) => {
      setOrderProduct(null)
      navigate(`/payment/${order.order_code}`)
    },
    [navigate]
  )

  return (
    <div className="relative min-h-screen text-gray-200">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Navigate to="/" replace />} />
            <Route
              path="/products"
              element={<Products onSelectProduct={handleSelectProduct} onBuyProduct={handleBuyProduct} />}
            />
            <Route path="/payment/:orderCode" element={<Payment />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer />
      </div>

      {/* Global modals */}
      <CartDrawer />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuy={handleBuyProduct}
      />
      <OrderModal
        product={orderProduct}
        onClose={() => setOrderProduct(null)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  )
}
