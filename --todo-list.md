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
# Add button to copy current room.

// Done today

Slight increase the delay on first socket emit after room deletion
Disable dragging and user select property on navigation bar links and other chat elements
Add no cache option to package.json
Add router location as a new dependency to auth-banner useEffect
Add conditional return and reload to retrieveMessages function when currentRoomid is invalid