import { useEffect, useState } from 'react';
import './app.css';
import CryptoDataRow from './components/CryptoDataRow.js';
import ConnectionTracker from './components/ConnectionTracker.js';
import LastChangeTracker from './components/LastChangeTracker.js';

function App() {
    const [connected, setConnected] = useState(false);
    const [cryptoData, setCryptoData] = useState({
        "BTC": {
            "symbol": "BTC",
            "timestamp": 1718707723,
            "bid": 88973.83,
            "ask": 91044,
            "spot": 90008.92,
            "change": -0.49, 
            "img": "https://assets.coingecko.com/coins/images/12869/standard/qcad-logo2.a42bce89.png?1696512658"
        }
    }); // dummy item just to load up for my sake when testing
    const [lastChange, setLastChange] = useState({
            "symbol": "BTC",
            "timestamp": 1718707723,
            "bid": 88973.83,
            "ask": 91044,
            "spot": 90008.92,
            "change": -0.49, 
            "img": "https://assets.coingecko.com/coins/images/12869/standard/qcad-logo2.a42bce89.png?1696512658"
    }); // dummy item just to load up for my sake when testing
    useEffect(() => { 
    console.log('React app has Launched!');
    const url = 'ws://localhost:3000/markets/ws';
    const ws = new WebSocket(url);
        ws.onopen = event => { 
            console.log('connection established to server');
        };

        ws.onmessage = message => {
            // console.log(JSON.parse(message.data));
            const { event, channel, data } = JSON.parse(message.data); 
            
            // once websocket connection has been established, then subscribe for the data. 
            if (event === "connection-successful") { 
                setConnected(true); 
                ws.send(JSON.stringify({
                    event: 'subscribe', 
                    channel: "rates"
                }));
                setCryptoData(data);
            }
            else if (event === "data") { 
                setLastChange(data)
                console.log(data); // log the data to console so we can see the market data coming in. 
            }
        }
  },[])
    return (
        <div id="app">
            <header>
                <ConnectionTracker connected={connected}/>
            </header>
            <div>
                <h2>Welcome to Newton!</h2>
                <div>
                    <h4>Last Change</h4>
                    <LastChangeTracker data={lastChange} />
                </div>
                <div id="data-row-area">
                    {Object.keys(cryptoData).map(symbol => <CryptoDataRow data={cryptoData[symbol]}/>)}
                </div>
            </div>
        </div>
  );
};

export default App;
