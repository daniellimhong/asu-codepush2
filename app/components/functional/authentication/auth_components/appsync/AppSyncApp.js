import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import PropTypes from "prop-types";
import { responsiveFontSize } from "react-native-responsive-dimensions";
import { withApollo, ApolloProvider, compose } from "react-apollo";
import { Rehydrated } from "aws-appsync-react";

/**
 * Conditionally wraps the application in an ApolloProvider so that
 * we can leverage AppSync.
 *
 * awsconfig contains the AppSync information exported from the dashboard.
 *
 * This must be a child of WebLogin so that the tokens can be leveraged.
 */
export default class AppSyncApp extends React.Component {
  state = {
    authClient: null
  };

  static defaultProps = {
    client: null
  };

  _timeout = null;
  _refreshTimeout = null;
  clear = false;

  componentDidMount() {
    /**
     * Wait two seconds
     * Is the app live?
     * no
     * Remount
     *
     */
    this.retryHydration();
  }

  retryHydration = () => {
    this._timeout = setTimeout(() => {
      if (!this.clear) {
        this.remount().then(() => {
          this._refreshTimeout = setTimeout(() => {
            if (!this.clear) {
              this.remount().then(() => {
                this._refreshTimeout = setTimeout(() => {
                  if (!this.clear) {
                    this.setState({
                      user_input: true
                    });
                  }
                }, 1000);
              });
            }
          }, 1000);
        });
      }
    }, 2000);
  };

  /**
   * In the event our app fails to rehydrate, unmount everything
   * and then try once more.
   */
  remount = () => {
    let thisr = this;
    return new Promise(function(resolve, reject) {
      thisr.setState(
        {
          remount: true
        },
        () => {
          thisr._timeout = setTimeout(() => {
            thisr.setState(
              {
                remount: false
              },
              () => {
                resolve(true);
              }
            );
          }, 400);
        }
      );
    });
  };

  getChildContext() {
    return {
      AppSyncClients: {
        authClient: this.props.client
      }
    };
  }

  render() {
    if (this.state.remount) {
      // console.log("DO REFRESH");
      if (__DEV__) {
        return (
          <View style={{ flex: 1 }}>
            <Text>DEV ONLY: Refreshing</Text>
          </View>
        );
      } else {
        return <View style={{ flex: 1 }} />;
      }
    }
    if (this.state.user_input) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 80
          }}
        >
          <Text
            style={{
              textAlign: "center",
              margin: 10,
              fontSize: responsiveFontSize(2),
              color: "#606060"
            }}
          >
            Sorry, but we are having trouble connecting. Please refresh!
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.remount().then(() => {
                this.setState(
                  {
                    user_input: false
                  },
                  () => {
                    this.retryHydration();
                  }
                );
              });
            }}
          >
            <View
              style={{
                padding: 15
              }}
            >
              <Icon size={30} name={"refresh-cw"} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    if (this.props.client) {
      return (
        <ApolloProvider client={this.props.client}>
          <Rehydrated
            render={({ rehydrated }) => {
              if (rehydrated) {
                this.clear = true;
                return this.props.children;
              } else {
                return <View style={{ flex: 1 }} />;
              }
            }}
          />
        </ApolloProvider>
      );
    } else {
      return null;
    }
  }
}

AppSyncApp.childContextTypes = {
  AppSyncClients: PropTypes.object
};

/**
 * Accept a component and array of GQL configs
 * to compose a working GQL component to speak with
 * AppSync
 *
 * If the ApolloProvider client is not configure, hide
 * the component. Otherwise compose the component as normal.
 *
 * @param {} Component
 * @param {*} config
 */
export function AppSyncComponent(Component, ...enhancers) {
  let UpdateComponent = Component;
  if (enhancers.length) {
    UpdateComponent = compose(...enhancers)(Component);
  }
  let UpdatedWithApollo = withApollo(UpdateComponent);

  class ASComp extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        GQLComponent: null
      };
    }
    static defaultProps = {
      error: null
    };
    componentDidMount() {}
    render() {
      if (this.context.client) {
        return <UpdatedWithApollo {...this.props} />;
      } else {
        return null;
      }
    }
  }

  ASComp.contextTypes = {
    client: PropTypes.object,
    guestStatus: PropTypes.func
  };

  return ASComp;
}
