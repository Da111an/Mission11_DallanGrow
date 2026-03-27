import './App.css'
import { NavLink, Route, Routes } from 'react-router-dom'
import { useCart } from './context/useCart'
import CartPage from './pages/CartPage'
import ShopPage from './pages/ShopPage'

function App() {
  const { totalItems } = useCart()

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark" data-bs-theme="dark">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            Hilton Bookstore
          </NavLink>
          <div className="d-flex align-items-center gap-2">
            <NavLink className="btn btn-outline-light btn-sm" to="/">
              Shop
            </NavLink>
            <NavLink className="btn btn-warning btn-sm" to="/cart">
              Cart <span className="badge text-bg-dark">{totalItems}</span>
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </>
  )
}

export default App
