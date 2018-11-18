import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pushTransitionAllowedCheckFunction } from 'react-router-maa';
import { Modal, Button } from 'react-bootstrap';
import { showConfirmModal } from '../../actions';

class ProductImages extends Component {

  constructor(props) {
    super(props);

    this.dismissModal = this.dismissModal.bind(this);

    this.setupAllowRouteChangeHandler();
  }

  dismissModal(confirm) {
    this.props.showConfirmModal(false);
    this.allowRouteChange && this.allowRouteChange(confirm);
  }

  setupAllowRouteChangeHandler() {
    if(this.removeAllowRouteChangeHandler) {
      this.removeAllowRouteChangeHandler();
    }
    this.removeAllowRouteChangeHandler = pushTransitionAllowedCheckFunction(() => {
      return new Promise((resolve) => {
        if(this.props.product.id === '11111') { // simulating some check e.g. if(this.hasSomethingChanged()) {...} in case of form
          resolve(true);
        } else {
          this.allowRouteChange = resolve;
          this.props.showConfirmModal(true);
        }
      });
    });
  }

  componentDidUpdate(props) {
    if((this.props.product && !props.product) || (!this.props.product && props.product) || (this.props.product && props.product && this.props.product.id !== props.product.id)) {
      this.setupAllowRouteChangeHandler();
    }
  }

  render() {
    return (
      <React.Fragment>
        Some Images of product { this.props.product.name }
        <Modal show={this.props.isConfirmModalShown} onHide={this.dismissModal.bind(null, false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to change route?
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="danger" onClick={this.dismissModal.bind(null, true)}>Yes</Button> <Button onClick={this.dismissModal.bind(null, false)}>No</Button>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}


const mapStateToProps = (state) => ({
  isConfirmModalShown: state.product.isConfirmModalShown
});

const mapDispatchToProps = (dispatch) => ({
  showConfirmModal: (show) => dispatch(showConfirmModal(show))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductImages);
