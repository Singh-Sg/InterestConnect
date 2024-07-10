# Interest Messaging Web Application

This project is a web application that facilitates sending interest messages between users, with the ability to accept or reject these interests and engage in real-time chat upon acceptance. It utilizes Django for the backend and React for the frontend.

## Features
### User Authentication
- **Registration**: New users can register with email and password.
- **Login/Logout**: Registered users can log in and out of their accounts securely.
### Sending Interests
- **Browse Users**: Logged-in users can browse a list of other registered users.
- **Send Interest**: Users can send an interest message to any other user on the platform.
### Accepting/Rejecting Interests
- **View Interests** - Users can view interest messages received from other users.
- **Accept/Reject**: Users can accept or reject an interest message received from another user.
### Chat System
- **Real-time Messaging**: Upon acceptance of an interest, users can engage in real-time chat.
- **Message History**: Chat interface displays the history of messages exchanged.


## Documentation
### Setup Instructions
### Backend (Django)
- Clone the repository(```switch to master branch if default branch is main```).
- Install dependencies (```pip install -r requirements.txt```).
- Create a superuser (```python manage.py createsuperuser```).
- Run the server (```python manage.py runserver```).
- Start Redis Server: Run ```redis-server``` to start the Redis server on default port 6379.

### Frontend (React):
- Navigate to the frontend directory.
- Install dependencies (```npm install```).
- Start the development server (```npm start```).


