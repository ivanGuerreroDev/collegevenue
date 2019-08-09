import React from "react";
import {
  Container, 
  Row, 
  Col, 
  Card,
  CardHeader, 
  CardBody,
  ListGroup,
  ListGroupItem,
  Form,
  FormInput,
  FormGroup,
  FormCheckbox,
  FormSelect,
  Button
} from "shards-react";
import { Store } from "../flux";
import PageTitle from "../components/common/PageTitle";
import { NavLink } from "react-router-dom";

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      user:{
        displayName: null,
        username: null,
        correo: null
      }
    }
  }
  callAPI() {
    const { id } = this.props.match.params
    fetch(`/api/user/${id}`)
        .then(res => res.json())
        .then(res => {
          this.setState({ user: res[0] })
        });
  }
  updateUser(){
    const { id } = this.props.match.params
    const data = this.state.user
    fetch(`/api/user/${id}`, { method: 'POST', body: JSON.stringify(data),headers:{'Content-Type': 'application/json'}})
        .then(res => res.json())
        .then(res => {
          this.setState(res)
          this.callAPI()
        });
  }
  selectPrivilege(v){
    if(this.state.user.privilege==v){
      return true
    }else{
      return false
    }
  }
  handleChange(e,s){
    var value = e.target.value;
    this.state.user[s] = value
    this.setState({refresh : true});
  }
  changeInput(e,s){
    this.state.user[s] = e;
    this.setState({refresh : true});
  }
  componentDidMount() {
      this.callAPI();       
  }
  render() {
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title="Edit data user" subtitle="User" className="text-sm-left" />
        </Row>
    
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Edit User</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <ListGroup flush>
                  <ListGroupItem className="p-3">
                    <Row>
                      <Col>
                        <Form>
                          <Row form>
                            <Col md="6">
                              <label htmlFor="feDisplayName">Display Name</label>
                              <FormInput
                                id="feDisplayName"
                                type="text"
                                placeholder="Display Name"
                                onChangeText={(e) => this.changeInput(e,'displayName')}
                                value={this.state.user.displayName?this.state.user.displayName:null}
                              />
                            </Col>
                            <Col md="6" className="form-group">
                              <label htmlFor="feEmailAddress">Email</label>
                              <FormInput
                                id="feEmailAddress"
                                type="email"
                                placeholder="Email"
                                onChangeText={(e) => this.changeInput(e,'correo')}
                                value={this.state.user.correo?this.state.user.correo:null}
                              />
                            </Col>
                            
                          </Row>
                          <Row form>
                            <Col md="6" className="form-group">
                              <label htmlFor="feUsername">Username</label>
                              <FormInput
                                id="feUsername"
                                type="text"
                                placeholder="Username"
                                onChangeText={(e) => this.changeInput(e,'user')}
                                value={this.state.user.user?this.state.user.user:null}
                              />
                            </Col>
                            <Col md="6">
                              <label htmlFor="fePassword">Password</label>
                              <FormInput
                                id="fePassword"
                                type="password"
                                onChangeText={(e) => this.changeInput(e,'password')}
                                placeholder="Password"
                              />
                            </Col>
                          </Row> 
                          <Row form>
                            <Col md="6" className="form-group">
                              <label htmlFor="feInputState">Privilege</label>
                              <FormSelect id="feInputState" onChange={(e)=>this.handleChange(e,'privilege')}>
                                <option selected={this.selectPrivilege('admin')} >Admin</option>
                                <option selected={this.selectPrivilege('user')}>User</option>
                                <option selected={this.selectPrivilege('intern')}>Intern</option>
                              </FormSelect>
                            </Col>
                            
                          </Row>

                         
                          <Button type="submit" onPress={this.updateUser}>Update Account</Button>
                        </Form>
                      </Col>
                    </Row>
                  </ListGroupItem>
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default User;
