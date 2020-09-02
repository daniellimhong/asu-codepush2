# AppSync Development

This outlines an approach to the development of new features with an AppSync backend. It covers everything from front to backend.

For any questions I recommend referencing the [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html)

## Outline

The following is done when making a first pass on a new feature:

1. Determine a general architecture required to deliver the feature. This approach is comprehensive and includes any __Data Sources__, **Queries**, **Mutations**, **Subscriptions**, **Data Types** & **Mobile App Components**  that are necessary.
2. Create the Data Sources
	- Spin up any Dynamos or Lambdas
	- Add those Data Sources to your AppSync API
3.  Create the AppSync Data Types
	- The data types should map to the data being stored in or utilized by your data sources
4. Create AppSync Queries, Mutations, Subscriptions
	- We can do this all at once because we are only defining these in the AppSync schema
5. Create Resolvers and Pipelines for the Queries/Mutations/Subscriptions
	- In this step, we tell AppSync how to communicate with our Data Sources.
	- The Resolvers and Pipeline functions are written in Apache VTL 
6. Use the AppSync Queries panel to test the new Queries & Mutations
	- If anything is amiss, the errors from the panel should let you know before proceeding to develop the components.
7. Build components (Mobile or Web) 
	- With the tested Queries & Mutations checking out we can start to define our data flows into the App. We know exactly what the Data Structures look like, so the process should be straightforward.
8. Define your gql Schema in the app using the gql\`\` tag
9. Compose your components with their associated Queries/Mutations/Subscriptions by using the graphql HOC
	- At this point your component should be receiving data inside of it's props. If there are any problems then you'll want to *console.log* the data from the graphql HOC invocations.

Repeat as necessary with new Queries/Mutations/Subscriptions

Remember to secure data that should be user specific by leveraging the cognito ID of invoking users. [This Doc](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/specifying-conditions.html) covers settings up Dynamo tables and IAM roles for fine-grained access control. We want our resolvers to reflect it.


