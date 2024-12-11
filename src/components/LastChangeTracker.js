import React from 'react';  

function LastChangeTracker(props) {  
    if (props.data) { 
        return (<div>
            <h5>Currency: {props.data.symbol} - Change%: {Math.round(props.data.change * 100) / 100}</h5>
        </div>) 
    }
    return <h5>None</h5>;
} 
export default LastChangeTracker;