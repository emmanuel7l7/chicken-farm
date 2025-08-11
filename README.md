# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Chicken Farm Management System

A comprehensive web application for managing a chicken farm business with features for:
- Product catalog and ordering
- Customer management
- Order tracking and analytics
- Payment processing (Mobile Money & Card payments)
- Admin dashboard with bulk SMS capabilities

### Key Features

#### For Customers:
- Browse farm products (layers, broilers, chicks, eggs, meat)
- Add items to cart and place orders
- Multiple payment options (M-Pesa, Tigo Pesa, Airtel Money, Cash on Delivery, Credit Cards)
- Order tracking and history

#### For Admins:
- Product management (add, edit, delete products)
- Order management and status updates
- Customer analytics and insights
- Bulk SMS messaging to customers
- Revenue and sales tracking

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe, Mobile Money APIs
- **SMS**: AfricasTalking API (ready for integration)
- **State Management**: React Context API

### Environment Variables

Create a `.env` file in the root directory with:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (Optional)
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# AfricasTalking SMS Configuration (Optional)
REACT_APP_AFRICASTALKING_API_KEY=your_africastalking_api_key
REACT_APP_AFRICASTALKING_USERNAME=your_africastalking_username
```

### Admin Access

Admin users are automatically created for these email addresses:
- `admin@farm.com`
- `emmanuelmbuli7@gmail.com`

### SMS Integration

The application includes SMS functionality structure for AfricasTalking API. To enable SMS:
1. Sign up for AfricasTalking account
2. Add your API credentials to environment variables
3. Implement the actual API calls in `src/utils/sms.ts`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
