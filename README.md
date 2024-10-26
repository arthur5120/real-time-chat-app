# ☑️ About the Application

## 1. Description

A real time chat application with authentication/authorization features, message operations such as editing and deleting, room management, like creating and removing rooms, user status and activity tracking, whether the user is offline, inactive or typing and a notification system with toast messages.

## 2. Technologies

- Typescript
- React
- Socket.io
- Prisma
- MySQL
- JsonWebToken
- bcrypt
- uuid
- Tailwind CSS
- React Toast Messages
- Axios

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

| Other Functionalities |
| :---        |
- Idempotency
- CSRF Protection

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

# ☑️ How to Run it

The following tutorial provides a brief guide on installing dependencies and running the app. 

## 1. Getting the Application Files

| Direct Download |
| :---        |

To acquire the app files by downloading them directly, click the green "Code" button in the top-right corner, then click "Download ZIP". Then, extract the downloaded ZIP file to a directory of your preference.
 
| Git Destkop |
| :---        |

Alternatively, you can clone the repository using GitHub Desktop. To do this, click "File" > "Clone Repository". Then paste the repository URL, choose a local folder, and click "Clone".

| Git Bash |
| :---        |

If you are using Git Bash, you can also clone the repository by navigating to the folder you chose and running the following command, followed by the repository **URL** (Replace **REPOSITORY-URL** with the actual **URL** of the repository) 🔽

~~~~
git clone REPOSITORY-URL
~~~~

## 2. Backend Folder

Create the **.env** file with the following content, filling the blanks 🔽

~~~
PORT="3000"
DATABASE_URL=""
SECRET_KEY=""
SECRET_SALT=10
~~~

Now on the terminal run the following to initialize the server 🔽

~~~
npm install
npx prisma generate
npm start
~~~

## 3. Frontend Folder

Then navigate to the frontend folder and run the command bellow 🔽

~~~
npm run dev
~~~

## 4. Socket Folder

Finally for the real-time feature, go to the socket folder and run this one 🔽

~~~
nodemon server
~~~


