import React, { Component } from 'react';
import { pushRouterStateThroughChange } from 'react-router-maa';

class Products extends Component {
  constructor(props) {
    super(props);

    this.selectProduct = this.selectProduct.bind(this);
  }

  selectProduct(product) {
    pushRouterStateThroughChange({
      productId: product.id,
      productName: product.name
    });
  }

  render() {
    return (
      <React.Fragment>
        {
          this.props.products.map((product) => (
            <div key={product.id} className={'cursor-pointer underline-on-hover'} onClick={this.selectProduct.bind(null, product)}>{product.name}</div>
          ))
        }
      </React.Fragment>
    );
  }
}

export default Products;

