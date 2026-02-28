import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const StoreContext = createContext(null)

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

const initialState = {
  cart: load('cart', []),
  wishlist: load('wishlist', []),
  toasts: [],
}

let toastId = 0

function reducer(state, action) {
  switch (action.type) {

    case 'ADD_TO_CART': {
      const { product, color, size, qty = 1 } = action.payload
      const key = `${product.id}-${color}-${size}`
      const existing = state.cart.find(i => i.key === key)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(i =>
            i.key === key ? { ...i, qty: i.qty + qty } : i
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { key, product, color, size, qty }],
      }
    }

    case 'UPDATE_QTY': {
      return {
        ...state,
        cart: state.cart.map(i =>
          i.key === action.payload.key ? { ...i, qty: action.payload.qty } : i
        ),
      }
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(i => i.key !== action.payload) }

    case 'CLEAR_CART':
      return { ...state, cart: [] }

    case 'TOGGLE_WISHLIST': {
      const id = action.payload
      const inList = state.wishlist.includes(id)
      return {
        ...state,
        wishlist: inList ? state.wishlist.filter(x => x !== id) : [...state.wishlist, id],
      }
    }

    case 'REMOVE_WISHLIST':
      return { ...state, wishlist: state.wishlist.filter(x => x !== action.payload) }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }

    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cart))
  }, [state.cart])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist))
  }, [state.wishlist])

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastId
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000)
  }, [])

  return (
    <StoreContext.Provider value={{ state, dispatch, toast }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
