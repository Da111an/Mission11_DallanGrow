import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

const LAST_BROWSE_KEY = 'bookstore-last-browse'

function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart()
  const navigate = useNavigate()

  const continueShoppingUrl = useMemo(() => {
    return sessionStorage.getItem(LAST_BROWSE_KEY) || '/'
  }, [])

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Shopping Cart</h1>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => navigate(continueShoppingUrl)}
        >
          Continue Shopping
        </button>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">
          Your cart is empty.{' '}
          <Link to={continueShoppingUrl} className="alert-link">
            Return to the bookstore
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const subtotal = item.book.price * item.quantity
                  return (
                    <tr key={item.book.bookId}>
                      <td>{item.book.title}</td>
                      <td>{item.book.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                      <td style={{ minWidth: '170px' }}>
                        <div className="input-group input-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.book.bookId, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.book.bookId,
                                Math.max(1, Number(e.target.value) || 1),
                              )
                            }
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.book.bookId, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFromCart(item.book.bookId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end">
            <div className="card shadow-sm" style={{ minWidth: '260px' }}>
              <div className="card-body">
                <h2 className="h5">Order Total</h2>
                <p className="mb-0 fs-5 fw-semibold">
                  {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage
