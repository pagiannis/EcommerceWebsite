import { Outlet, ScrollRestoration } from "react-router-dom";
import AnnouncementBar from "../components/layout/AnnouncementBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import NewsletterBanner from "../components/layout/NewsletterBanner";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollRestoration />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <NewsletterBanner />
      <Footer />
    </div>
  );
}
