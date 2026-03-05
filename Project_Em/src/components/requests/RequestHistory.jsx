import { Table, Card } from "react-bootstrap";
import { useAppContext } from "../../provider/AppProvider";

function RequestHistory() {

  const { requests, forms } = useAppContext();

  const historyRequests = requests.filter(
    (req) => req.status === "approved" || req.status === "rejected"
  );

  return (
    <Card className="mt-3">

      <Card.Header className="bg-dark text-white">
        Lịch sử đơn
      </Card.Header>

      <Card.Body>

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