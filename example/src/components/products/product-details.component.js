import React, { Component } from 'react';

class ProductDetails extends Component {
  render() {
    return (
      <React.Fragment>
        { this.props.product.details }
      </React.Fragment>
    );
  }
}

export default ProductDetails;
