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
# Handle repeated names on the room user list.
# Not loading inactive list on start. [DONE]
# Not removing user from inactive list on logout and login. [DONE]
# Missing the click on confirming the message edit makes the button disappear. [DONE]
# Sending unnecessary inactive status requests to socket.
# Inactivity status not loading sometimes when refreshing the page.
# When confirming an edit on a non freshly created message, the changes aren't applied. [DONE]
# Entering edit mode and confirming without editing the message clears it. [DONE]
# previous property on the messageBeingEdited state might not be updating correctly.
# chat style not updating when the session expires. [DONE]
# Editing the message and cancelling afterwards makes it blank instead of returning to the last state. [DONE]
# Clicking the area above the title doesn't remove the user inactive status.
# Edited status not showing on the other chats when freshly editing a message for the first time.

// Done yesterday

Change incrementing method for the reload state.
Change the onBlur event to handle null values and compare elements IDs instead elements themselves.
Add a placeholder for empty chat messages and adjust the minimum size of the container.
Add a flag property to track if message was actually edited.

// Done today

Replace the onBlur event confirm button ref for a prefix to include the other ones.
Place useEffect to update the chat style upon session expiration.
Restore last method of incrementing to reload state due to problems on some browsers.
Change the message container to include flex-shrink-1 so it adapts correctly.
Change cancel button to allow blank text as a valid previous message.