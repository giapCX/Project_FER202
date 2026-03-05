import { useAppContext } from "../provider/AppProvider";
import { Card, Button, Row, Col } from "react-bootstrap";
import { useState } from "react";

import ExpenseRequestForm from "./forms/ExpenseRequestForm";
import LeaveRequestForm from "./forms/LeaveRequestForm";
import InternalTransferForm from "./forms/InternalTransferForm";

function ServiceForms() {
  const { forms } = useAppContext();
  const [selectedForm, setSelectedForm] = useState(null);

  return (
    <>
      <Row>
        {forms.map((form) => (
          <Col md={4} key={form.id} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>{form.name}</Card.Title>

                <Button
                  variant="success"
                  onClick={() => setSelectedForm(form)}
                >
                  Tạo đơn
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedForm?.code === "expense_advance_request" && (
        <ExpenseRequestForm />
      )}

      {selectedForm?.code === "leave_application" && (
        <LeaveRequestForm />
      )}

      {selectedForm?.code === "internal_transfer_request" && (
        <InternalTransferForm />
      )}
    </>
  );
}

export default ServiceForms;