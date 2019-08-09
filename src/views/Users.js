import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "shards-react";
import { Store } from "../flux";
import PageTitle from "../components/common/PageTitle";
import { Redirect } from "react-router-dom";

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      users: []
    }
  }
  callAPI() {
    fetch("/api/users")
        .then(res => res.json())
        .then(res => {
          this.setState({ users: res })
        });
  }
  onClickHandler = (id) => {
    <Redirect to="/user/${id}" />
  }

  componentDidMount() {
      this.callAPI();
       
  }
  render() {
    var users = this.state.users;
    const displayTurtles = users.map((item) => <tr className="btn-link" onClick={this.onClickHandler(item.id)}><td>{item.displayName}</td><td>{item.user}</td><td>{item.correo}</td><td>{item.privilege}</td></tr> )
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title="User list" subtitle="Users" className="text-sm-left" />
        </Row>
    
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Active Users</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <table className="table mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="border-0">
                        Nombre
                      </th>
                      <th scope="col" className="border-0">
                        Usuario
                      </th>
                      <th scope="col" className="border-0">
                        correo
                      </th>
                      <th scope="col" className="border-0">
                        Privilege
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayTurtles}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default Users;
