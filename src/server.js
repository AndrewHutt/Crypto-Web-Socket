// Imports
const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const serveStatic = require("serve-static");
const fs = require("fs");

// Loading Simulated Data
const simulatedData = JSON.parse(fs.readFileSync('./data-simulation/coinlist.json', "utf-8"));
const coinList = ["QCAD", "BTC", "ETH", "LTC", "XRP", "BCH", "USDC", "XMR", "XLM",
    "USDT", "DOGE", "LINK", "MATIC", "UNI", "COMP", "AAVE", "DAI",
    "SUSHI", "SNX", "CRV", "DOT", "YFI", "MKR", "PAXG", "ADA", "BAT", "ENJ",
    "AXS", "DASH", "EOS", "BAL", "KNC", "ZRX", "SAND", "GRT", "QNT", "ETC",
    "ETHW", "1INCH", "CHZ", "CHR", "SUPER", "ELF", "OMG", "FTM", "MANA",
    "SOL", "ALGO", "LUNC", "UST", "ZEC", "XTZ", "AMP", "REN", "UMA", "SHIB",
    "LRC", "ANKR", "HBAR", "EGLD", "AVAX", "ONE", "GALA", "ALICE", "ATOM",
    "DYDX", "CELO", "STORJ", "SKL", "CTSI", "BAND", "ENS", "RNDR", "MASK",
    "APE"];

// Setting Port and establishing app
const port = 3000;
const app = express();

// Creating http server for initial handshake
const server = http.createServer(app);

//Serving static files when endpoint is accessed. 
app.use(serveStatic('build'));

/* WebSocket Logic */ 
// Declare Variables 
// Establishing a basic object to store array of WebSocket subscribers by channel
const channelSubscribers = { 
    "rates": [],
    "markets": [] // Fake Channel -- used for illustrative purposes. 
}

// Helper Functions
const manageChannelSubscription = (channel, socket) => { 
    // Validate Channel exists, and the socket is not already subscribed
    if (Object.keys(channelSubscribers).includes(channel) && !channelSubscribers[channel].includes(socket)) { 
        channelSubscribers[channel].push(socket);
        console.log(`New Subscriber added to the ${channel} channel. Current count: ${channelSubscribers[channel].length}`);
        switch (channel) { 
            case "rates":
                socket.send(JSON.stringify({channel, event: "data", data: simulatedData["BTC"]["priceData"][0]})); // send back generic first message - btc price @ subscription start 
                break;
            case "markets": 
                socket.send({channel, event: "data", data}); // something else
                break;
        }
        manageCryptoInforamtionStream(channel);
    }
}

const manageChannelUnsubscription = (channel, socket) => { 
    const socketIndex = channelSubscribers[channel].findIndex(subscriber => subscriber === socket); 
    if (socketIndex !== -1) { 
        channelSubscribers[channel].splice(socketIndex,1);
    }
    manageCryptoInforamtionStream(channel);
}

const getInitialData = () => { 
    setAllDataPointIndex(1);
    const outputObject = {};
    Object.keys(simulatedData).forEach(key => { 
        imageObj = { img: simulatedData[key]["iconUrl"]};
        outputObject[key] = {...simulatedData[key]["priceData"][0], ...imageObj};
    });
    return outputObject;
}

const incrementDataPointIndex = (ticker) => {
    simulatedData[ticker]["lastUpdateIndex"] ++;
}

const setAllDataPointIndex = (newIndex) => { 
    Object.keys(simulatedData).forEach(ticker => {
        simulatedData[ticker]["lastUpdateIndex"] = newIndex;
    });
}

const broadCastCryptoUpdate = (channel, data) => { 
    const currentChannelSubs = channelSubscribers[channel];
    currentChannelSubs.forEach(socket => { 
      socket.send(JSON.stringify({ event: "data", channel, data }));
    });
}

// Simulate flow of Data
const updateInterval = 2500;
let broadcasting = false;
let broadcastInterval = null;

const getRandomUpdate = () => { 
    const tickerToUpateIndex = Math.floor(Math.random() * (coinList.length));
    const ticker = coinList[tickerToUpateIndex];
    const coinData = simulatedData[ticker];
    const nextUpdate = coinData["priceData"][coinData["lastUpdateIndex"]]
    incrementDataPointIndex(ticker);
    if (simulatedData[ticker]["lastUpdateIndex"] === 7) { // remove the coin from potential updates due to being out of sample data. 
        coinList.splice(tickerToUpateIndex,1);
    }
    return nextUpdate;
}

const manageCryptoInforamtionStream = (channel) => { 
    const anyActiveChannels = Object.values(channelSubscribers).some((channel) => { return channel.length >= 1} );
    if (anyActiveChannels && broadcasting === false) { 
      broadcasting = true;
      broadcastInterval = setInterval(() => { 
        const updateData = getRandomUpdate();
        broadCastCryptoUpdate(channel, updateData);
      }, updateInterval);
    } else { 
      broadcasting = false;
      clearInterval(broadcastInterval);
      broadcastInterval = null; 
      setAllDataPointIndex(0);
    }
  }

// WebSocket Creation
const wss = new WebSocket.Server({server, path: '/markets/ws'});
wss.on('connection', socket => { 
    console.log('New WebSocket Connection Established');
    // sending connection message to prompt webpage to subscribe to channel
    socket.send(JSON.stringify({event: "connection-successful", data: getInitialData()}));

    // recieving and parsing incoming messages. 
    socket.on('message', (message) => { 
        const { event, channel } = JSON.parse(message);
        switch(event) { 
            case 'subscribe': 
                manageChannelSubscription(channel, socket);
                break;
            case 'unsubscribe': 
                manageChannelUnsubscription(channel, socket);
                break;
            default: 
                break;
        }
    });

    socket.on('close', () => {
        Object.keys(channelSubscribers).forEach(channel => manageChannelUnsubscription(channel, socket)); // unsubscribing user from all active channels
    });
});

server.listen(port, () => { 
    console.log(`Server listening on http://localhost:${port}`);
});