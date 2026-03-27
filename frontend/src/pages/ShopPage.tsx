import BookList from '../components/BookList'

function ShopPage() {
  return (
    <main className="container py-4">
      <div className="mb-4">
        <h1 className="display-6 mb-1">Online Bookstore</h1>
        <p className="text-muted mb-0">
          Browse books, filter by category, and add items to your cart.
        </p>
      </div>
      <BookList />
    </main>
  )
}

export default ShopPage
