import React, { Component } from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { pushRouterState } from 'react-router-maa';
import './top-nav.component.css';

class TopNav extends Component {
  constructor(props) {
    super(props);

    this.goToHomePage = this.goToHomePage.bind(this);
    this.goToAboutPage = this.goToAboutPage.bind(this);
    this.goToProductsPage = this.goToProductsPage.bind(this);
  }

  goToHomePage() {
    pushRouterState({ page: 'home' });
  }

  goToAboutPage() {
    pushRouterState({ page: 'about' });
  }

  goToProductsPage() {
    pushRouterState({ page: 'products' });
  }

  render() {
    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <span>State Router Example</span>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem className={'top-nav-item' + (this.props.page === 'home' ? ' selected' : '')} onClick={this.goToHomePage} eventKey={1}>
              Home
            </NavItem>
            <NavItem className={'top-nav-item' + (this.props.page === 'products' ? ' selected' : '')} onClick={this.goToProductsPage} eventKey={2}>
              Products
            </NavItem>
            <NavItem className={'top-nav-item' + (this.props.page === 'about' ? ' selected' : '')} onClick={this.goToAboutPage} eventKey={2}>
              About
            </NavItem>
          </Nav>
          <Nav pullRight>
            <NavItem eventKey={1} href="https://github.com/maa105/react-router-maa" target="_blank">
              GitHub <i className={'fas fa-external-link-alt'}></i>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

const mapStateToProps = (state) => ({
  routerState: state.router.routerState,
  page: state.router.routerState.page
});

export default connect(
  mapStateToProps,
  null
)(TopNav);
