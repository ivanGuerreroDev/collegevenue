import React from "react";
import { Redirect } from "react-router-dom";
import { Container, Row, Col, Card, CardHeader, CardBody, FormInput, Button } from "shards-react";

import PageTitle from "../components/common/PageTitle";
import { connect } from 'react-redux'
import { userLogin } from '../redux/actions'
const axios = require('axios');

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      user:{},
    }
    this.login = this.login.bind(this);
    this.loginRedux = e => this.props.onLoginRedux(e);
  }
  changeInput(e,s){
    this.state.user[s] = e.target.value;
    this.setState({refresh : true});
  }
  login(){
    const data = this.state.user
    axios({
      method: 'POST',
      url:'/api/login',
      headers:{
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      data: data,
    })
    .then(response => {
      if(response.data.valid){
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        this.loginRedux(response.data.user);
        this.props.history.push('/dashboard')
        this.setState({message: response.data.message})
      }else{ 
        this.setState(response)   
      } 
    })  
    .catch(err => {
      console.log(err, 'Signature not added, try again');
    });
  } 
  render() {
    return (
      <Container fluid className="main-content-container px-4 mt-5">
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4 p-5">
              <CardHeader>
                <h3 className="m-0 text-center">Login</h3>
              </CardHeader>
              <CardBody className="px-md-5 pb-3">
                <p>{this.state.message}</p>
                <FormInput
                  className="mb-2"
                  id="feCorreo"
                  type="text"
                  placeholder="Correo"
                  onChange={(e) => this.changeInput(e,'correo')}
                  value={this.state.user.correo?this.state.user.correo:null}
                />
                <FormInput
                  className="mb-2"
                  id="fePassword"
                  type="password"
                  placeholder="Password"
                  onChange={(e) => this.changeInput(e,'password')}
                  value={this.state.user.password?this.state.user.password:null}
                />  
                <Button className="ml-auto d-block mb-5" type="submit" onClick={this.login}>LOGIN</Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoginRedux: (data) => { 
      dispatch(userLogin(data))
    }
  }
}

const Login = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginScreen)
export default Login;
