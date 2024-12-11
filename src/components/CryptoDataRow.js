import React from 'react';  

function CryptoDataRow(props) {  
    const { symbol, bid, ask, spot, change, img } = props.data;
    return (<div className="data-row">
                <img src={img} alt="currency-logo" className='logo-image'></img>
                <h4>{symbol} -- Change: {Math.round(change * 100) / 100} -- Live Price: {spot} -- Sell Price: {ask} -- Buy Price: {bid}</h4> 
            </div>);  
} 
export default CryptoDataRow;