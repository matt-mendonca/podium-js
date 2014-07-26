podium js
========

podium js is a presentation framework for [reveal js](http://revealjs.com/) slide decks. It is built on top of [express js](http://expressjs.com/) and [node js](http://nodejs.org/). It is inspired by [thehung111's presentation remote](https://github.com/thehung111/remote-presentation-controller) - more on that in a bit.

why
----

Mimic keynote - I like how I can control my laptop's slides (which is being displayed on a big screen) from my phone. Controlling my slides from my phone allows me the freedom to move around will speaking.

why not fork
--------------
#### subtext: why be a jerk

The hung did great work, and full credit goes to him for the original idea. I came across his project and initially I was going to fork his code. However, I decided to start fresh due to the tight coupling and age of the code base (last updated 2 years ago as of July 2014):

- The version of reveal js is mixed in with the remote code.
  - I wanted to update reveal js, but it proved messy 
- Adding a new presentation requires you to edit the code in several places
  - After initial setup, I wanted as few steps as possible to add a new deck
- There are places were things are hard coded.
  - E.g. the select list for the remote
- Using the latest version of express and socket
- Jade instead of ejs
- We have different coding styles (a shallow point, I know)

what it does
--------------

podium js is a frame work to make presenting your reveal js slides easier. It allows you to drop in your already made reveal slides and control them with the built in remote.  

getting started
-----------------
- Place your reveal js directory into the slides directory
- Create a podium.json file that specifies the name of the presentation and what route (url) you want to associate it with
- Create a directory called public in your reveal js directory and place all of your static assets into it (e.g. css files, js files)
- Include the socket io and podium js files in your markup.
  - Since both of those files are in podium's public folder, you should only need to add the following script tags before the closing body tag
    - <script src="/socket.io/socket.io.js"></script>
    - <script src="podium.js"></script>