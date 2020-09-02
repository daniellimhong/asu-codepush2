# Chat Feature
The goal of this project was to provide an in-app chat option for students to collaborate with each other without the need to download a third party app.

This is accomplished by leveraging AWS AppSync & Pipeline Resolvers, DynamoDB, SQS & the Push Platform developed in house for notifications.

This README will cover the flow of the various actions currently implemented in the feature, along with some reasoning and ideas for future iterations of the system.

## Folder Structure and Components

The client-side Chat feature can currently be broken up into several main interfaces.

1. Current Conversations
2. New Conversations
3. Conversation
4. Direct Message

### Current Conversations

This can be best described as the first screen you see when entering the Chat section of the mobile app. This screen requires all of the top level __.js__ files within the chat folder (excluding ChatSettings.js) as well as parts of the __gql__ folder.

The intent here is to view all existing conversations, both 1-to-1 and group, while also providing a space to see/accept/ignore new conversation invites from others.

Conversations can also be filtered by name, or clicked on to navigate tot he "Conversation" page where the user can send and receive messages.

Users should also be able to navigate to "New Conversations" from this screen, so as to initiate a new chat with one or more users.

### New Conversations

Users should be able to initiate new conversations with other mobile app users from this screen. It requires all of the files inside of the __NewChat__ folder, as well as __utility.js__ and the __gql__ folder.

Users should be able to see their existing friends or search for other users to initiate a dialogue with.
> At the time of this writing, only student and whitelisted users should be able to initiate new conversations. Staff/Faculty/Alumni are not allowed to use the chat feature.

### Conversation

This is the main'ish chat screen where users can actually send messages and see the conversation. It requires everything inside of __Chat__, and touches the __gql__ folder and __utility.js__ file.

This should work for both 1-to-1 and group chats, although the options internally may be different. Ie. In a group chat some users may be admins while others are not.
The way we leave group chats is also different when compared to 1-to-1. (more on that later)

### Direct Message Button

This is a sort of drop-in utility button that allows users to Start/Invite/View 1-to-1 conversations with other users. It relies on __gql__, __DirectMessage__ and __utility.js__.

Given an asurite it will determine the proper course of action when clicked, though the render may need to be modified to meet the needs of certain mocks.
