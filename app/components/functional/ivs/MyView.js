// MapView.js
import PropTypes from 'prop-types';
import React from 'react';
import { requireNativeComponent } from 'react-native';

class Mvm extends React.Component {
  render() {
    return <MyViewManager {...this.props} />;
  }
}

Mvm.propTypes = {
  /**
   * A Boolean value that determines whether the user may use pinch
   * gestures to zoom in and out of the map.
   */
  zoomEnabled: PropTypes.bool
};

var MyViewManager = requireNativeComponent('MyViewMan', Mvm);

module.exports = Mvm;
