# Crypto Web Socket & Basic Display
Welcome to my project. This project is meant to showcase a very basic cryptocurrency websocket. 

# How to Use the Project
There are 2 main components, a basic react application which has to be compiled to the build folder and a server.The build folder is served by the server when the server is running.

To run the project & to see the data, you start the server with npm run server command, and then go navigate to the localhost endpoint. 

# Focus of Work
The focus of my work was on getting data from a reliable source, and then developing a basic connection between client and server. For the sake of this project, all resources are coming from a single source. 

I used an API to get current data for all listed assets using python (data-simulation folder), and then generated sample datapoints for each. When there are no clients connected, the websocket sits in a dormant state, and only will start sesnding crypto updates when a client connects again. 

Though there is only one working channel, I started to lay the groundwork for additional channels. This included roughing in unsubscribe messages, as well as additional channels. 

The display of course is very basic, and really just serves to showcase the connection. 

# Project Next Steps and Further Thoughts
- If I was to continue building out this application, I would continue developing the subscribe / unsubscribe mechanism to make the most efficient use possible of the connection.
- Futher of course, building out the react app would go a long way to improve the project. I would propogate updates to the actual list of currencies, rather than just the top pane and console.  

