import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Header() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-success text-white p-3 mb-4 d-flex justify-content-between align-items-center">
      <h4 className="m-0">NovaTech Solutions Company</h4>

      {isLoggedIn ? (
        <div>
          <span className="me-3">Hello, {user?.fullName}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      ) : (
        <span className="small"></span>
      )}
    </header>
  );
}

export default Header;