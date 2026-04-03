import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { fetchBooks, fetchCategories } from '@/api/booksAPI'
import CartSummary from './CartSummary'
import { useCart } from '../context/useCart'
import type { Book, SortDirection } from '../types'

const LAST_BROWSE_KEY = 'bookstore-last-browse'

function BookList() {
  const { addToCart } = useCart()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const page = Number(searchParams.get('page') ?? '1') || 1
  const pageSize = Number(searchParams.get('pageSize') ?? '5') || 5
  const sort = (searchParams.get('sort') as SortDirection) || 'asc'
  const selectedCategories = searchParams.getAll('category')

  const updateQuery = useCallback((next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const toggleCategory = useCallback((categoryName: string) => {
    const params = new URLSearchParams(searchParams)
    const current = params.getAll('category')
    const updated = current.includes(categoryName)
      ? current.filter((item) => item !== categoryName)
      : [...current, categoryName]

    params.delete('category')
    updated.forEach((item) => params.append('category', item))
    params.set('page', '1')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const browseUrl = `${location.pathname}${location.search}`
    sessionStorage.setItem(LAST_BROWSE_KEY, browseUrl)
  }, [location.pathname, location.search])

  useEffect(() => {
    const abortController = new AbortController()

    const loadCategories = async () => {
      try {
        const data = await fetchCategories(abortController.signal)
        setCategories(data)
      } catch {
        if (!abortController.signal.aborted) {
          setCategories([])
        }
      }
    }

    loadCategories()
    return () => abortController.abort()
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    const loadBooks = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchBooks(
          { page, pageSize, sort, categories: selectedCategories },
          abortController.signal,
        )
        setBooks(data.books)
        setTotalItems(data.pagination.totalItems)
        setTotalPages(data.pagination.totalPages)
      } catch {
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
  }, [page, pageSize, sort, selectedCategories.join(',')])

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      updateQuery({ page: String(totalPages) })
    }
  }, [page, totalPages, updateQuery])

  const startItem = useMemo(() => {
    if (totalItems === 0) {
      return 0
    }
    return (page - 1) * pageSize + 1
  }, [page, pageSize, totalItems])

  const endItem = useMemo(() => Math.min(page * pageSize, totalItems), [page, pageSize, totalItems])

  return (
    <div className="row g-3">
      <aside className="col-12 col-lg-3">
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h5 mb-0">Filters</h2>
              <button
                className="btn btn-sm btn-outline-secondary"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#categoryFilterPanel"
                aria-expanded="true"
                aria-controls="categoryFilterPanel"
              >
                Toggle
              </button>
            </div>
            <div className="collapse show" id="categoryFilterPanel">
              <p className="form-label mb-2">
                Categories ({selectedCategories.length} selected)
              </p>
              <div className="vstack gap-2 mb-2">
                {categories.map((item) => (
                  <div key={item} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`category-${item.replace(/\s+/g, '-').toLowerCase()}`}
                      checked={selectedCategories.includes(item)}
                      onChange={() => toggleCategory(item)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`category-${item.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
                  const params = new URLSearchParams(searchParams)
                  params.delete('category')
                  params.set('page', '1')
                  setSearchParams(params)
                }}
              >
                Clear filter
              </button>
            </div>
          </div>
        </div>

        <CartSummary />
      </aside>

      <section className="col-12 col-lg-9">
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
                      updateQuery({
                        pageSize: String(Number(e.target.value)),
                        page: '1',
                      })
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
                      updateQuery({
                        sort: e.target.value,
                        page: '1',
                      })
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
                    <th></th>
                    <th>Price</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>ISBN</th>
                    <th>Classification</th>
                    <th>Category</th>
                    <th>Pages</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        Loading books...
                      </td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        No books found.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book.bookId}>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => addToCart(book)}
                          >
                            Add to Cart
                          </button>
                        </td>
                        <td>
                          {book.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.publisher}</td>
                        <td>{book.isbn}</td>
                        <td>{book.classification}</td>
                        <td>{book.category}</td>
                        <td>{book.pageCount}</td>
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
                  onClick={() => updateQuery({ page: String(Math.max(1, page - 1)) })}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  disabled={isLoading || page >= totalPages}
                  onClick={() => updateQuery({ page: String(Math.min(totalPages, page + 1)) })}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookList
