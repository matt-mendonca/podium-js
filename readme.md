podium js
=========
podium js is a presentation system / framework (wat?) for [reveal js](http://revealjs.com/) slide decks. It is built on top of [express js](http://expressjs.com/) and [node js](http://nodejs.org/). It is inspired by [thehung111's remote presentation controller](https://github.com/thehung111/remote-presentation-controller) (much of the remote code is logically the same) - more on that in a bit.

### what it does

podium js makes presenting (read: when standing in front of a crowd) your reveal js slides easier. It allows you to drop in your already made reveal slides and control them with the built in controller. 

### so what *is* podium js

Generally speaking, podium js is made up of an express socket server, a controller app, and a minimal js client script. The controller app / client script sends slide state data (current slide, slide changes, view mode changes) to the server. The server then process and broadcasts that data out to all of the actively connected presentations. 

It wires up all of the pieces to make your pre made reveal slides remote controllable.

### why

Mimic keynote - I like how I can control my laptop's slides (which are likely being displayed on a big screen) from my phone. It allows me freedom of movement.

### why not fork

The hung did great work, and full credit goes to him for the original idea. I came across his project and initially I was going to fork his code. However, I decided to create a new code base due to the tight coupling of and lack of activity on his project (last updated 2 years ago as of July 2014):

- The reveal js code is mixed in with the remote code
- Adding a new presentation requires you to edit the remote code in several places
  - After initial setup, I wanted as few steps as possible to add a new deck
  - Also be able to drop in an existing deck
- There are places were things are hard coded
- I wanted to be able to control the slides while viewing them from the controller
- I wanted to use
  - the latest version of express and socket.io (and reveal js)
  - Jade instead of ejs
- We have different coding styles (a shallow point, I know) 

getting started
---------------

### requirements

- node js
- npm

### setup

- Download
- Run npm install / npm update on the podium directory

### loading a reveal js deck into podium

- Place your reveal js directory into podium's slides directory
- Optionally create a podium.json file in the reveal js directory that specifies the name of the presentation and what route (url) you want to associate it with. If omitted, podium will set the name and route for you
- Create a directory in the reveal js directory called public and place all of your static assets into it (e.g. css files, js files)
  - You shouldn't have to change any of the paths in your reveal js markup thanks to Express's static middleware routing magic

podium will wire everything else up for you. You can reference the example slides directory included with podium.

Note: podium will try to load your slides from an index.html file from within your slides directory. Also, podium will append a script tag for socket io and podium to the body of your slides markup.

### using podium

#####High level:

1. Laptop
  - Fire up the node app
  - Go to the app in a browser
  - Choose the slides in the app
2. Phone
  - Go to the to app in a browser
  - Launch the controller
  - Pick the correct slides

#####Low level:

podium comes with an example reveal deck - for this section we will be presenting it.

To start, connect your laptop and phone to the same network. I'd recommend setting up a local network only you can get to (lest someone mess with the slides during your presentation - authentication coming soon). E.g. [http://www.tuaw.com/2009/09/25/mac-101-create-a-wireless-network-between-mac-and-iphone/](http://www.tuaw.com/2009/09/25/mac-101-create-a-wireless-network-between-mac-and-iphone/).

Then, on yor laptop (order matters - you must open the slides before connecting the remote - for now):

- Run the app.js file in node 
  - On OSX this mean
    - Open up a terminal window
    - Node path/to/podium/app.js
  - Everyone else, check out the node docs
- You should see a log message saying 'podium server listening on port 3000' (port number can be configured in the config.json file)  
- Navigate to [http://localhost:3000/ or http://laptopIpAddress:3000/](http://localhost:3000/)
- Click the link for the deck you want to present
  - E.g. [example](http://localhost:3000/example)

Lastly, on your phone:

- Navigate to [http://localhost:3000/ or http://laptopIpAddress:3000/](http://localhost:3000/)
- Click the [launch controller](http://localhost:3000/controller) button
- Select the correct deck from the select list
- Use the arrow buttons to navigate
- OR click the [control in presentation](http://localhost:3000/example?controller=true) button to control the slides while viewing them
- You can also control while viewing the presentation by adding ?controller=true to the end of the slides url. E.g. [localhost:3000/example?controller=true](http://localhost:3000/example?controller=true).
