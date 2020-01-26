 "use strict";

 /**
  * All this stuff is moved into global namespace and separate files just to be
  * MAXIMUM clear and easy to understand
  */

 var client;

 function updateBrowserFP(result) {
     client.browserFP = result;
 }

 window.init = function(token) {
     client = new BB.BBClient({
         accessToken: token
     });
     client.browserFP = "default";
     new Fingerprint2().get(function(result, components) {
         updateBrowserFP(result); // a hash, representing your device fingerprint
         //console.log(components) // an array of FP components
     })

 };

 function sendText(text) {
     return client.textRequest(text);
 }

 function sendEvent(eventName, eventData) {
    return client.eventRequest(eventName, eventData);
 }
