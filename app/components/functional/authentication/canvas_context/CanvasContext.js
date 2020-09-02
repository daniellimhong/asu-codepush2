import React, { Component } from "react";

const defaultValue = "You hit default value...";

export const CanvasContext = React.createContext(defaultValue);

export class CanvasProvider extends Component {
  state = {
    access_token: "",
    updateAccessToken: token => this.setState({ access_token: token }),
    refresh_token: "",
    updateRefreshToken: token => this.setState({ refresh_token: token })
  };
  render() {
    return (
      <CanvasContext.Provider value={this.state}>
        <React.Fragment>{this.props.children}</React.Fragment>
      </CanvasContext.Provider>
    );
  }
}
