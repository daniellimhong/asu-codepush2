# App Sync Usage

The AppSync components, like WebLogin, require some level of backend configuration because they utilize APIs on AWS. This document assumes that WebLogin and AppSync are both configured already, as WebLogin will retrieve tokens for an affiliate user that AppSync will use.

## AppSyncApp

If the user is authenticated, then this component will render it's children with a wrapper ApolloProvider component and signal.

Usage is as follows:
```
import AppSyncApp from "~/functional/authentication/auth_components/appsync/AppSyncApp";

-

<WebLogin appid="MyWebLoginAppId" refresh="https://MyRefreshApiIfNecessary.com/prod/refresh">
    <AppSyncApp awsconfig={awsconfig}>
        <App />
    </AppSyncApp>
</WebLogin>
```

awsconfig refers to the file exported from AWS AppSync and stored locally in the codebase. Often named __aws-exports.js__ in the AWS documentation.

If a user is not authenticated, then the component will simply render the children without the ApolloProvider, meaning that AppSync __CAN NOT__ be used without authentication being enabled.

If authenticated, how do we leverage AppSync?

## AppSyncComponent

Inside of the AppSyncApp.js file, there exists a function to generate a Higher-order Component.
This function is called AppSyncComponent and should be imported when creating a component that will leverage AppSync. 

If there is no parent ApolloProvider, then the generated component returns _null_, however if the is an ApolloProvider then the generated component uses react-apollo's __compose__ function to generate a working component.

> Note: In order to use this, you must properly create the queries/mutations for the functions and be able to generate the necessary graphql() calls.

Implementation is as follows:
```
import { AppSyncComponent } from "~/functional/authentication/auth_components/appsync/AppSyncApp";
import { AllStatusQuery } from "./Queries/MyQueries";
-

class ExampleComponent extends React.Component {
  constructor(props){
    super(props);
  }
  static defaultProps = {
    allStatus: { 
        status: [],
        nextToken: null,
    },        
  }

  render(){
    return(
      <View>
        <Text>Hey</Text>
      </View>
    )
  }
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    let gqlCompose = graphql(AllStatusQuery, {
      options: {
        fetchPolicy: "network-only"
      },
      props: (props) => ({
        allStatus: props.data.allStatus,
      })
    });
    
    let ExampleComponentWithData = AppSyncComponent(ExampleComponent, [gqlCompose]);

    return(
      <View>
        <ExampleComponentWithData />
      </View>
    )
  }
}

```

Notice the arguments of AppSyncComponent. The first arg is the component that we would like to imbue with GQL functionality. The second arg is an __Array__ of graphQL calls. If we would like, we can imbue the component with multiple queries that map to multiple props, as well as implement subscriptions or allow the component to mutate remote data.