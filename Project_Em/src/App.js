import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppProvider from "./provider/AppProvider";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DashBoard from "./pages/DashBoard";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashBoard />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;