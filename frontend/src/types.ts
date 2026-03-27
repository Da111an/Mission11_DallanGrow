export type SortDirection = 'asc' | 'desc'

export interface Book {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

export interface BooksResponse {
  books: Book[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export interface CartItem {
  book: Book
  quantity: number
}
