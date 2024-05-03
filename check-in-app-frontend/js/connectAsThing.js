/**
 * Created by mccaul on 12/10/16.
 */

console.log("Webapp connecting as a Thing to AWS IOT MQTT");
console.log("Starting script");


AWS.config.region = REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
});

getAWSCredentials();

// Initialize the Amazon Cognito credentials provider
function getAWSCredentials() {
    console.log('Grabbing AWS credentials')
    AWS.config.credentials.refresh(function (err) {
        if (err) console.log(err, err.stack); // an error occurred
        else {                                // successful response);
            onCredentialsAvailable(AWS.config.credentials);
        }
    });
}

function onCredentialsAvailable(creds) {

    var cid = clientId();
    console.log('ClientID = ' + cid);

    // create connection to IoT Broker
    mqttClient = createMQTTClient({
        regionName: REGION,
        accessKey: creds.accessKeyId,
        secretKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
        endpoint: mqttEndpoint,
        clientId: cid
    });

    // connect(mqttClient);
}

function connect(client) {
    // connect mqtt client
    client.connect({
        onSuccess: onConnect,
        onFailure: onConnectionFailure,
        useSSL: true,
        timeout: 30,
        mqttVersion: 4
    });

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
}

// called when the client connects
function onConnect() {
    //show image
    $('#status').fadeTo("slow", 0);
    
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    console.table({
        "Subscribe Topic": SubscribeTopic,
        "MQTT Endpoint": mqttEndpoint,
        "Identity Pool ID": IdentityPoolId,
        "MQTT Status": "Connected!"
    })
    //$("#status").attr("src","img/checked.png");
    // document.getElementById("SubscribeTopic").innerText = SubscribeTopic;
    // document.getElementById("mqttEndpoint").innerText   = mqttEndpoint;
    // document.getElementById("IdentityPoolId").innerText = IdentityPoolId;

    // document.getElementById("MQTTstatus").innerText = 'CONNECTED';
    // document.getElementById("MQTTstatus").className = 'connected';

    //UPDATE TO MATCH YOUR THINGS
    mqttClient.subscribe(SubscribeTopic);

   // document.getElementById("MQTTstatus").innerText = 'CONNECTED';

    // message = new Paho.MQTT.Message("Hello");
    // message.destinationName = "alexa/demo/color";
    // mqttClient.send(message);
}

// called when client can not connect
function onConnectionFailure(error) {
    console.log("Connection failed.");
    console.log(error);
    //fade image
        $('#status').fadeTo("slow", 1);

        //$("#status").attr("src","img/warning.png");
        // allow user to reconnect when clicking the image
        $('#status').click(function () {
            console.log('Reconnecting with fresh credentials');
            getAWSCredentials(); //this will trigger the update of the MQTT client and connection
        });
    // document.getElementById("MQTTstatus").innerText = 'CONNECT FAIL';
    // document.getElementById("MQTTstatus").className = 'disconnected';
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);

        //fade image
        $('#status').fadeTo("slow", 1);

        // allow user to reconnect when clicking the image
        $('#status').click(function () {
            console.log('Reconnecting with fresh credentials');
            getAWSCredentials(); //this will trigger the update of the MQTT client and connection
        });
        // document.getElementById("MQTTstatus").innerText = 'CONNECTION LOST';
        // document.getElementById("MQTTstatus").className = 'disconnected';
    }
}

// called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived");
    // console.log("onMessageArrived:" + message.payloadString);

    payload = JSON.parse(message.payloadString);

    handleMessage(  // in updateDom.js
        JSON.stringify(
            payload.state.desired
        )
    );


} // close onMessageArrive

// generate a random UUID v4
function clientId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

