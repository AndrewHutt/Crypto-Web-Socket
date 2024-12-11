import requests as rq
import json
import time
import random

# Getting API Key & establishing header
with open("./data-simulation/auth.json", 'r') as json_file:
    apikey = json.load(json_file)

headers = {"accept": "application/json", "X-CMC_PRO_API_KEY": apikey["X-CMC_PRO_API_KEY"]}

print(headers)

# Supported Coin List
coinList = ["QCAD", "BTC", "ETH", "LTC", "XRP", "BCH", "USDC", "XMR", "XLM",
 "USDT", "DOGE", "LINK", "MATIC", "UNI", "COMP", "AAVE", "DAI",
 "SUSHI", "SNX", "CRV", "DOT", "YFI", "MKR", "PAXG", "ADA", "BAT", "ENJ",
 "AXS", "DASH", "EOS", "BAL", "KNC", "ZRX", "SAND", "GRT", "QNT", "ETC",
 "ETHW", "1INCH", "CHZ", "CHR", "SUPER", "ELF", "OMG", "FTM", "MANA",
 "SOL", "ALGO", "LUNC", "UST", "ZEC", "XTZ", "AMP", "REN", "UMA", "SHIB",
 "LRC", "ANKR", "HBAR", "EGLD", "AVAX", "ONE", "GALA", "ALICE", "ATOM",
 "DYDX", "CELO", "STORJ", "SKL", "CTSI", "BAND", "ENS", "RNDR", "MASK",
 "APE"]

# Hepler Functions
baseTimeStamp = 1733179320 # about a week ago
def getTimeStamp(daysAdded): 
    return baseTimeStamp + (daysAdded * (60*60*24))

def calculateNewPrice(priceArray, currentIndex, priceChange):
    checkIndex = int(currentIndex) - 1
    # print(currentIndex)
    # print(priceArray)
    lastpriceItem = priceArray[checkIndex]
    newprice = ((100 + priceChange) / 100) * lastpriceItem["spot"]
    return round(newprice, 2)

def calculateBidPrice(price): 
    return round(price * 0.9885,2)

def calculateAskPrice(price): 
    return round(price * 1.0115, 2)


# Initializing Coin Object
coinOutputObject = {}

# Retrieving Data for Each Coin
for coin in coinList:
    # Setting up intial request URL
    url = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol="
    
    # Getting intial coin data - quote price latest data
    response = rq.get(url + coin, headers=headers)
    responseData = json.loads(response.text)

    # getting the max market cap of the coin. 
    maxMarketCap = 0
    for resCoin in responseData["data"][coin]:            
        if resCoin["quote"]["USD"]["market_cap"] != None and resCoin["quote"]["USD"]["market_cap"] > maxMarketCap: 
            maxMarketCap = resCoin["quote"]["USD"]["market_cap"]
    
    # getting just the coin where it matches that market cap. 
    matchedCoinArray = list(filter(lambda x: x["quote"]["USD"]["market_cap"] == maxMarketCap, responseData["data"][coin]))
    if len(matchedCoinArray) < 1: 
        coinOutputObject[coin] = {
            "id": 0,
            "ticker": coin,
            "slug": "",
            "name": "", 
            "iconUrl": "",
            "lastUpdateIndex": 0,
            "priceData": []
        }
        print(f'{coinOutputObject[coin]["ticker"]} added to coin list') # so that I can see its layering in the coin data
    else:
        matchedCoin = matchedCoinArray[0]

        # Get Current Price in CAD
        currencyConvertUrl = f'https://pro-api.coinmarketcap.com/v2/tools/price-conversion?amount=1&id={matchedCoin["id"]}&convert=CAD'
        currencyResponse = rq.get(currencyConvertUrl, headers=headers)
        currencyResponseData = json.loads(currencyResponse.text)

        # Simulate price change - Construct Array of 10 atrificial data points (random number)
        priceDataArray = []
        for i in range(7):
            randomChange = random.uniform(-2.5, 2.5)
            if (i == 0): 
                #initial Price
                initialPrice = round(currencyResponseData["data"]["quote"]["CAD"]["price"],2)
                priceDataArray.append({
                    "symbol": coin,
                    "timestamp": getTimeStamp(i),
                    "bid": calculateBidPrice(initialPrice),
                    "ask": calculateAskPrice(initialPrice),
                    "spot": initialPrice, 
                    "change": randomChange
                })
            else: 
                # Come up with a random change
                randomChange = random.uniform(-2.5, 2.5)
                newspot = calculateNewPrice(priceDataArray, i, randomChange)
                priceDataArray.append({
                    "symbol": coin,
                    "timestamp": getTimeStamp(i),
                    "bid": calculateBidPrice(newspot),
                    "ask": calculateAskPrice(newspot),
                    "spot": newspot,
                    "change": randomChange
                })

        # Query for the ICON - To Do down the line.
        iconUrl = f'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id={matchedCoin["id"]}'
        iconResponse = rq.get(iconUrl, headers=headers)
        # print(iconResponse)
        iconResponseData = json.loads(iconResponse.text) 
        # print(iconResponseData)

        coinOutputObject[coin] = {
            "id": matchedCoin["id"],
            "ticker": coin,
            "slug": matchedCoin["slug"],
            "name": matchedCoin["name"], 
            "iconUrl": iconResponseData["data"][str(matchedCoin["id"])]["logo"],
            "lastUpdateIndex": 0,
            "priceData": priceDataArray # type: ignore
        }
        print(f'{coinOutputObject[coin]["name"]} added to coin list') # so that I can see its layering in the coin data
        time.sleep(6) # Managing API Request Limit

#output file to JSON. 
with open("coinlist.json","w", encoding="utf-8") as f:
    f.write(json.dumps(coinOutputObject))
