import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppProvider from "./provider/AppProvider";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DashBoard from "./pages/DashBoard";
import Profile from "./pages/Profile";
import RequestDetails from "./pages/RequestDetails";

// IMPORT FORM PAGES
import LeaveRequestForm from "./components/forms/LeaveRequestForm";
import ExpenseRequestForm from "./components/forms/ExpenseRequestForm";
import InternalTransferForm from "./components/forms/InternalTransferForm";
import SalesContractRequestForm from "./components/forms/SalesContractRequestForm";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/profile" element={<Profile />} />

            {/* ADD THESE ROUTES */}
            <Route path="/leave" element={<LeaveRequestForm />} />
            <Route path="/expense" element={<ExpenseRequestForm />} />
            <Route path="/transfer" element={<InternalTransferForm />} />
            <Route path="/sales-contract" element={<SalesContractRequestForm />} />
            <Route path="/request/:id" element={<RequestDetails />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
