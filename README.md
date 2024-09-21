# ☑️ About the Application

## 1. Description

A real time chat application with authentication/authorization features, message operations such as editing and deleting, room management, like creating and removing rooms, user status and activity tracking, whether the user is offline, inactive or typing and a notification system with toast messages.

## 2. Technologies

Typescript
React
Socket.io
Prisma
MySQL
JsonWebToken
bcrypt
uuid
Tailwind CSS
React Toast Messages
Axios

## 3. Functionalities

| Authentication |
| :---        |
- Hashed Password 
- Encrypted Token
- Http-only Cookie
- Session Expiration Handling
- Duplicate Session Protection
- Account Creation
- Input Validation
- Login/Logout

| Authorization |
| :---        |
- Designated Roles
- Protected Routes
- Server-side Authorization

| Chat Functions |
| :---        |
- Messaging Features
- Room Management
- User Status Tracking
- Activity Tracking 
- Spam Control
- Notifications & Alerts

| Operations Log |
| :---        |
- Sorting Methods
- Keyword Search

| UI & Navigation |
| :---        |
- Responsive Design
- Reusable Components
- Navigation Bar / Menu
- Error Pages
- Multiple Views
- Placeholders
- Tooltips and Help Text
- Keyboard Shortcuts

## 3. About Specific Features

| User Status & Chat Rooms |
| :---        |

- Clicking on a message opens a menu that allows you to edit, delete, or view it if you are not the sender.
- The left panel indicates the current users present in a chat room and whether they are currently typing.
- The user's activity status in a chat room is tracked through events, displaying who is offline, online, or inactive.
- It's only possible to view the status of users who are currently in the chat room.
- The app tracks consecutive messages sent by a user and manages cooldown periods to prevent spamming.
- Logged-out users can only see messages and are unable to send, edit or delete them.
- The application provides feedback to the user if it encounters errors.

| UI & Navigation |
| :---        |

- It is possible to alternate between the log view and the chat view by clicking the log button.
- Clicking the button with the eye icon toggles the display of notifications.
- The chat window will automatically scroll down to the latest messages.
- The button to copy the room name indicates when text has been copied to the clipboard.

| Log View |
| :---        |

- Keeping record of activities or events within the application, the log consists of what was done, who did it, when it was done, and where.
- Using cookies, it retains up to ten messages and upon reaching the limit, the oldest ones are deleted with each new entry.
- The log messages can be filtered chronologically or alphabetically by room name or user name, and each filter can be optionally displayed in reverse order.
- Upon switching to the log view, it is possible to search for a specific string within the log messages.




