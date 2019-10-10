import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody, Button, Form, FormInput} from "shards-react";

import { Store } from "../flux";
import PageTitle from "../components/common/PageTitle";
import { NavLink } from "react-router-dom";
 
class Posts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
      userConsult: '',
      redirect: false
    }
    this.searchPosts = this.searchPosts.bind(this);
    this.searchPost = this.searchPost.bind(this);
    this.deletePost = this.deletePost.bind(this);
  }
  componentDidMount() {
  } 
  searchPosts(e){
      e.preventDefault()
    fetch(`/api/posts/getPostsByEmail`, { 
        method: 'POST', 
        body: JSON.stringify({
            email: this.state.email
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
            this.setState({data: res.result})
        }else{
            alert(res.error)
        }
      }).catch((err) => {
        if (!this.quiet) console.error(err)
        throw err;
      });
  }
  searchPost(e){
    e.preventDefault()
    fetch(`/api/posts/getOnePost`, { 
        method: 'POST', 
        body: JSON.stringify({ 
            id: this.state.post
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
            this.setState({data: res.result})
        }else{
            alert(res.error)
        }
      }).catch((err) => {
        if (!this.quiet) console.error(err)
        throw err; 
      });
  }
  deletePost(id){
    var r = confirm("are you sure?");
    if (r == true) {
      fetch(`/api/posts/deletePost`, { 
        method: 'POST', 
        body: JSON.stringify({
            post: id
        }),
        headers:{
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      })
      .then(res => res.json())
      .then(res => {
        if(res.valid){
            location.reload();
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
        <td>{item.id}</td>
        <td>{item.text}</td>
        <td>{item.media}</td>
        <td onClick={() => this.deletePost(item.id)} className="btn-link" >Delete</td> 
      </tr> )
    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4 align-items-center">
          <PageTitle sm="4" title="List of posts" subtitle="Posts" className="text-sm-left" />
        </Row>
        <Row noGutters className="page-header py-4 align-items-center">
            <Form className="w-100"> 
              <Row>
                <Col>
                  <FormInput
                      id="user"
                      type="text"
                      placeholder="User email"
                      onChange={(e) => this.setState({email: e.target.value})}
                      value={this.state.email?this.state.email:null}
                  />
                </Col>
                
                <a href='#' onClick={this.searchPosts}>Search posts</a>
                <Col>
                  <FormInput
                      id="post" 
                      type="text"
                      placeholder="Post id"
                      onChange={(e) => this.setState({post: e.target.value})}
                      value={this.state.post?this.state.post:null}
                  />  
                </Col>
                
                <a href='#' onClick={this.searchPost}>Search post</a>
              </Row> 
                
            </Form>
        </Row>
    
        {/* Default Light Table */}
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Posts</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <table className="table mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th scope="col" className="border-0">
                        ID
                      </th>
                      <th scope="col" className="border-0">
                        Text
                      </th>
                      <th scope="col" className="border-0">
                        Media
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

export default Posts;
