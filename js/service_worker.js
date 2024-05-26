// ======================== Service Worker Documentation =========================================
/*
A service worker is a background script that acts as the extension's main event handler.
https://developer.chrome.com/docs/extensions/reference/manifest/background
https://developer.chrome.com/docs/extensions/develop/concepts/service-workers#manifest

Extension service workers are an extension's central event handler. That makes them just different enough from web service workers that the mountains of service worker articles around the web may or may not be useful.

Extension service workers have a few things in common with their web counterparts. An extension service worker is loaded when it is needed, and unloaded when it goes dormant. Once loaded, an extension service worker generally runs as long as it is actively receiving events, though it can shut down. Like its web counterpart, an extension service worker cannot access the DOM, though you can use it if needed with offscreen documents.

Extension service workers are more than network proxies (as web service workers are often described). In addition to the standard service worker events, they also respond to extension events such as navigating to a new page, clicking a notification, or closing a tab. They're also registered and updated differently from web service workers.


 * Service workers are by definition event-driven and will terminate on inactivity. This way Chrome can optimize performance and memory consumption of your extension
 * Service workers will be reinitialized when the event is dispatched
 * Your extension scripts should use message passing to communicate between a service worker and other parts of your extension.
 * Currently that entails using sendMessage() and implementing chrome.runtime.onMessage in your extension service worker.
 * Long term, you should plan to replace these calls with postMessage() and a service worker's message event handler.

 * https://groups.google.com/a/chromium.org/g/chromium-extensions/c/UoogwQudJZo
 * The background script (the service worker) doesn't have `document` or `window`. There is NO access to the DOM or window since not connected to the window.
 * This script is generally only necessary to process `chrome` events like chrome.tabs.onUpdated. In this case you don't need the background script at all, simply process DOM events in your visible page e.g. in the action popup.
 */

// ============================== All Event Listeners =========================================
/*
 * ALL listeners MUST be registered in the top level of the script because service_workers are not constantly running.
 * https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
 * This works with a persistent background page because the page is constantly running and never reinitialized.
 * In Manifest V3, the service worker will be reinitialized when the event is dispatched.
 * This means that when the event fires, the listeners will not be immediately registered already at that exact moment in time (since they are added asynchronously), and the event will be missed.
 * Instead, move the event listener registration to the top level of your script. This ensures that Chrome will be able to immediately find and invoke your action's click handler, even if your extension hasn't finished executing its startup logic.
 */

let LOG_SERVICE_WORKER_PREFIX = "LOG for Youtube Blocker service_worker.js ---> "
let USER_API_KEY = "No Key Set"
let countApiCalls = 0;

  /*
   * we addEventListener for messages from content script to call YouTube Data API to determine if the video is allowed or now
   * Note: fetch request doesn't work in content script in context of web page due to CORs restrictions so we have to do the fetch API call in the service_worker
  */
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.log(LOG_SERVICE_WORKER_PREFIX + "In chrome.runtime.onMessage.addListener()")

      if (message.action == "createNotification") {
          console.log(LOG_SERVICE_WORKER_PREFIX + "received message for action: createNotification")
          let videoCategoryString = message.videoCategoryString;
          let message = "Your YouTube Video was blocked because it was not in the allow list."
          if (videoCategoryString != undefined) {
              message = `You were watching a ${videoCategoryString} video so it was blocked.`
          }
          showNotification(message);
      }
})

  chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.log(LOG_SERVICE_WORKER_PREFIX + "In chrome.runtime.onMessage.addListener()")

      if (message.action == "openOptionsPage") {
          console.log(LOG_SERVICE_WORKER_PREFIX + "received message for action: openOptionsPage")
          chrome.runtime.openOptionsPage();
      } else if (message.action == "blockYoutubeVideo" && message.url) {
          console.log(LOG_SERVICE_WORKER_PREFIX + "received message for action: blockYoutubeVideo")
          console.log('request url: ' + message.url);

          initiateIsAllowed(message.url).then(jsonData => {
              if (jsonData != undefined && jsonData.error != undefined) {
                handleYoutubeAPIError(jsonData)
              }
              else {
                sendResponse({json: jsonData});
              }
            })
          return true; // return true to indicate you want to send back a response asynchronously so that the message port on contentScript doesn't close before a response is received. This fixes the error: "chrome extension cannot access message before initialization" and Error: "Unchecked runtime.lastError: The message port closed before a response was received." and Error: "Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist." source: https://stackoverflow.com/a/57608759/9882969.
        // return false scenario: this is just telling the API to keep the messaging port open indefinitely, which will never be used by you, so it's just a memory leak source.
      }
  });

  chrome.storage.local.get('apiKey', function(data) {
     USER_API_KEY = data.apiKey
  })

  // notify content script when YouTube dynamically updates DOM to prevent re fetching API
  chrome.webNavigation.onHistoryStateUpdated.addListener(function() {
    console.log('page updated')
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {query: "Page updated"}, function(response) {
      });
    });
  })


  function handleYoutubeAPIError(json) {
    let message = json.error.message;
    console.log("---> API error trigger: " + message)

    let showingMessage = "Your Youtube key is invalid. Please make sure it is correct in the options page"

    let isBadRequest = message.indexOf("not valid");
    if (!isBadRequest) {
      showingMessage = "The Youtube key call limit was reached so it will not block videos anymore. It will reset at midnight PT/3 am EST. You can set a new key in the options page."
    }
    showNotification(showingMessage)
  }

  async function initiateIsAllowed(url) {
    let videoId = parseToId(url);
    console.log('New Youtube video id:' + videoId)

    let isURLNotYoutubeVideo = videoId == null;
    if (isURLNotYoutubeVideo){
       return;
    }

    const restAPI = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${USER_API_KEY}&fields=items(snippet(categoryId))`
    console.log("---> restAPI call: ")
    console.log(restAPI);

    countApiCalls++;
    console.log("API calls so far: " + countApiCalls)
    const response = await fetch(restAPI);
    console.log('--response message--')
    console.log(response);

    const json = await response.json();
    console.log('--response json--')
    console.log(json);
    return json;
  }

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);

    return (match && match[2].length == 11) ? match[2] : null;
  }

  function showNotification(message) {
    let options = {
        type: 'basic',
        iconUrl: '../resources/icon.png',
        title: "Youtube Blocker",
        message: message,
    }
    chrome.notifications.create('Youtube Blocker', options)
  }
