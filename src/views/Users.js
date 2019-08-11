import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody, Button} from "shards-react";

import { Store } from "../flux";
import PageTitle from "../components/common/PageTitle";
import { NavLink } from "react-router-dom";

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      users: [],
      userConsult: '',
      redirect: false
    }
  }
  callAPI() {
    fetch("/api/users")
        .then(res => res.json())
        .then(res => {
          this.setState({ users: res })
        });
  }
  componentDidMount() {
    this.callAPI();
  }
  render() {
    var users = this.state.users;
    const displayTurtles = users.map((item) =>
      <tr className="btn-link">
        <td><NavLink to={`/user/${item.id}`}>{item.displayName}</NavLink></td>
        <td><NavLink to={`/user/${item.id}`}>{item.user}</NavLink></td>
        <td><NavLink to={`/user/${item.id}`}>{item.correo}</NavLink></td>
        <td><NavLink to={`/user/${item.id}`}>{item.privilege}</NavLink></td>
      </tr> )
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4 align-items-center">
          <PageTitle sm="4" title="User list" subtitle="Users" className="text-sm-left" />
          <Col sm="8" className="text-right"><Button href='/user/'>Create user</Button></Col>
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
