import React from 'react';  

function ConnectionTracker(props) {  
    const connected = props.connected && props.connected == true;
    return <h1>{connected ? "You are Connected to the WebSocket!" : "You are NOT connected to the WebSocket"}</h1>;  
} 
export default ConnectionTracker;