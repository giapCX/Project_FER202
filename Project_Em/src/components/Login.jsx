import { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAppContext } from "../provider/AppProvider";

function Login({ onSuccess }) {
  const { employees } = useAppContext();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const found = employees.find(
      (emp) => emp.username === username && emp.password === password
    );

    if (!found) {
      setMessage("Username or password are wrong!");
      return;
    }

    setMessage("");
    login(found);              
    onSuccess?.();
    navigate("/dashboard");
  };

  return (
    <Container>
      <Form onSubmit={handleLogin}>
        {message && (
          <Alert variant="danger" className="mt-2">
            {message}
          </Alert>
        )}

        <Form.Group className="mt-2">
          <Form.Label>UserName</Form.Label>
          <Form.Control
            type="text"
            value={username}
            placeholder="Enter your username"
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mt-2">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            placeholder="Enter your password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="mt-3" variant="success">
          Login
        </Button>
      </Form>
    </Container>
  );
}

export default Login;