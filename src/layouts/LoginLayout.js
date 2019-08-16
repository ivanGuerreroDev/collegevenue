import React from "react";
import PropTypes from "prop-types";
import { Container, Row, Col } from "shards-react";
const LoginLayout = ({ children }) => (
  <Container fluid>
    <Row>
      <Col
        className="main-content p-0"
        lg={{ size: 6, offset: 3 }}
        md={{ size: 8, offset: 2 }}
        sm="12"
        tag="main"
      >
        {children}
      </Col>
    </Row>
  </Container>
);


export default LoginLayout;
