## Steps to install the application locally

1. Download the code and in the folder run `npm install` to install the node dependencies.
2. Run `npm install` inside the folder 'frontend' as well to install the react dependencies.

## Steps to run the express application locally

1. Create a file with the name `.env` in the root folder and set the following:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_DEFAULT_REGION
- AWS_HOST_URL (the url of you AWS EC2 instance)

2. Inside the root folder run `npm start`.
   This will start the express application on port `localhost:3001`

## Steps to run the frontend application locally

Inside the folder 'frontend' run `npm start`.
This will start the React application on port `localhost:3000`
