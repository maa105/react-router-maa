import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pushRouterStateThroughChange } from 'react-router-maa';

class Product extends Component {
  constructor(props) {
    super(props);

    this.selectProduct = this.selectProduct.bind(this);
  }

  selectProduct() {
    pushRouterStateThroughChange({
      section: undefined
    });
  }

  render() {
    if(this.props.section) {
      return (
        <div>
          <span className={'cursor-pointer underline-on-hover display-inline-block'} onClick={this.selectProduct}>{this.props.product.name}</span> &gt; <span className={'display-inline-block'}>{this.props.section}</span>
        </div>
      );
    }
    return (
      <div>Selected product: {this.props.product.name}</div>
    );
  }
}

const mapStateToProps = (state) => ({
  section: state.router.routerState.section
});

export default connect(
  mapStateToProps,
  null
)(Product);
