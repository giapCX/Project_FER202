import { useState } from "react";
import { useAppContext } from "../../provider/AppProvider";
import { Table, Button, Form, Modal } from "react-bootstrap";
import { jsPDF } from "jspdf";
function RequestList() {
  const { requests, forms } = useAppContext();

  const [selectedForm, setSelectedForm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [show, setShow] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleClose = () => setShow(false);

  const handleView = (req) => {
    setSelectedRequest(req);
    setShow(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (!selectedForm) return true;
    return String(req.formId) === String(selectedForm);
  });

  const getTimeValue = (value) => {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  filteredRequests.sort((a, b) => {
    const aTime = getTimeValue(a?.[sortBy]);
    const bTime = getTimeValue(b?.[sortBy]);
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  const getFormName = (id) => {
    return forms.find((f) => String(f.id) === String(id))?.name;
  };
  const handleExport = () => {
    if (!selectedRequest) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Request Detail", 20, 20);

    doc.setFontSize(12);
    doc.text(`Title: ${selectedRequest.title}`, 20, 40);
    doc.text(`Form: ${getFormName(selectedRequest.formId)}`, 20, 50);
    doc.text(`Status: ${selectedRequest.status}`, 20, 60);
    doc.text(`Created At: ${selectedRequest.createdAt}`, 20, 70);

    let y = 90;

    doc.text("Fields:", 20, y);
    y += 10;

    Object.entries(selectedRequest.fields).forEach(([key, value]) => {
      const text = `${key}: ${Array.isArray(value) ? value.join(", ") : value}`;

      doc.text(text, 20, y);
      y += 10;
    });

    doc.save(`request_${selectedRequest.id}.pdf`);
  };
  return (
    <>
      {/* FILTER */}
      <Form.Group className="mb-3 w-25">
        <Form.Label>Lọc theo loại đơn</Form.Label>

        <Form.Select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
        >
          <option value="">Tất cả</option>

          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* SORT */}
      <div className="d-flex gap-3 align-items-end mb-3 flex-wrap">
        <Form.Group className="w-25" style={{ minWidth: 220 }}>
          <Form.Label>Sort theo</Form.Label>
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">createdAt</option>
            <option value="updatedAt">updatedAt</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="w-25" style={{ minWidth: 220 }}>
          <Form.Label>Thứ tự</Form.Label>
          <Form.Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Mới → Cũ</option>
            <option value="asc">Cũ → Mới</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* TABLE */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Form</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredRequests.map((req) => (
            <tr key={req.id}>
              <td>{req.title}</td>

              <td>{getFormName(req.formId)}</td>

              <td>{req.status}</td>

              <td>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleView(req)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* MODAL DETAIL */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedRequest && (
            <>
              <p>
                <b>Title:</b> {selectedRequest.title}
              </p>

              <p>
                <b>Form:</b> {getFormName(selectedRequest.formId)}
              </p>

              <p>
                <b>Status:</b> {selectedRequest.status}
              </p>

              <p>
                <b>Created At:</b> {selectedRequest.createdAt}
              </p>

              <hr />

              <h6>Fields</h6>

              {Object.entries(selectedRequest.fields).map(([key, value]) => (
                <p key={key}>
                  <b>{key}:</b>{" "}
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </p>
              ))}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" onClick={handleExport}>
            Export PDF
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RequestList;
