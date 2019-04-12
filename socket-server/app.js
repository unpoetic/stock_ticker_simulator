const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);
const io = socketIo(server); // < Interesting!

io.on("connection", socket => {
    console.log("New client connected"), setInterval(
      () => getApiAndEmit(socket),
      10000
    );
    socket.on("disconnect", () => console.log("Client disconnected"));
});

let interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 100);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const getApiAndEmit = async socket => {
    try {
      const res = await axios.get(
        "http://localhost:3001/api/getData/"
      );

      updateApiAndEmit(res.data.data);
      socket.emit("FromAPI", res.data); // Emitting a new message. It will be consumed by the client
      //console.log(res.data);

    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
  };

  const randomFloat = (min,max) => {
    let num = Math.random()*(max-min+1)+min; 
    return parseFloat(num.toFixed(2));
  }

  const updateApiAndEmit = async body => {
    if(body){
        if( body[0].priceHistory.length > 100) {
          body[0].priceHistory.length = 0;
          body[0].curPrice = randomFloat(0.50, 800)
        }
        //console.log("Generate new data and update our database here.")
        //console.log(body[0].opPrice);
        /* if(body[0].priceHistory.length > 10){
            body[0].priceHistory.length = 5;
        } */

    let randDelta = randomFloat(0, body[0].curPrice / 500);
    let posNeg = Math.round(randomFloat(-0.8, 1));
    //console.log(posNeg);
    body[0].priceHistory.push(body[0].curPrice);

    if(posNeg > 0){
        body[0].curPrice += randDelta;
    } else {
        body[0].curPrice += randDelta * -1;
    }

    
    

        try {
            //console.log(body);
        const res = await axios.post(
            "http://localhost:3001/api/updateData/",
            body[0]
        ); // Getting the data from DarkSky
        socket.emit("FromAPI", res); // Emitting a new message. It will be consumed by the client
        //console.log(res);

        } catch (error) {
        //console.error(`Error: ${error.code}`);
        }
    }
  };

  server.listen(port, () => console.log(`Listening on port ${port}`));
