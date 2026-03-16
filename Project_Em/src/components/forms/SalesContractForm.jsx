import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

function SalesContractForm({ fields, onChange }) {
    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label>Tên khách hàng / Đối tác <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    name="customerName"
                    value={fields.customerName || ""}
                    onChange={onChange}
                    required
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Giá trị hợp đồng (VND) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="contractValue"
                            value={fields.contractValue ? Number(fields.contractValue).toLocaleString('vi-VN') : ""}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/\D/g, "");
                                onChange({
                                    target: { name: "contractValue", value: rawValue ? rawValue : "" }
                                });
                            }}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Mức chiết khấu (%) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            name="discount"
                            min="0"
                            max="100"
                            step="0.01"
                            value={fields.discount === undefined ? "" : fields.discount}
                            onChange={onChange}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày bắt đầu <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="date"
                            name="contractStartDate"
                            value={fields.contractStartDate || ""}
                            onChange={onChange}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ngày kết thúc <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="date"
                            name="contractEndDate"
                            value={fields.contractEndDate || ""}
                            onChange={onChange}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-4">
                <Form.Label>Ghi chú thêm</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={fields.notes || ""}
                    onChange={onChange}
                    placeholder="Nhập ghi chú nếu có..."
                />
            </Form.Group>
        </>
    );
}

export default SalesContractForm;
