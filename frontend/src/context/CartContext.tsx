import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Book, CartItem } from '../types'
import type { CartContextValue } from './cartContext'
import { CartContext } from './cartContext'

const CART_STORAGE_KEY = 'bookstore-cart'

function getStoredCart(): CartItem[] {
  const raw = sessionStorage.getItem(CART_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getStoredCart())

  useEffect(() => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (book: Book) => {
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.book.bookId === book.bookId)
      if (existing) {
        return currentItems.map((item) =>
          item.book.bookId === book.bookId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentItems, { book, quantity: 1 }]
    })
  }

  const updateQuantity = (bookId: number, quantity: number) => {
    setItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.book.bookId !== bookId)
      }

      return currentItems.map((item) =>
        item.book.bookId === bookId ? { ...item, quantity } : item,
      )
    })
  }

  const removeFromCart = (bookId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.book.bookId !== bookId))
  }

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.book.price * item.quantity, 0),
    [items],
  )

  const value: CartContextValue = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
