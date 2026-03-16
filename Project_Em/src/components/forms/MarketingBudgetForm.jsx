import { Form, Row, Col } from "react-bootstrap";

function MarketingBudgetForm({ fields, onChange }) {
    return (
        <>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên chiến dịch *</Form.Label>
                        <Form.Control
                            name="campaignName"
                            value={fields.campaignName || ""}
                            onChange={onChange}
                            placeholder="Nhập tên chiến dịch..."
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngân sách (VND) *</Form.Label>
                        <Form.Control
                            type="number"
                            name="budget"
                            value={fields.budget || ""}
                            onChange={onChange}
                            placeholder="Nhập ngân sách..."
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày bắt đầu *</Form.Label>
                        <Form.Control
                            type="date"
                            name="startDate"
                            value={fields.startDate || ""}
                            onChange={onChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày kết thúc *</Form.Label>
                        <Form.Control
                            type="date"
                            name="endDate"
                            value={fields.endDate || ""}
                            onChange={onChange}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>ROI dự kiến (%) *</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.1"
                            name="expectedROI"
                            value={fields.expectedROI || ""}
                            onChange={onChange}
                            placeholder="Nhập ROI dự kiến..."
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Mô tả chiến dịch *</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={fields.description || ""}
                    onChange={onChange}
                    placeholder="Nhập mô tả chi tiết về chiến dịch..."
                    required
                />
            </Form.Group>
        </>
    );
}

export default MarketingBudgetForm;
