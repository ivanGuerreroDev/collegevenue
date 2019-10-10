import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Form, FormInput} from "shards-react";

import { Store } from "../flux";
import PageTitle from "../components/common/PageTitle";
import { NavLink } from "react-router-dom";
 
class Domains extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
      userConsult: '',
      redirect: false
    }
    this.addDomain = this.addDomain.bind(this);
    this.deleteDomain = this.deleteDomain.bind(this);
  }
  callAPI() {
    fetch("/api/domains", {
      method: 'POST', 
      headers:{
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    })
        .then(res => res.json())
        .then(res => {
          this.setState({ data: res.data })
        });
  }
  componentDidMount() {
    this.callAPI();
  } 
  addDomain(e){
    e.preventDefault();
    fetch(`/api/domains/add`, { 
        method: 'POST', 
        body: JSON.stringify({
            domain: this.state.domain
        }),
        headers:{
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
      .then(res => res.json())
      .then(res => {
        console.log(res)
        if(res.valid){
            this.callAPI();
            alert(res.message)
        }else{
            alert(res.message)
        }
      }).catch((err) => {
        if (!this.quiet) console.error(err)
        throw err;
      });
  }
  deleteDomain(id){
    var r = confirm("are you sure?");
    if (r == true) {
      fetch(`/api/domains/delete`, { 
        method: 'POST', 
        body: JSON.stringify({
            id: id
        }),
        headers:{
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
      .then(res => res.json())
      .then(res => {
        if(res.valid){
            this.callAPI();
        }else{
            alert('Error cant delete domain')
        }
      }).catch((err) => {
        if (!this.quiet) console.error(err)
        throw err;
      });
    }
    
  }
  render() {
    var data = this.state.data;
    var displayTurtles = data.map((item) =>
      <tr>
        <td>{item.domain}</td>
        <td onClick={() => this.deleteDomain(item.id)} className="btn-link" >Delete</td> 
      </tr> )
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4 align-items-center">
          <PageTitle sm="4" title="List of domains" subtitle="permited domains" className="text-sm-left" />
        </Row>
        <Row noGutters className="page-header py-4 align-items-center">
            <Form>
                <FormInput
                    id="domain"
                    type="text"
                    placeholder="Domain"
                    onChange={(e) => this.setState({domain: e.target.value})}
                    value={this.state.domain?this.state.domain:null}
                />
                <a href='#' onClick={this.addDomain}>Add domain</a>
            </Form>
        </Row>
    
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Domains</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <table className="table mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="border-0">
                        Domain
                      </th>
                      <th scope="col" className="border-0">
                        
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

export default Domains;
