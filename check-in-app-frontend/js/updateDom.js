/*jslint node: true */
/*jshint esversion: 6 */

'use strict';

function handleMessage(msg) {  // called from within connectAsThing.js
    // display the JSON message in a panel
    //document.getElementById('panel').innerHTML = msg;

    console.log("message: " + msg);

    if (JSON.parse(msg).filter) {

    }
    // && new URL(window.location.href).hostname === "dbaz2ep61ayzx.cloudfront.net"
    if (JSON.parse(msg).command && JSON.parse(msg).command === "take_picture_cic") {
        console.log("Taking a picture at the CIC.")
        console.log("Current URL: ", new URL(window.location.href).hostname);
        let scope = angular.element(document.getElementById("video")).scope();
        document.getElementById("loader").style.display = 'block';
        scope.takePicture()
    }
    
    if (JSON.parse(msg).command && JSON.parse(msg).command === "take_picture_stadium_suite" && new URL(window.location.href).hostname === "d1bfiy5xu4ybp3.cloudfront.net") {
        console.log("Taking a picture at the stadium suite.")
        console.log("Current URL: ", new URL(window.location.href).hostname);
        let scope = angular.element(document.getElementById("video")).scope();
        document.getElementById("loader").style.display = 'block';
        scope.takePicture()
    }

}

function reloader() {
    location.reload(true);  // hard reload including .js and .css files
}

