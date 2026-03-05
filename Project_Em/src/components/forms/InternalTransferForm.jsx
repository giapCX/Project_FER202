import { useState } from "react";
import { Card, Form, Button, Alert, ListGroup } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function InternalTransferForm() {
  const { createRequest, departments } = useAppContext();

  const [title, setTitle] = useState("");
  const [toDepartment, setToDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFileNames = files.map((file) => file.name);
    setAttachments((prev) => [...new Set([...prev, ...newFileNames])]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !toDepartment || !reason) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    await createRequest(3, title, {
      toDepartment,
      reason,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    alert("Tạo đơn chuyển bộ phận thành công");

    // Reset form
    setTitle("");
    setToDepartment("");
    setReason("");
    setAttachments([]);
    setError("");
  };

  return (
    <Card className="mt-4 shadow-sm">
      <Card.Header className="bg-success text-white">
        Tạo đơn: Internal Transfer Request
      </Card.Header>

      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề đơn *</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Chuyển tới phòng ban *</Form.Label>
            <Form.Select value={toDepartment} onChange={(e) => setToDepartment(e.target.value)} required>
              <option value="">-- Chọn phòng ban --</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Lý do *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </Form.Group>

          {/* Phần chọn file từ máy */}
          <Form.Group className="mb-4">
            <Form.Label>File đính kèm (chọn từ máy tính)</Form.Label>
            <Form.Control type="file" multiple onChange={handleFileSelect} />
            <Form.Text className="text-muted">
              Chọn một hoặc nhiều file. Chỉ tên file sẽ được lưu.
            </Form.Text>

            {attachments.length > 0 && (
              <div className="mt-3">
                <h6>File đã chọn:</h6>
                <ListGroup>
                  {attachments.map((fileName, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                      {fileName}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeAttachment(idx)}
                      >
                        Xóa
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
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