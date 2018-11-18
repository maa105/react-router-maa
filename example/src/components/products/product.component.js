import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pushRouterStateThroughChange } from 'react-router-maa';
import ProductDetails from './product-details.component';
import ProductImages from './product-images.component';

class Product extends Component {
  constructor(props) {
    super(props);

    this.selectDetails = this.selectDetails.bind(this);
    this.selectImages = this.selectImages.bind(this);
  }

  selectDetails() {
    pushRouterStateThroughChange({
      section: 'details'
    });
  }

  selectImages() {
    pushRouterStateThroughChange({
      section: 'images'
    });
  }

  render() {
    switch(this.props.section) {
      case 'details':
        return (<ProductDetails product={this.props.product} />);
      case 'images':
        return (<ProductImages product={this.props.product} />);
      default:
        return (
          <React.Fragment>
            <div className={'cursor-pointer underline-on-hover'} onClick={this.selectDetails}>
              <i className={'fas fa-info-circle'}></i> Product Details
            </div>
            <div className={'cursor-pointer underline-on-hover'} onClick={this.selectImages}>
              <i className={'fas fa-images'}></i> Product Images
            </div>
          </React.Fragment>
        );
    }
  }
}

const mapStateToProps = (state) => ({
  section: state.router.routerState.section
});

export default connect(
  mapStateToProps,
  null
)(Product);
