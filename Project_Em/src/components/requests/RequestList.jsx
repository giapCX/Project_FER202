import { useState } from "react";
import { useAppContext } from "../../provider/AppProvider";
import { Table, Button, Form } from "react-bootstrap";

function RequestList() {
  const { requests, forms } = useAppContext();
  const [selectedForm, setSelectedForm] = useState("");

  const filteredRequests = requests.filter((req) => {
    if (!selectedForm) return true;
    return String(req.formId) === String(selectedForm);
  });

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
          {filteredRequests.map((req) => {
            const form = forms.find(
              (f) => String(f.id) === String(req.formId)
            );

            return (
              <tr key={req.id}>
                <td>{req.title}</td>
                <td>{form?.name}</td>
                <td>{req.status}</td>
                <td>
                  <Button size="sm">View</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

export default RequestList;