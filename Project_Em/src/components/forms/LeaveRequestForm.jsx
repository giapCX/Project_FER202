import { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function LeaveRequestForm() {

  const { createRequest } = useAppContext();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createRequest(1, title, {
      startDate,
      endDate,
      reason
    });

    alert("Tạo đơn nghỉ phép thành công");
  };

  return (
    <Card className="mt-4">
      <Card.Header className="bg-success text-white">
        Tạo đơn: Leave Application
      </Card.Header>

      <Card.Body>

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề đơn *</Form.Label>
            <Form.Control
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày bắt đầu *</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e)=>setStartDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày kết thúc *</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e)=>setEndDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Lý do</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e)=>setReason(e.target.value)}
            />
          </Form.Group>

          <div className="text-end">
            <Button type="submit" variant="success">
              Gửi đơn
            </Button>
          </div>

        </Form>

      </Card.Body>
    </Card>
  );
}

export default LeaveRequestForm;