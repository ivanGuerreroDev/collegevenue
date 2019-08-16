import React from "react";
import PropTypes from 'prop-types';
import { 
  BrowserRouter as Router, 
  Route,
  browserHistory,
  Link,
  Redirect,
  withRouter
 } from "react-router-dom";
 import { connect } from 'react-redux'
import routes from "./routes";
import withTracker from "./withTracker";

import "bootstrap/dist/css/bootstrap.min.css";
import "./shards-dashboard/styles/shards-dashboards.1.1.0.min.css";


const PrivateRoute = ({component: Component, layout: Layout, authed, ...rest }) => (
  <Route
    {...rest}
    render={routeProps  => authed ? ( 
      <Layout {...routeProps }>
        <Component {...routeProps } />
      </Layout>
    ) : (
      <Redirect
      to={{
        pathname: "/",
        state: { from: routeProps.location }
      }}
    />  
    )}
  />
);

class Root extends React.Component {
  componentDidMount() {
    console.log('rutas montadas');
  }
  render() {
    return (
      <Router  basename={process.env.REACT_APP_BASENAME || ""}>
        <div>
          {routes.map((route, index) => {
            if(route.protected){
              return (
                <PrivateRoute
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  authed={localStorage.getItem('userData')!=''}
                  layout={route.layout}
                  component={route.component}
                />
              )
            }else{
              return (
                <Route
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  component={withTracker(props => {
                    return (
                      <route.layout {...props}>
                        <route.component {...props} />
                      </route.layout>
                    );
                  })}
                />
              );
            }        
          })}
        </div>
      </Router>
    )
  }
} 



Root.propTypes = {
  store: PropTypes.object.isRequired,
};
const mapStateToProps = state => ({ currentUser: state.user });
export default connect(mapStateToProps)(Root);