import { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function InternalTransferForm() {

  const { createRequest, departments } = useAppContext();

  const [title, setTitle] = useState("");
  const [toDepartment, setToDepartment] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createRequest(3, title, {
      toDepartment,
      reason
    });

    alert("Tạo đơn chuyển bộ phận thành công");
  };

  return (
    <Card className="mt-4">

      <Card.Header className="bg-success text-white">
        Tạo đơn: Internal Transfer Request
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
            <Form.Label>Chuyển tới phòng ban *</Form.Label>

            <Form.Select
              value={toDepartment}
              onChange={(e)=>setToDepartment(e.target.value)}
            >

              <option value="">-- Chọn phòng ban --</option>

              {departments.map((dep)=>(
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}

            </Form.Select>

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

export default InternalTransferForm;