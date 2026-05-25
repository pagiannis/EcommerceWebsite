import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import AccountLayout from "../layouts/AccountLayout";
import CheckoutLayout from "../layouts/CheckoutLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./guards/ProtectedRoute";
import AdminRoute from "./guards/AdminRoute";
import HomePage from "../pages/HomePage";
import ShopPage from "../pages/ShopPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import AccountPage from "../pages/AccountPage";
import OrdersPage from "../pages/OrdersPage";
import WishlistPage from "../pages/WishlistPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import LogoutPage from "../pages/LogoutPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminBrandsPage from "../pages/admin/AdminBrandsPage";
import AdminProductTypesPage from "../pages/admin/AdminProductTypesPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "product/:productId", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
    ],
  },
  {
    path: "checkout",
    element: <ProtectedRoute />,
    children: [
      {
        element: <CheckoutLayout />,
        children: [{ index: true, element: <CheckoutPage /> }],
      },
    ],
  },
  {
    path: "account",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AccountLayout />,
        children: [
          { index: true, element: <AccountPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "wishlist", element: <WishlistPage /> },
        ],
      },
    ],
  },
  {
    path: "admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "categories", element: <AdminCategoriesPage /> },
          { path: "brands", element: <AdminBrandsPage /> },
          { path: "product-types", element: <AdminProductTypesPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/logout", element: <LogoutPage /> },
]);

export default router;
