import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import type { Product } from '@/types'
import { productNeedsEmail } from '@/lib/utils'

export interface CartItem {
  product: Product
  quantity: number
  targetEmails: string[]
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  totalCount: number
  totalAmount: number
  addToCart: (product: Product, quantity?: number, targetEmails?: string[]) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateSingleEmail: (productId: string, index: number, email: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'fantasy_digital_cart_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e)
    }
    return []
  })

  const [isOpen, setIsOpen] = useState(false)

  // Lưu vào localStorage khi giỏ hàng thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e)
    }
  }, [items])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addToCart = (product: Product, quantity: number = 1, targetEmails?: string[]) => {
    const qty = Math.max(1, Math.min(50, quantity))
    const needsEmail = productNeedsEmail(product)

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id)

      if (existingIndex > -1) {
        // Đã có trong giỏ hàng -> Cập nhật số lượng
        const existing = prevItems[existingIndex]
        const newQty = Math.min(50, existing.quantity + qty)
        const updatedEmails = [...existing.targetEmails]

        if (needsEmail) {
          if (targetEmails && targetEmails.length > 0) {
            targetEmails.forEach((mail) => {
              if (mail) updatedEmails.push(mail)
            })
          }
          while (updatedEmails.length < newQty) {
            updatedEmails.push('')
          }
        }

        const next = [...prevItems]
        next[existingIndex] = {
          ...existing,
          quantity: newQty,
          targetEmails: updatedEmails.slice(0, newQty),
        }
        return next
      }

      // Chưa có trong giỏ hàng -> Thêm mới
      const initialEmails = targetEmails ? [...targetEmails] : []
      if (needsEmail) {
        while (initialEmails.length < qty) {
          initialEmails.push('')
        }
      }

      return [
        ...prevItems,
        {
          product,
          quantity: qty,
          targetEmails: initialEmails.slice(0, qty),
        },
      ]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const qty = Math.min(50, quantity)
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id !== productId) return item

        const needsEmail = productNeedsEmail(item.product)
        const nextEmails = [...item.targetEmails]

        if (needsEmail) {
          while (nextEmails.length < qty) {
            nextEmails.push('')
          }
        }

        return {
          ...item,
          quantity: qty,
          targetEmails: nextEmails.slice(0, qty),
        }
      })
    )
  }

  const updateSingleEmail = (productId: string, index: number, email: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id !== productId) return item
        const nextEmails = [...item.targetEmails]
        nextEmails[index] = email
        return {
          ...item,
          targetEmails: nextEmails,
        }
      })
    )
  }

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        totalCount,
        totalAmount,
        addToCart,
        updateQuantity,
        updateSingleEmail,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
