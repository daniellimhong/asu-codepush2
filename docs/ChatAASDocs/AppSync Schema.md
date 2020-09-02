# AppSync Schema

The Queries, Mutations & Subscriptions for the chat feature are not complete. I'll try to outline all of the processes & how they relate with one another.


## Queries

### allUserConversations

Get all of a user's current conversations. Since the userConversations table is namespaced with the ID being a user's cognito identity ID, this is just a straightforward call to that table.

Returns both 1-to-1 and Groups

### getConversationInvites

Get all of a user's current invites. Since the conversation_invites table is namespaced with the ID being a user's cognito identity ID, this is just a straightforward call to that table.

Returns both 1-to-1 and Groups

### allConversationMessages

Grab all of the messages in a conversation, other than the ones that have been ignored or removed by a user.

Ignoring & removing messages only hides them from display. They are maintained for historical purposes.

Works for both 1-to-1 and Groups

Pipeline:

1. Confirm the user requesting the messages is in the conversation
2. Get filtered messages
	- this is filtered because some messages may have been ignored by the user.

### getConversationInfo

Get details about a conversation from the __conversations__ table.
This is currently a pipeline, although it could probably be a direct DDB call since it is mainly conversation info and not contents.

Works for both 1-to-1 and Groups

Pipeline:

1. Get conversation by ID

### getConversationUsers

Return all users participating in a conversation. Should return ASURites

Works for both 1-to-1 and Groups

Pipeline:

1. Confirm the invoker is in the conversation
2. Get all users with records in the userConversations table

### getConversationAdminStatus

Utility function returns whether the invoking user is an admin for a conversation. This will allow the app to display different options for admin & non-admin users.

### getConversationRelation

Determine whether the invoker and another user have an existing 1to1 chat conversation. Allows us to prevent duplicate 1to1s between two users.

## Mutations

### createConversation

Create a new **group** chat conversation with the invoker as an admin.

Pipeline:

1. Get invoker's asurite
2. Create a conversation record
3. Create a userConversation record

### inviteToConversation - Deprecate/Update

Send an invite to a **group** chat.

Admins used to be "Conversation Owners" in the conversations database. This approach was scrapped but the logic still needs to be updated.

> To update: Get admin status using isAdmin resolver instead of "owns conversation"

Pipeline:

1. Verify invoker owns conversation
2. get invoker asurite
3. get recipient congId
4. Send recipient an invite from the invoker

### acceptConversationInvite

Accept an existing conversation invite for **1to1 AND group** chats.

Pipeline:

1. Get the invoker's asurite
2. Confirm the invite exists
3. delete the invite
4. Create a new userConversation

### ignoreConversationInvite

Ignore an existing conversation invite for **1to1 AND group** chats.

We ignore instead of delete so that the invoking user can not be spammed in the future. If we delete the record and another invite is sent then the notification system will be triggered.

Pipeline:

1. Get the invoker's asurite
2. Set invite to "ignored" in DDB

### removeFromConversation - Deprecate/Update

Remove some user from a **group** conversation. This still relies on the deprecated "conversation owner" approach. Should be updated to leverage admin status and a check needs to confirm that the conversation is indeed a group and not 1to1.

Pipeline:

1. Verify invoker owns conversation
2. get removed user's cogId
3. Break if owner is the one being removed
4. Remove user by deleting their userConversations record

### createMessage

Create a new message tied to a conversation. Works for both **1to1** and **group**.

Pipeline:

1. Confirm invoker is in conversation
2. Get invoker's asurite
3. Create a message in the messages table
4. Invoke the post_chat_sqs_handler
  - This function triggers a process that notifies all participating users in the conversation with a push notification.

### directMessage - DEPRECATED

Deprecated createMessage alternative for 1to1 chats. No longer in use.

### startDirectMessage

Can be triggered if users are friends. Initiates a new conversation with another user, creating userConversation records for both.

Pipeline:

1. get invokers asurite
2. get recipients cognito ID
3. Get friend status between invoker and recipient
4. determine if there are existing userConversation entries between users
5. Break on any break conditions
6. Create a cinversation record
7. Create userConversation for recipient
8. Create userConversation for invoker
9. Set invoker convo_relation
10. Set recipient convo_relation
  - Convo relations tie two users together under a single chat instance, so that multiple chats are not recreated and all messages are consolidated between the two

### inviteDirectMessage

When users are not friends, this function invites a user to a 1to1 conversation.

Pipeline:

1. Get ASURites and Cognito IDs for invoker and recipient
2. check to see if a convo_relation already exists
3. Break if a relation exists
4. Create a conversation record
5. create a userConversation for the invoker only
6. Create a conversation invite record
7. Set up the convo_relation between the two users
8. Send a push notification to the recipient

### updateLastSeen - NEEDS UPDATE

Updates the last seen value in a conversation for the invoking user.
This is used to prevent unnecessary notifications and to display bold text from the coversations screen

When invoked from Chat, this creates major problems with flashing messages and is very slow.

This solution needs to be reworked

### sendChatUpdate - UPDATE

This is an admin function that users subscribe to in order to update their chat interface.

This references a lambda directly, but should instead be prefixed with AdminOnly_ instead so that other admin systems can invoke it

Pipeline:

1. Break function if the invoker is not a specific chat update lambda


### ignoreMessage

Sets a message to "ignored" for the invoking user in both 1to1 and group chats.

### hideMessageForAll

Hides a single message for all users involved in a 1to1 or group chat. This only works if the invoker is an admin, or if the invoker was responsible for message creation.

Pipeline:

1. Get invoker's asurite
2. Confirm invoker is an admin in the group
3. Break if the user is not the owner and they are not an admin
4. Trigger a subscription to delete the message

### blockUser

Block a user, preventing them from sending more invites or friend requests

Pipeline:

1. Get recipients cognito ID
2. Break if the invoker is the recipient
3. Block the user

### unblockUser

Unblock a user.

### reportUser

Report a user for misconduct related to the chat system.

Pipeline:

1. Get invoker's asurite from their cognito ID
2. Send a report
  - Sends an email to the user responsible for maintaining the reports


