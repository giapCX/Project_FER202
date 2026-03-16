import { useState } from "react";
import { Table, Card, Form } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function RequestHistory() {

  const { requests, forms } = useAppContext();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const historyRequests = requests.filter(
    (req) => req.status === "approved" || req.status === "rejected"
  );

  const getTimeValue = (value) => {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  historyRequests.sort((a, b) => {
    const aTime = getTimeValue(a?.[sortBy]);
    const bTime = getTimeValue(b?.[sortBy]);
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  return (
    <Card className="mt-3">

      <Card.Header className="bg-dark text-white">
        Lịch sử đơn
      </Card.Header>

      <Card.Body>
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

        <Table striped bordered hover>

          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Loại đơn</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>

          <tbody>

            {historyRequests.map((req) => {

              const form = forms.find(f => f.id === req.formId);

              return (
                <tr key={req.id}>

                  <td>{req.id}</td>

                  <td>{req.title}</td>

                  <td>{form?.name}</td>

                  <td>{req.status}</td>

                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>

                </tr>
              );

            })}

          </tbody>

        </Table>

      </Card.Body>

    </Card>
  );
}

export default RequestHistory;