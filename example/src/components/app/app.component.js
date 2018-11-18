import React, { Component } from 'react';
import { connect } from 'react-redux';
import TopNav from '../top-nav/top-nav.component';
import Home from '../../pages/home/home.page';
import About from '../../pages/about/about.page';
import Products from '../../pages/products/products.page';

class App extends Component {
  render() {
    return (
      <React.Fragment>
        { this.props.isLoading ? <div className={'loader cursor-wait'}><div>Loading...</div></div> : null }
        <TopNav/>
        <div className={'container'}>
          { this.props.page === 'home'     ? <Home/>     : null }
          { this.props.page === 'products' ? <Products/> : null }
          { this.props.page === 'about'    ? <About/>    : null }
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  isLoading: state.loader.isLoading,
  page: state.router.routerState.page
});

export default connect(
  mapStateToProps,
  null
)(App);

