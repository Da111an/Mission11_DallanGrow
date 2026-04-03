import type { Book, BooksResponse, SortDirection } from '@/types'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export interface FetchBooksParams {
  page?: number
  pageSize?: number
  sort?: SortDirection
  categories?: string[]
}

export async function fetchBooks(
  params: FetchBooksParams = {},
  signal?: AbortSignal,
): Promise<BooksResponse> {
  const { page = 1, pageSize = 5, sort = 'asc', categories = [] } = params

  const categoryQuery = categories
    .map((c) => `&category=${encodeURIComponent(c)}`)
    .join('')

  const response = await fetch(
    `${API_BASE_URL}/api/books?page=${page}&pageSize=${pageSize}&sort=${sort}${categoryQuery}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<BooksResponse>
}

export async function fetchCategories(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/books/categories`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<string[]>
}

export async function fetchBookById(id: number): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<Book>
}

export async function createBook(book: Omit<Book, 'bookId'>): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId: 0, ...book }),
  })

  if (!response.ok) {
    throw new Error(`Create failed: ${response.status}`)
  }

  return response.json() as Promise<Book>
}

export async function updateBook(
  id: number,
  book: Omit<Book, 'bookId'>,
): Promise<Book> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId: id, ...book }),
  })

  if (!response.ok) {
    throw new Error(`Update failed: ${response.status}`)
  }

  return response.json() as Promise<Book>
}

export async function deleteBook(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`)
  }
}
