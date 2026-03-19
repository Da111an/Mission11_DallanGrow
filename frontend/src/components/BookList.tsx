import { useEffect, useMemo, useState } from 'react'

type SortDirection = 'asc' | 'desc'

interface Book {
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

interface BooksResponse {
  books: Book[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

const API_BASE_URL = 'http://localhost:5000'

function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sort, setSort] = useState<SortDirection>('asc')
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const abortController = new AbortController()

    const loadBooks = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/books?page=${page}&pageSize=${pageSize}&sort=${sort}`,
          { signal: abortController.signal },
        )

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data: BooksResponse = await response.json()
        setBooks(data.books)
        setTotalItems(data.pagination.totalItems)
        setTotalPages(data.pagination.totalPages)
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError('Unable to load books. Make sure the API is running on localhost:5000.')
          setBooks([])
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadBooks()
    return () => abortController.abort()
  }, [page, pageSize, sort])

  const startItem = useMemo(() => {
    if (totalItems === 0) {
      return 0
    }
    return (page - 1) * pageSize + 1
  }, [page, pageSize, totalItems])

  const endItem = useMemo(() => {
    return Math.min(page * pageSize, totalItems)
  }, [page, pageSize, totalItems])

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-end mb-3">
          <div>
            <h2 className="h4 mb-1">Books</h2>
            <p className="text-muted mb-0">
              Showing {startItem}-{endItem} of {totalItems}
            </p>
          </div>

          <div className="d-flex gap-2">
            <div>
              <label htmlFor="pageSize" className="form-label mb-1">
                Results per page
              </label>
              <select
                id="pageSize"
                className="form-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
              >
                {[5, 10, 15, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="form-label mb-1">
                Sort by title
              </label>
              <select
                id="sort"
                className="form-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortDirection)
                  setPage(1)
                }}
              >
                <option value="asc">A to Z</option>
                <option value="desc">Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>ISBN</th>
                <th>Classification</th>
                <th>Category</th>
                <th>Pages</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Loading books...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.bookId}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td>{book.isbn}</td>
                    <td>{book.classification}</td>
                    <td>{book.category}</td>
                    <td>{book.pageCount}</td>
                    <td>{book.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted">
            Page {totalPages === 0 ? 0 : page} of {totalPages}
          </span>
          <div className="btn-group" role="group" aria-label="Pagination">
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              disabled={isLoading || page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookList
