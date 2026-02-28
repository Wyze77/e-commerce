import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import SiteFooter from './components/SiteFooter'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Collections from './pages/Collections'
import Lookbook from './pages/Lookbook'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'
import { useStore } from './context/StoreContext'

export default function App() {
  const { state } = useStore()
  const location = useLocation()

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'var(--nav-h)' }}>
        <div key={location.pathname} className="route-transition">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/lookbook" element={<Lookbook />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <SiteFooter />
      <Toast toasts={state.toasts} />
    </>
  )
}
