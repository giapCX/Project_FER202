import { useState } from "react";
import { Container, Row, Col, Card, Button, Collapse } from "react-bootstrap";
import Login from "../components/Login";

function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Container className="text-center mb-5">
        <h1 className="fw-bold text-success mb-3">Welcome to NovaTech Employee Portal</h1>
        <p className="text-muted mb-4">
          NovaTech Solutions provides a modern internal management system that
          helps departments work more efficiently, reduce paperwork, and
          strengthen employee connections.
        </p>

        <Button
          variant={showLogin ? "secondary" : "outline-success"}
          onClick={() => setShowLogin(!showLogin)}
        >
          {showLogin ? "Hide Login" : "Login"}
        </Button>

        <Row className="g-4 justify-content-center mt-3">
          {[
            {
              title: "Employee Management",
              desc: "Track information, roles, and departments of all employees.",
            },
            {
              title: "Leave & Request Approval",
              desc: "Manage and approve requests such as leave, proposals, and business trips.",
            },
            {
              title: "Reports & Analytics",
              desc: "Aggregate data to help leaders make quicker decisions.",
            },
          ].map((item) => (
            <Col md={4} key={item.title}>
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="fw-bold text-success">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Collapse in={showLogin}>
        <div>
          <Container className="py-2 mb-5">
            <Card className="shadow-sm border-0 mx-auto" style={{ maxWidth: 500 }}>
              <Card.Body>
                <h4 className="text-center fw-bold mb-4 text-success">
                  Employee Login
                </h4>
                <Login onSuccess={() => setShowLogin(false)} />
              </Card.Body>
            </Card>
          </Container>
        </div>
      </Collapse>
    </>
  );
}

export default HomePage;