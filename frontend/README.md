# Smart Campus Management Frontend

A modern React.js frontend for the Smart Campus Management system, featuring a sleek zinc and black color scheme.

## Features

- Modern and responsive UI with dark mode
- User authentication and authorization
- User management (Admin area)
- Dashboard with campus statistics
- Profile management

## Technologies Used

- React.js
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- JWT token-based authentication

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following:

```
REACT_APP_API_URL=http://localhost:8080/api
```

5. Start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

## Building for Production

To create a production build:

```bash
npm run build
```

The build will be created in the `build` directory.

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/context` - React Context for state management
- `/src/services` - API service layer

## Customization

The application uses a custom Tailwind CSS theme with a zinc and black color palette. You can modify the colors in the `tailwind.config.js` file.

## Connecting to Backend

The frontend is designed to work with the Smart Campus Management backend. Make sure the backend is running and the API URL is properly configured in the `.env` file.

## License

This project is licensed under the MIT License. 