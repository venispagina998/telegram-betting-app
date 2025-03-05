# Telegram Betting Mini App

A Telegram Mini App that allows administrators to create events and users to place virtual bets on these events.

## Features

- Admin panel for creating and managing events
- User interface for viewing events and placing bets
- Real-time event status updates
- Virtual betting system
- Responsive design optimized for Telegram Mini Apps

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL (or SQLite for development)
- Telegram Bot Token

## Setup

### Backend Setup

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/betting_db
TELEGRAM_BOT_TOKEN=your_bot_token
```

4. Run the backend server:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm start
```

## Telegram Bot Setup

1. Create a new bot using [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Create a Mini App for your bot:
   - Use the `/newapp` command in BotFather
   - Set the web app URL to your deployed frontend URL
   - Save the bot token in your backend `.env` file

## Usage

1. Start your bot in Telegram
2. Click the "Start" button to launch the Mini App
3. Admins can create events using the Admin Panel
4. Users can view events and place bets on them

## Development

- Backend API runs on `http://localhost:8000`
- Frontend development server runs on `http://localhost:3000`
- API documentation available at `http://localhost:8000/docs`

## Security Considerations

- All API endpoints are protected with Telegram authentication
- Admin actions require admin privileges
- Betting amounts are virtual and don't involve real money
- Event outcomes are validated before accepting bets

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
