<p align="center">
    <img src="https://github.com/user-attachments/assets/5f1d5f64-8106-4900-8495-cd600cdcfff6" alt="Image" width="200">
</p>

# UniListing
UniListing is a comprehensive platform designed to help users find housing and facilitate buying or selling of used items within their local community. With an intuitive interface and powerful features, UniListing connects property seekers with landlords, individuals looking for roommates, and buyers with sellers in one convenient marketplace.

## Features

- **Housing Listings**: Browse apartments at your preferred location with detailed information
- **Roommate Matching**: Connect with people looking for roommates within the community
- **Marketplace**: Buy and sell used items.
- **Direct Messaging**: Communicate directly with sellers/landlords/potential roommates
- **Interactive Maps**: View property locations using integrated maps
- **User Profiles**: Manage your listings and saved properties
- **Post Management**: Edit or delete your listings as needed

## Tech Stack

- **Frontend**: React.js with Material UI components
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Maps Integration**: Leaflet
- **Authentication**: Custom JWT-based auth system with email verification

## Screenshots

### Home Page
![Home Page](https://github.com/user-attachments/assets/8576f815-5a38-4fb1-acdb-aebed8f07ff6)

### Apartment Listings Page
![Apartment Listings](https://github.com/user-attachments/assets/3d03b837-1ff7-472a-98f9-60dd9fd7d1e1)

### Marketplace
![Marketplace](https://github.com/user-attachments/assets/2aa9442c-af0b-4c04-8b8b-4533e7af0e31)

### Apartment Details Page
![Apartment Details 1](https://github.com/user-attachments/assets/8f2fa6bd-f0ef-4cd0-a58b-94b6aef9f70e)
![Apartment Details 2](https://github.com/user-attachments/assets/651c43cc-a944-478c-b078-cb3d05c95f4e)
![Apartment Details 3](https://github.com/user-attachments/assets/81e21e4e-a8ce-44c8-b1f0-2a803d2b5071)

### Item Details Page
![Item Details](https://github.com/user-attachments/assets/0e6a1cd4-6201-45da-8f6b-56720c934fe4)

### Add New Apartment
![Add Apartment](https://github.com/user-attachments/assets/b04ae4b2-c9aa-4699-b90b-7ef937fe9783)

### Add New Marketplace Listing
![Add Item](https://github.com/user-attachments/assets/13af9413-7bfc-430c-a23e-b2ba75c3395f)

### Messaging
![Messaging](https://github.com/user-attachments/assets/0cb31210-9137-4bc0-a2c5-c5dedf645a72)

### Saved Posts
![Saved Posts](https://github.com/user-attachments/assets/74a2c012-b910-4556-9b88-dbf7acb806e4)

### Post Management
![Post Management](https://github.com/user-attachments/assets/675675f8-7cf3-4f07-9fc0-5eac6c7c8c5b)

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB

### Getting Started
1. Clone the repository:
```bash
git clone https://github.com/shadabtanjeed/UniListing
```

2. Start the backend:
```bash
cd backend
npm install
npm start
```

3. Start the frontend:
```bash
cd frontend
npm install
npm start
```

4. Configure MongoDB:
    - Create a `.env` file in the backend folder and add the following:
    ```
    mongodb_url='your_mongodb_connection_string'
    JWT_SECRET='your_jwt_secret'
    EMAIL_USER=your mail@yahoo.com
    EMAIL_PASSWORD=generated app password
    ```

    Note: You can generate an app password from your Yahoo account settings.

    - Similarly create a `.env` file in the frontend folder and add the following:
    ```
    REACT_APP_API_URL=http://localhost:5000
    ```

5. Open http://localhost:3000 to view the application in your browser.

## Usage
After installation, the application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## API Documentation
- `/auth`: Authentication routes (login, signup, session)
- `/api/apartments`: Apartment listing routes
- `/api/items`: Marketplace item routes
- `/api/messages`: Messaging system routes
- `/api/saved-posts`: Saved listings routes
- `/api/my_posts`: User's own listings management
- `/api/otp`: OTP verification routes

## Project Structure
```

unilisting/
├── backend/             # Backend Node.js/Express application
│   ├── controllers/     # API controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── index.js         # Entry point
├── frontend/            # React frontend application
│   ├── public/          # Static files
│   └── src/             # React components and logic
│       ├── components/  # Reusable components
│       ├── context/     # React context providers
│       ├── pages/       # Page components
│       ├── services/    # API service connections
│       └── styles/      # CSS styles
└── README.md            # Project documentation
```
