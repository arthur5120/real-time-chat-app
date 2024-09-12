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
# When resetting rooms, the socket is disconnected prematurely and the users don't receive updates. [DONE]
# Chat not loading sometimes when first getting to the page. [DONE]
# Change some buttons on the chat to CustomButton variations.
# Weird behavior during session timeout on chrome.
# If user connected recently, set to inactivity status on the socket.
# Handle online user control on server and socket when removing cookie manually.
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
# Editing message and clicking off of it deletes the text content. [DONE]
# useEffect rarely stops prematurely, locking the user from interacting with the UI. [DONE]
# Editing is cancelled when receiving a new message. [DONE]
# Editing a message cancelled when a message is edited on the other end. [DONE]
# Room user list not updating in real time. [DONE]
# Handle infinite loops when the server is out. [DONE]
# When server is out and comes back, the user can't logout due to the token and gets stuck on the chat screen. [DONE]
# When confirming an edit on a non freshly created message, the changes aren't applied. [DONE]
# Reload not resetting when the data is fetched, locking the user out of the UI. [DONE]
# Not removing user from socket online list during logout. [DONE]
# Handle repeated names on the chat/socket room user list. (Maybe use a set with their ids/names) [DONE]
# Adding null to the socket online list when auto-logout is performed due to duplicated sessions. [DONE]
# User going inactive even when clicking. Scheduling is not resetting properly. [DONE]
# A message is being added to the local chat erroneously for a moment before the chat loads the correct messages.
# Editing the message fails sometimes.
# Make list of silenced rooms.
# Maybe separate the socket operations into their own useEffect and use a useRef hook to not get stale states in a function.
# Make onlineUsers array a Set instead.
# Chat flickering, maybe due to too many messages. (Limit the number of messages rendered, use lazy loading.)
# Sending inactivity status change erroneously.
# Maybe change the user diff on the retrieveMessages to a uuid and use it instead of the database id?

# roomUsers not updating when a new user enters the room sometimes. [DONE]
# Update inactive status redundantly when sending message on the other end. [DONE]
# Update inactivity status when sending a message on the list. [DONE]
# Banner might be breaking due to overlapping state changes. [DONE]
# User going inactive on logout. [DONE]
# Banner might be using stale auth states. [DONE]
# Inactive status updating unnecessarily. [DONE]
# Typing status not updating when sending the message. [DONE]
# Message failing when confirming the edit while writing. [DONE]
# Make verification for typing users. [DONE]
# Changing rooms updates the chat for other users.[DONE]
# User going inactive on auto-logout due login with the same account.[DONE]
# Create log to show message changing history. [DONE]
# Add a message to the user case there are not messages in the current chat room. [DONE]
# Change buttons to add a clear log when on the log screen. [DONE]
# Make log persistent through sessions using cookies. [DONE]
# Maybe modify the log to firstly show a generic message and then a detailed version upon clicking on it.
# Make log into an array of objects instead of an array of strings. [DONE]
# Modify the log to accept global changes. [DONE]
# Update change socket event to handle the new payload type. [DONE]
# Change room and minorChange events to have a notification type message and a log one with what has been changed. [DONE]
# Check minorChange and change socket events for stale states.[DONE]
# Make socket events handle stale/undefined payload properties.[DONE]
# Set a visual warning for when the use is locket out of sending messages due to spam.[DONE]
# Make filter for the log messages. [DONE]
# When a new message is received, if the user is on the log screen, it scrolls down to the bottom anyway. [DONE]
# Handle undefined rooms on the socket during room reset. [DONE]
# useEffect Bug : Receiving double notification messages. [DONE]
# Returning to the chat screen when logging out, the notification appears as if in session timeout. [DONE]
# Clicking to reset room sometimes doesn't update on the other end. [DONE]
# Use state to require a page refresh to the user.
# When resetting the rooms, the chat gets stuck on infinite reloading.
# Make user lists update comparing uuid instead of number of users, or maybe dates.
# Find a way to update all the lists.
# When first starting the server, it takes too long to load the page.
# Chat starts flicking w\hen reaching a certain number of messages.
# Maybe make some messages and user names only show if clicking on them.
# Add a context menu to show interactions with a individual given message as well.
# When server first starts, changing the messages doesn't update the chat on the other end.
# On the room reset/creation, if the user continues spamming none of the messages get to the other end.
# useEffect Bug : Auth running on useEffect after sending message. Functions emitting to auth : "addUserToOnlineList, retrieveUserLists".
# Make log changes in real time. [DONE]
# Make log notes circular. [DONE]
# Warn the user about the log being full.
# Make spam cooldown specific to room and reset along with the rooms.
# Spam cooldown seems to be cumulative sometimes, check the array to see if it is comparing the correct messages. [DONE]
# Refreshing prevents the room from staying on cooldown. [DONE]
# When all users remove all their messages from the room, the room user placeholder appears next to their name. [DONE]
# When log messages updates, it might not consider the filter mode, setting them always chronologically. [DONE]
# On auto-logout due to duplicated sessions, the socket stops listening to events. [DONE?]

// Done yesterday

Modify server's logout function to remove its dependency on the online users list, preventing logout issues when the server is down.

// Done today

Change the conditional rendering on the log component to support single records.
Create a boolean state to control when to display the log list in reverse order.
Modify the button for hiding/showing notifications to instead display a button for reversing the log order when on the log screen.
Update button icons to reflect the current log order and different sorting criteria.
Adapt the log component to support inverting the order based on a boolean prop.