// MapView.js
import PropTypes from 'prop-types';
import React from 'react';
import { requireNativeComponent } from 'react-native';

class IVSStream extends React.Component {
  render() {
    return <IVSStream {...this.props} />;
  }
}

IVSStream.propTypes = {
  /**
   * A Boolean value that determines whether the user may use pinch
   * gestures to zoom in and out of the map.
   */
  zoomEnabled: PropTypes.bool
};

var IVSStream = requireNativeComponent('RNIVSStream', IVSStream);

module.exports = IVSStream;
