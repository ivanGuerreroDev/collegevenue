import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Col } from "shards-react";

import SidebarMainNavbar from "./SidebarMainNavbar";
import SidebarSearch from "./SidebarSearch";
import SidebarNavItems from "./SidebarNavItems";

import { connect } from 'react-redux'
import { toggleSidebar } from '../../../redux/actions'
//import { Store } from "../../../flux";

class MainSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      menuVisible: this.props.sidebar,
      sidebarNavItems: this.props.sidebarItems
    };
  }

  render() {
    const classes = classNames(
      "main-sidebar",
      "px-0",
      "col-12",
      this.state.menuVisible && "open"
    );

    return (
      <Col
        tag="aside"
        className={classes}
        lg={{ size: 2 }}
        md={{ size: 3 }}
      >
        <SidebarMainNavbar hideLogoText={this.props.hideLogoText} />
        <SidebarSearch />
        <SidebarNavItems />
      </Col>
    );
  }
}

MainSidebar.propTypes = {
  /**
   * Whether to hide the logo text, or not.
   */
  hideLogoText: PropTypes.bool
};

MainSidebar.defaultProps = {
  hideLogoText: false
};

const mapStateToProps = state => ({
  sidebarItems: state.sidebarItems,
  sidebar: state.sidebar
})

const mapDispatchToProps = dispatch => ({
  toggleSidebar: () => dispatch(toggleSidebar())
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainSidebar);
