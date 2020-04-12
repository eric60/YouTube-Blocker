
let firstRun = false;
let prevUrls = [];
let activated;

console.log(document.getElementById("collapsible").getElementsByTagName("a")[0].text)

chrome.storage.local.get(['activated'], function(data) {
    activated = data.activated;  
    console.log('Activated value: ' + activated)  

    if(activated == true) {
        console.log('Blocking is activated. Initiating blocking')
        initiate();
    } else {
        console.log('Blocking not activated. Not initiating')
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    if(request.query === 'Page updated')
    {
        console.log('Page updated');
        initiate();
    }
 });
 
 function initiate() {
    let currentUrl = location.href;
    if (prevUrls.includes(currentUrl)) {
        console.log('--------- Url already fetched.Not fetching again. ---------')
        return;
    }
    prevUrls.push(currentUrl);
    console.log("Initiating Youtube Study for new url: " + currentUrl);

    chrome.runtime.sendMessage({url: currentUrl}, function(response) {
        console.log("-------Response from send url message: " + response.json + " ------------");
        processYoutubeData(response.json, blockYoutubeUrl)
    });
 }

  function processYoutubeData(json, callbackBlockYoutubeUrl) {
    const allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology
    let videoCategory = json.items[0].snippet.categoryId;
    console.log("The video category of the Youtube video is " + videoCategory);

    let isAllowedResult = allowedIds.includes(videoCategory);

    console.log('isAllowedUrl: ' + isAllowedResult);
    if(isAllowedResult == false) {
        callbackBlockYoutubeUrl();
    }
  }


function blockYoutubeUrl() {
    console.log('in blockYoutubeUrl')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {  
            console.log('---- Sent create notification to background ----');
            // Block redirecting happens here
            location.replace('http://youtube.com')
            chrome.runtime.sendMessage({createNotification: true}, function(response) {
            });           
        }
    });
}





