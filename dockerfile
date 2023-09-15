#Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

#Copy package.json and package-lock.json to the container
COPY package*.json ./

#Install app dependencies
RUN npm install

#Copy the reset of the application code to the container
COPY . .

#Expose the port your app is running on (from your .env file)
EXPOSE 8080

#Command to run your application
CMD ["npm", "start"]