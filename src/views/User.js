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
      user:{}
    }
    this.updateUser = this.updateUser.bind(this);
    this.createUser = this.createUser.bind(this);
  }
  callAPI() {
    const id = this.state.idUser
      fetch(`/api/user/${id}`)
        .then(res => res.json())
        .then(res => {
          this.setState({ user: res[0] })
        });
  }
  
  checkInputs() {
    if(this.state.user) return false
    for (var key in this.state.user) {
        if (obj[key] !== null && obj[key] != "")
            return false;
    } 
    return true;
  } 
  updateUser(e){
    e.preventDefault();
    if(this.checkInputs()){
      var data = this.state.user
      data.id = this.state.idUser
      fetch(`/api/user/`, { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers:{
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
      .then(res => res.json())
      .then(res => {
        this.setState(res)
        this.callAPI()
      }).catch((err) => {
        if (!this.quiet) console.error(err)
        throw err;
      });
    }else{
      this.setState({error: 'Please fill in all fields.'})
    }
  } 
  createUser(e){
    e.preventDefault();
    if(this.checkInputs()){
      const data = this.state.user
      fetch(`/api/user/create`, { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers:{
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
      .then(res => res.json())
      .then(res => {
        this.setState(res)  
      }).catch((err) => {
        if (!this.quiet) console.error(err)
        throw err;
      });
    }else{
      this.setState({error: 'Please fill in all fields.'})
    }
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
    this.state.user[s] = e.target.value;
    this.setState({refresh : true});
  }
  handleButtonSend(){
    if(this.props.match.params.id){
      return (<Button type="submit" onClick={this.updateUser}>Update Account</Button>)
    }else{
      return (<Button type="submit" onClick={this.createUser}>Create Account</Button>)
    }
  }
  renderMessagge(){
    if(this.state.notice){
      return(<p className="text-success pt-3">{this.state.notice}</p>)
    }else if(this.state.error){
      return(<p className="text-warning pt-3">{this.state.error}</p>)
    }
  }


  componentDidMount() { 
    if(this.props.match.params.id){
      this.callAPI(); 
      this.setState({subtitle: 'Edit data user', title: 'User', titleCard: 'Edit User', idUser: this.props.match.params.id,})
    }else{
      this.setState({subtitle: 'Create user', title: 'User', titleCard: 'User Info'})
    } 
  }

  
  render() {
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={this.state.title} subtitle={this.state.subtitle} className="text-sm-left" />
         
        </Row>
    
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">{this.state.titleCard}</h6>
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
                                onChange={(e) => this.changeInput(e,'displayName')}
                                value={this.state.user.displayName?this.state.user.displayName:null}
                              />
                            </Col>
                            <Col md="6" className="form-group">
                              <label htmlFor="feEmailAddress">Email</label>
                              <FormInput
                                id="feEmailAddress"
                                type="email"
                                placeholder="Email"
                                onChange={(e) => this.changeInput(e,'correo')}
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
                                onChange={(e) => this.changeInput(e,'user')}
                                value={this.state.user.user?this.state.user.user:null}
                              />
                            </Col>
                            <Col md="6">
                              <label htmlFor="fePassword">Password</label>
                              <FormInput
                                id="fePassword"
                                type="password"
                                onChange={(e) => this.changeInput(e,'password')}
                                value={this.state.user.password?this.state.user.password:null}
                                placeholder="Password"
                              />
                            </Col>
                          </Row> 
                          <Row form>
                            <Col md="6" className="form-group">
                              <label htmlFor="feInputState">Privilege</label>
                              <FormSelect id="feInputState" onChange={(e)=>this.handleChange(e,'privilege')}>
                                <option selected={this.selectPrivilege('admin')} >admin</option>
                                <option selected={this.selectPrivilege('user')}>user</option>
                                <option selected={this.selectPrivilege('intern')}>intern</option>
                              </FormSelect>
                            </Col>
                            
                          </Row>

                          {this.handleButtonSend()}
                          {this.renderMessagge()}
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
