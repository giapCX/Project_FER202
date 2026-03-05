import { useAppContext } from "../../provider/AppProvider";
import { Card, Row, Col } from "react-bootstrap";

function RequestList() {

  const { requests, forms } = useAppContext();

  return (
    <Row>
      {requests.map((req)=>{

        const form = forms.find(f=>f.id === req.formId);

        return (
          <Col md={4} key={req.id} className="mb-3">

            <Card>
              <Card.Body>

                <Card.Title>{req.title}</Card.Title>

                <p>{form?.name}</p>

                <p>Status: {req.status}</p>

              </Card.Body>
            </Card>

          </Col>
        )

      })}
    </Row>
  );
}

export default RequestList;