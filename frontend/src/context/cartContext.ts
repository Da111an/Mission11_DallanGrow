import { createContext } from 'react'
import type { Book, CartItem } from '../types'

export interface CartContextValue {
  items: CartItem[]
  addToCart: (book: Book) => void
  updateQuantity: (bookId: number, quantity: number) => void
  removeFromCart: (bookId: number) => void
  totalItems: number
  totalPrice: number
}

export const CartContext = createContext<CartContextValue | undefined>(undefined)
