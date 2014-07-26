podium js
========
podium js is a presentation platform framework (wat?) for [reveal js](http://revealjs.com/) slide decks. It is built on top of [express js](http://expressjs.com/) and [node js](http://nodejs.org/). It is inspired by [thehung111's remote presentation controller](https://github.com/thehung111/remote-presentation-controller) (most of the remote code is logically the same) - more on that in a bit.

why
----
Mimic keynote - I like how I can control my laptop's slides (which are likely being displayed on a big screen) from my phone. It allows me freedom of movement.

why not fork
--------------
The hung did great work, and full credit goes to him for the original idea. I came across his project and initially I was going to fork his code. However, I decided to create a new code base due to the tight coupling of and lack of activity on his project (last updated 2 years ago as of July 2014):

- The reveal js code is mixed in with the remote code.
- Adding a new presentation requires you to edit the remote code in several places
  - After initial setup, I wanted as few steps as possible to add a new deck
- There are places were things are hard coded.
- I wanted to use
  - the latest version of express and socket.io (and reveal js)
  - Jade instead of ejs
- We have different coding styles (a shallow point, I know)

what it does
--------------
podium js is a frame work to make presenting your reveal js slides easier. It allows you to drop in your already made reveal slides and control them with the built in remote.  

requirements
-----------------
- nodejs

loading a reveal js deck into podium
------------------------------------
- Place your reveal js directory into the slides directory
- Create a podium.json file in the reveal js directory that specifies the name of the presentation and what route (url) you want to associate it with
- Create a directory in the reveal js directory called public and place all of your static assets into it (e.g. css files, js files)
  - You shouldn't have to change any of the paths in your reveal js markup thanks to Express's static middleware routing magic
- Include the socket io and podium js files in your reveal js markup
  - Since both of those files are in podium's public folder, you should only need to add the following script tags before the closing body tag

```html
  <script src="/socket.io/socket.io.js"></script>
  <script src="podium.js"></script>
```

podium will wire everything else up for you.

using podium
------------
####High level:

1. Laptop
  - Fire up the node app
  - Go to the app in a browser
  - Choose the slides in the app
2. Phone
  - Go to the to app in a browser
  - Launch the controller
  - Pick the correct slides

####Low level:

podium comes with an example reveal deck - for this section we will be presenting it.

To start, connect your laptop and phone to the same network. I'd recommend setting up a local network only you can get to (lest someone mess with the slides during your presentation - authentication coming soon). E.g. [http://www.tuaw.com/2009/09/25/mac-101-create-a-wireless-network-between-mac-and-iphone/](http://www.tuaw.com/2009/09/25/mac-101-create-a-wireless-network-between-mac-and-iphone/).

Then, on yor laptop (order matters - you must open the slides before connecting the remote):

- run the app.js file in node 
  - on OSX this mean
    - open up a terminal window
    - node path/to/podium/app.js
  - everyone else, check out the node docs
- you should see a log message saying 'podium server listening on port 3000' (port number can be configured in the config.json file)  
- navigate to [http://localhost:3000/ or http://laptopIpAddress:3000/](http://localhost:3000/)
- click the link for the deck you want to present
  - e.g. [example](http://localhost:3000/example)

Finally, on your phone:

- navigate to [http://localhost:3000/ or http://laptopIpAddress:3000/](http://localhost:3000/)
- click the [launch controller](http://localhost:3000/controller) button
- select the correct deck from the select list
- use the arrow buttons to navigate