# Flavor Finder AI: What's the best dish to order?

https://www.find-flavor.com/

### Images
<img width="1726" alt="Screenshot 2024-04-12 at 11 33 01 PM" src="https://github.com/arnavkushwah/find-flavor/blob/main/images/img1.png">
<img width="688" alt="Screenshot 2024-04-12 at 11 34 56 PM" src="https://github.com/arnavkushwah/find-flavor/blob/main/images/img2.png">
<img width="628" alt="Screenshot 2024-04-12 at 11 35 06 PM" src="https://github.com/arnavkushwah/find-flavor/blob/main/images/img3.png">
<img width="713" alt="Screenshot 2024-04-12 at 11 35 14 PM" src="https://github.com/arnavkushwah/find-flavor/blob/main/images/img4.png">
<img width="670" alt="Screenshot 2024-04-12 at 11 35 28 PM" src="https://github.com/arnavkushwah/find-flavor/blob/main/images/img5.png">

### React App
To run the React app,
```
$ cd client
$ cd flavor-finder
$ npm install --legacy-peer-deps
$ npm start
```

### Deploying Client
Vercel Deployment - https://vercel.com/arnavkushwahs-projects/flavor-finder-ai -> 
To setup, do:
- Set Framework Preset to "create-react-app"
- Set "install command" to `npm install --legacy-peer-deps`
- Set root directory as a custom root directory -> /client/react-test-website


### Deploying Server

Amazon Lambda Deployment - https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/FoodRecommender?tab=code

Amazon DynamoDB Tables - https://us-east-2.console.aws.amazon.com/dynamodbv2/home?region=us-east-2#tables

We use Amazon Lambda and follow this tutorial (https://docs.aws.amazon.com/lambda/latest/dg/python-package.html).
- When creating the lambda (https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/create/function)
  - Under Advanced Settings, make sure to "Enable function URL" while choosing AUTH as None
  - Check "Configure cross-origin resource sharing (CORS)"
  - Choose Python 3.12 as the runtime.
- After creating the lambda
  - Go to "Configuration", and set Timeout to 25 seconds.
  - Go to "Configuration", and click on Permissions. Then, click on "Role Name" (aka FoodRecommender-role-g0t66ffd). On the next portal, click on "Add Permission" and "Attach Policy". Search for "AmazonDynamoDBFullAccess" and add it.
Create DynamoDB following this tutorial (https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-dynamo-db.html#http-api-dynamo-db-create-table).
- Go to https://console.aws.amazon.com/dynamodb/
  - Create table called "food-recommender-reviews"
  - Set Partition Key as "restaurant" and string
  - Create table called "food-recommender-gpt-response"
  - Set Partition Key as "response" and string
  - Create table called "yelp-api-business-search"
  - Set Partition Key as "restaurant_and_location" and string


0. Delete my_deployment_package.zip if it already exists
```
$ cd server
$ cd food_recommender_server
$ mkdir package
$ pip3 install --target ./package boto3 --platform manylinux2014_x86_64 --only-binary=:all: --implementation cp --python-version 3.12
$ pip3 install --target ./package openai --platform manylinux2014_x86_64 --only-binary=:all: --implementation cp --python-version 3.12
$ pip3 install --target ./package bs4 --platform manylinux2014_x86_64 --only-binary=:all: --implementation cp --python-version 3.12
$ pip3 install --target ./package requests --platform manylinux2014_x86_64 --only-binary=:all: --implementation cp --python-version 3.12
$ cd package
$ zip -r ../my_deployment_package.zip .
$ cd ..
$ zip my_deployment_package.zip lambda_function.py
```

Then, we can upload my_deployment_package.zip to the Amazon lamba function console under the "Upload From" section. We should be able to send requests to the custom lambda URL.
