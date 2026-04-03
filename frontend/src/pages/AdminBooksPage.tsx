import { useCallback, useEffect, useState } from 'react'
import {
  fetchBooks,
  createBook,
  updateBook,
  deleteBook,
} from '@/api/booksAPI'
import type { Book } from '../types'

const emptyBook: Omit<Book, 'bookId'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<Omit<Book, 'bookId'>>(emptyBook)
  const [showForm, setShowForm] = useState(false)

  const loadBooks = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchBooks({ pageSize: 100 })
      setBooks(data.books)
    } catch {
      setError('Unable to load books.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pageCount' ? Number(value) : name === 'price' ? Number(value) : value,
    }))
  }

  const openAddForm = () => {
    setEditingBook(null)
    setFormData(emptyBook)
    setShowForm(true)
  }

  const openEditForm = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingBook(null)
    setFormData(emptyBook)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (editingBook) {
        await updateBook(editingBook.bookId, formData)
      } else {
        await createBook(formData)
      }
      cancelForm()
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
    }
  }

  const handleDelete = async (bookId: number) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return
    setError('')

    try {
      await deleteBook(bookId)
      await loadBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  const fields: { label: string; name: keyof Omit<Book, 'bookId'>; type: string }[] = [
    { label: 'Title', name: 'title', type: 'text' },
    { label: 'Author', name: 'author', type: 'text' },
    { label: 'Publisher', name: 'publisher', type: 'text' },
    { label: 'ISBN', name: 'isbn', type: 'text' },
    { label: 'Classification', name: 'classification', type: 'text' },
    { label: 'Category', name: 'category', type: 'text' },
    { label: 'Page Count', name: 'pageCount', type: 'number' },
    { label: 'Price', name: 'price', type: 'number' },
  ]

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Admin - Manage Books</h1>
        {!showForm && (
          <button className="btn btn-success" onClick={openAddForm}>
            + Add Book
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {fields.map((f) => (
                  <div className="col-md-6" key={f.name}>
                    <label htmlFor={f.name} className="form-label">
                      {f.label}
                    </label>
                    <input
                      id={f.name}
                      name={f.name}
                      type={f.type}
                      className="form-control"
                      value={formData[f.name]}
                      onChange={handleChange}
                      required
                      step={f.name === 'price' ? '0.01' : undefined}
                      min={f.type === 'number' ? '0' : undefined}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center py-4">Loading books...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Actions</th>
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
              {books.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.bookId}>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditForm(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(book.bookId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td>{book.isbn}</td>
                    <td>{book.classification}</td>
                    <td>{book.category}</td>
                    <td>{book.pageCount}</td>
                    <td>
                      {book.price.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminBooksPage
