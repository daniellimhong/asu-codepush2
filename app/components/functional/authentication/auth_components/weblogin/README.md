# Weblogin - React Native CAS authentication for ASU

This component is meant to be used as a portal for applications that need authentication to utilize ASU's CAS login in their mobile apps.

It only stores one set of tokens and requires backend AWS configuration to ensure that the proper tokens are returned and work.

## Use

Users simply wrap their React Native application with the Weblogin component, as follows:

```
<WebLogin appid="XXXXXXXXXXXXXXX" refresh="https://XXXXXX.com/refresh">
      <ScrollView>
      <View>
        <Text>
         My app 
        </Text>
      </View>
      </ScrollView>
</WebLogin>
```

The example wraps a scroll view and some basic text, although it could encompass anything.

**appid** - provided by UTO's Mobile & IoT department.

**refresh** - The URL of your AWS instance's refresh API endpoint to allow your app the ability to refresh it's tokens within 24 hours rather than forcing users to log in every hour.

## Example use of getTokens in props

Weblogin passes it's tokens to it's first level of children via props. Those tokens can be accessed as follows:

```
this.props.tokenRef().then(tokens => {
    console.log(tokens); // Do something here with these tokens
})
```

## Example use of getTokens in context

Users must implement context as normal. The following is how to utilize authenticated tokens inside of subcomponents

```
this.context.getTokens().then(response => {
  console.log(response);
}) 
```