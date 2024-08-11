# Give custom elements a prefix ("UI")
# Break down larger components into smaller ones
# Implement Idempotency, with a uuid key for each request, an expiration time for it
# Move try-catch blocks from the actual page to the axios hook to prevent repetition. () [DONE]
# New messages not getting edited right away, refreshing necessary. [DONE]
# Show List of Users and number of messages within a chat room. [DONE]
# Show unread messages
# Upon creating a new room, the current room is not updated, showing the messages from the previous room. [DONE]
# Make visualization mode vertical or horizontal optionally.
# Fix Chat/Users Refresh bug, something to do with the socket. [DONE]
# Unify login/logout into the auth-provider (handling cookies, socket, state) currently on : login, apps and auth-provider files.

# Not returning the Auth state when refreshing the page. [DONE]
# Auth Timeout not working. [DONE]
# Banner changing too often on auth-banner [DONE]
# Change interval to timeout on the banner handler later. [DONE]
# Handle login with same account. [DONE]
# Handle user timeout on socket. [DONE]
# Change some buttons on the chat to CustomButton variations.
# Weird behavior during session timeout on chrome.
# If user connected recently, set to inactivity status on the socket.
# Handle online user control on server and socket when removing cookie manually.
# When resetting rooms, the socket is disconnected prematurely and the users don't receive updates. [DONE]
# Chat not loading sometimes when first getting to the page. [DONE]
# Add button to copy current room name. [DONE]
# Fix idempotency when creating user.
# Allow both first and last name when creating user. [DONE]
# Handle room/online user list overflow on x axis. [DONE]
# Make room/online a single list, but highlighting who's online. [DONE]
# Update the room users when the session expires.
# Handle name with spaces on the online user list. [DONE]
# Save user preferences in cookies.
# Not loading inactive list on start. [DONE]
# Not removing user from inactive list on logout and login. [DONE]
# Missing the click on confirming the message edit makes the button disappear. [DONE]
# Sending unnecessary inactive status requests to socket. [DONE]
# Inactivity status not loading sometimes when refreshing the page.
# When confirming an edit on a non freshly created message, the changes aren't applied. [DONE]
# Entering edit mode and confirming without editing the message clears it. [DONE]
# previous property on the messageBeingEdited state might not be updating correctly.
# chat style not updating when the session expires. [DONE]
# Editing the message and cancelling afterwards makes it blank instead of returning to the last state. [DONE]
# Clicking the area above the title doesn't remove the user inactive status. [DONE]
# Edited status not showing on the other chats when freshly editing a message for the first time. [DONE]
# A message is being added to the local chat erroneously for a moment before the chat loads the correct messages.
# Editing message and clicking off of it deletes the text content. [DONE]
# useEffect rarely stops prematurely, locking the user from interacting with the UI. [DONE]
# Editing is cancelled when receiving a new message. [DONE]
# Editing a message cancelled when a message is edited on the other end. [DONE]
# Room user list not updating in real time. [DONE]
# Handle infinite loops when the server is out. [DONE]
# When server is out and comes back, the user can't logout due to the token and gets stuck on the chat screen. [DONE]
# When confirming an edit on a non freshly created message, the changes aren't applied. [DONE]
# Reload not resetting when the data is fetched, locking the user out of the UI. [DONE]
# Editing the message fails sometimes.
# Make list of silenced rooms.
# Maybe separate the socket operations into their own useEffect and use a useRef hook to not get stale states in a function.
# Make onlineUsers array a Set instead.
# Not removing user from socket online list during logout. [DONE]
# Handle repeated names on the chat/socket room user list. (Maybe use a set with their ids/names)
# Adding null to the socket online list when auto-logout is performed due to duplicated sessions. [DONE]
# Chat flickering, maybe due to too many messages. (Limit the number of messages rendered, use lazy loading.)
# Sending inactivity status change erroneously.
# User going inactive even when clicking. Scheduling is not resetting properly.
# Maybe change the user diff on the retrieveMessages to a uuid and use it instead of the database id?

# roomUsers not updating when a new user enters the room sometimes. [DONE]
# Update inactive status redundantly when sending message on the other end. [DONE]
# Update inactivity status when sending a message on the list. [DONE]
# When resetting the rooms, the chat gets stuck on infinite reloading.
# Make user lists update comparing uuid instead of number of users, or maybe dates.
# User going inactive on logout.
# Banner might be using stale auth states. [DONE]
# Banner might be breaking due to everlapping state changes.
# Inactive status updating unnecessarily. [DONE]
# Typing status not updating when sending the message.
# Find a way to update all the lists.

// Done yesterday

Prevent erroneous typing notifications for invalid users.
Updated the typing indicator to display an icon next to the user name instead of a warning message.
Reduced the delay on the typing socket emit function.

// Done today

Update typing status to false after sending a message to prevent it from freezing on the other end due to the socket disconnecting. Reduce typing status update delay to increase responsiveness.