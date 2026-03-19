import './App.css'
import BookList from './components/BookList'

function App() {
  return (
    <main className="container py-4">
      <div className="mb-4">
        <h1 className="display-6 mb-1">Online Bookstore</h1>
        <p className="text-muted mb-0">
          Browse Prof. Hilton&apos;s recommended books with paging and title sorting.
        </p>
      </div>
      <BookList />
    </main>
  )
}

export default App
