import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { PublicLayout } from "@/components/PublicLayout";
import { StaffRoute } from "@/components/StaffRoute";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { HomePage } from "@/pages/HomePage";
import { ListingDetailPage } from "@/pages/ListingDetailPage";
import { ShopPage } from "@/pages/ShopPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { InventoryCrmPage } from "@/pages/admin/InventoryCrmPage";
import { ListingFormPage } from "@/pages/admin/ListingFormPage";
import { ListingsPage } from "@/pages/admin/ListingsPage";
import { LoginPage } from "@/pages/admin/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:slug" element={<ListingDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        <Route path="admin/login" element={<LoginPage />} />
        <Route path="admin" element={<StaffRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="listings" element={<ListingsPage />} />
            <Route path="listings/new" element={<ListingFormPage />} />
            <Route path="listings/:id" element={<ListingFormPage />} />
            <Route path="inventory" element={<InventoryCrmPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
