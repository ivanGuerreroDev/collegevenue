import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Form, FormInput} from "shards-react";

import { Store } from "../flux";
import PageTitle from "../components/common/PageTitle";
import { NavLink } from "react-router-dom";
const moment = require('moment');
const io = require('socket.io-client');

class SystemMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
    }
    this.sendMessage = this.sendMessage.bind(this);
    this.socket = io('http://app.collegevenueapp.com:8081',{
        transports: ['websocket'],
        path: '/chat',
        query: {
          id: 'System',
          user: 1
        }
    });
    
  }
  componentDidMount() {
  } 
  sendMessage(e){
    e.preventDefault();
    var datos = {
        timestamp: moment.utc().valueOf(),
        from_user: 1,
        message: this.state.message,
    }
    this.socket.emit('system message', datos)
  }
  render() {
    
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4 align-items-center">
          <PageTitle sm="4" title="Send a system message" subtitle="System message" className="text-sm-left" />
        </Row>
    
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Send a system message</h6>
              </CardHeader>
              <CardBody className="p-5">
                <Form>
                    <FormInput
                        id="message"
                        type="text"
                        placeholder="Message"
                        onChange={(e) => this.setState({message: e.target.value})}
                        value={this.state.message?this.state.message:null}
                    />
                    <p class="pt-3 text-right"><a href='#' onClick={this.sendMessage}>Send Message</a></p>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default SystemMessage;
