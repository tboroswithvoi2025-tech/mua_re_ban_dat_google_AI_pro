import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import ParticleBackground from '@/components/ParticleBackground'
import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'
import Home from '@/pages/Home'
import AuthCallback from '@/pages/AuthCallback'
import Account from '@/pages/Account'
import Orders from '@/pages/Orders'
import Admin from '@/pages/Admin'
import ProductDetailModal from '@/components/ProductDetailModal'
import OrderModal from '@/components/OrderModal'
import PaymentScreen from '@/components/PaymentScreen'
import type { Product, Order } from '@/types'
import { useAuth } from '@/context/AuthContext'

export default function App() {
  const { user, signInWithGoogle } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderProduct, setOrderProduct] = useState<Product | null>(null)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const navigate = useNavigate()

  const handleSelectProduct = useCallback((p: Product) => setSelectedProduct(p), [])

  const handleBuyProduct = useCallback((p: Product) => {
    if (!user) {
      signInWithGoogle()
      return
    }
    setSelectedProduct(null)
    setOrderProduct(p)
  }, [user, signInWithGoogle])

  const handleOrderCreated = useCallback((order: Order) => {
    setOrderProduct(null)
    setCurrentOrder(order)
    setShowPayment(true)
  }, [])

  const requireAuth = useCallback(() => {
    signInWithGoogle()
  }, [signInWithGoogle])

  const closePayment = useCallback(() => {
    setShowPayment(false)
    setCurrentOrder(null)
  }, [])

  const handlePaymentReported = useCallback(() => {
    // refresh notifications happens via realtime
  }, [])

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <Home
              onSelectProduct={handleSelectProduct}
              onBuyProduct={handleBuyProduct}
            />
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
      </div>

      {/* Global modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuy={handleBuyProduct}
      />
      <OrderModal
        product={orderProduct}
        onClose={() => setOrderProduct(null)}
        onOrderCreated={handleOrderCreated}
        requireAuth={requireAuth}
      />
      <PaymentScreen
        order={currentOrder}
        onClose={closePayment}
        onPaymentReported={handlePaymentReported}
      />
    </div>
  )
}
