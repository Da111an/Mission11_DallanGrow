import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

function CartSummary() {
  const { items, totalItems, totalPrice } = useCart()
  const navigate = useNavigate()

  return (
    <>
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h2 className="h5 mb-3">Cart Summary</h2>
          <p className="mb-1">
            Items: <strong>{totalItems}</strong>
          </p>
          <p className="mb-3">
            Total: <strong>{totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong>
          </p>
          <div className="d-grid gap-2">
            <Link className="btn btn-primary" to="/cart">
              Go to Cart
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-toggle="offcanvas"
              data-bs-target="#cartPreviewOffcanvas"
              aria-controls="cartPreviewOffcanvas"
            >
              Quick Cart Preview
            </button>
          </div>
        </div>
      </div>

      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="cartPreviewOffcanvas"
        aria-labelledby="cartPreviewOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h3 className="offcanvas-title h5" id="cartPreviewOffcanvasLabel">
            Cart Preview
          </h3>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {items.length === 0 ? (
            <p className="text-muted">Your cart is empty.</p>
          ) : (
            <>
              <ul className="list-group mb-3">
                {items.map((item) => (
                  <li
                    key={item.book.bookId}
                    className="list-group-item d-flex justify-content-between align-items-start"
                  >
                    <div className="me-2">
                      <div className="fw-semibold">{item.book.title}</div>
                      <small className="text-muted">{item.quantity} x {item.book.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</small>
                    </div>
                    <span className="badge text-bg-primary rounded-pill">
                      {(item.quantity * item.book.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mb-3">
                <strong>Total: {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong>
              </p>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="offcanvas"
                onClick={() => navigate('/cart')}
              >
                Open Full Cart
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSummary
