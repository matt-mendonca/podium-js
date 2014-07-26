How to load a revealjs presentation into Podium

- Place your presentation directory into the slides directory
- Create a podium.json file that specifies the name of the presentation and what route (url) you want to associate it with
- Create a directory called public and place all of your static assets into it (e.g. css files, js files)
- Include the socket io and podium js files in your markup. Since it is stored in podium's public folder, the following should suffice: <script src="/socket.io/socket.io.js"></script> <script src="podium.js"></script>