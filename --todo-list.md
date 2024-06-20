# Give custom elements a prefix ("UI")
# Break down larger components into smaller ones
# Socket Connection closing before expected on Brave Browser specifically
# Implement Idempotency, with a uuid key for each request, an expiration time for it
# Move try-catch blocks from the actual page to the axios hook to prevent repetition. () [DONE]
# New messages not getting edited right away, refreshing necessary. [DONE]
# Show some info abount the other user's messages when clicking on it.
# Show List of Users and number of messages within a chat room.
# Show unread messages ()
# Upon creatin a new room, the current room is not updated, showing the messages from the previous room. [DONE]
# Make visualization mode vertical or horizontal optionally.
# Fix Chat/Users Refresh bug, something to do with the socket.
# Unify login/logout into the auth-provider (handling cookies, socket, state) currently on : login, apps and auth-provider files.

# Not returning the Auth state when refreshing the page.
# Auth Timeout not working.
# Banner changing too often on auth-banner
# Handle Socket connections and disconnections properly.
# Change some buttons on the chat to CustomButton variations.
# There might be an error when resetting the rooms and not notifying the other user. Not able to replicate it.
# Change interval to timeout on the banner handler later.