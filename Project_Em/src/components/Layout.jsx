import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="container flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}