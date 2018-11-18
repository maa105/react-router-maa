import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadProducts } from '../../actions';
import { Alert, Row, Col } from 'react-bootstrap';
import Product from '../../components/products/product.component';
import Products from '../../components/products/products.component';
import ProductBreadCrumbs from '../../components/products/product-breadcrumbs.component';

class ProductsPage extends Component {
  constructor(props) {
    super(props);

    props.loadProducts();
  }

  render() {
    if(this.props.loading) {
      return (<Alert><i className={'fas fa-spinner fa-spin'}></i>&nbsp;<strong>Loading Products</strong></Alert>);
    }
    if(this.props.error) {
      return (<Alert onClick={this.props.loadProducts()} bsStyle="danger"><i className={'fas fa-info-circle color-red'}></i>&nbsp;<strong>Error Loading Products</strong></Alert>);
    }
    if(!this.props.products) {
      return null;
    }    
    if(!this.props.products.length) {
      return (
        <React.Fragment>
          No products found
        </React.Fragment>
      );
    }
    return (
      <Row>
        <Col xs={12} sm={12} md={3} lg={2}>
          <Products products={this.props.products} />
        </Col>
        <Col xs={12} sm={12} md={9} lg={10}>
          {
            this.props.selectedProduct ? 
            <React.Fragment>
              <ProductBreadCrumbs product={this.props.selectedProduct} />
              <Product product={this.props.selectedProduct} />
            </React.Fragment> : 
            <React.Fragment>
              No product selected! Please select one
            </React.Fragment>
          }
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  products: state.product.products,
  selectedProduct: state.router.routerState.productId && state.product.productsById[state.router.routerState.productId],
  loading: !!state.product.productsLoadingPromise,
  error: !!state.product.errorLoadingProducts
});

const mapDispatchToProps = (dispatch) => ({
  loadProducts: () => dispatch(loadProducts())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductsPage);

