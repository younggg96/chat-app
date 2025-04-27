# Chat Application Demo

A real-time chat application built with React, TypeScript, and WebSocket technology.

## Features

- **Real-time messaging**: Instant message delivery using WebSocket
- **Online status indicators**: See when users are online or offline
- **Responsive design**: Works on desktop and mobile devices
- **Dark/Light theme**: Toggle between visual themes for comfort
- **Message history**: View previous conversations
- **User authentication**: Simple login system

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Vite for development and building

### Backend
- Node.js
- Express.js
- WebSocket (ws library)

## Prerequisites

- Node.js (version 16 or higher)
- npm (version 7 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd chat-app-demo
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

### Combined Development Mode

Start both the frontend and WebSocket server simultaneously:

```bash
npm run dev
```

This will launch:
- WebSocket server on port 3001
- Frontend development server on port 5173

### Separate Startup

If you prefer to start the server and frontend separately:

```bash
# Start the WebSocket server
npm run server

# In another terminal, start the frontend
npm run start
```

## How to Use

1. Open your browser and navigate to `http://localhost:5173`
2. Enter any username to log in (no password required for this demo)
3. Select a contact from the list on the left sidebar
4. Start sending messages in the chat area
5. Toggle between light and dark themes using the theme switch in the top navigation bar

## Project Structure

```
/
├── public/              # Static assets
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main application component
├── server.js            # WebSocket server implementation
└── package.json         # Project dependencies and scripts
```

## Troubleshooting

- **Port already in use**: If port 3001 is already in use, you can either:
  - Kill the process using the port: `lsof -i :3001` to find the PID, then `kill <PID>`
  - Or modify the port in `server.js` (change the PORT constant)

- **Connection issues**: Ensure both the server and frontend are running

## Future Improvements

- Add persistent message storage with a database
- Implement user authentication with passwords
- Add file sharing capabilities
- Implement typing indicators
- Add group chat functionality
- Enable message read receipts

## License

MIT

## Contact

For questions or feedback, please reach out to [your-contact-information] 