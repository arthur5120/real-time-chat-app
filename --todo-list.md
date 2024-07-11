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
# Missing the click on confirming the message edit makes the button disappear.[DONE]

// Done yesterday

Change inactivity timer function and place it on the user retrieval to fix the socket list not updating on first time going inactive. Update login and logout socket functions to handle adding/removing users from the inactive list.

// Done today

Change Custom Button component's value type to ReactNode to include JSX elements.
Add shortcut to the send message button. Fix confirm button disappearing when clicking off during edit mode.