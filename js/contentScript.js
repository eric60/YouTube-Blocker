
let firstRun = false;
let prevUrls = [];


initiate();


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    if(request.query === 'Page updated')
    {
        console.log('Page updated');
        initiate();
    }
 });


 
 function initiate() {
    let currentUrl = location.href;
    if(prevUrls.includes(currentUrl)) {
        console.log('--------- Not fetching. Url already fetched ---------')
        return;
    }
    prevUrls.push(currentUrl);
    console.log("Initiating Youtube Scholar for new url: " + currentUrl);

    chrome.runtime.sendMessage({url: currentUrl}, function(response) {
        console.log(response.json);
        processYoutubeData(response.json, blockYoutubeUrl)
    });
 }



  function processYoutubeData(json, callback) {
    const allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology
    let videoCategory = json.items[0].snippet.categoryId;
    console.log("The video category of the Youtube video is " + videoCategory);

    let isAllowedResult = allowedIds.includes(videoCategory);

    console.log('isAllowedUrl: ' + isAllowedResult);
    if(isAllowedResult == false) {
        callback();
    }
  }


function blockYoutubeUrl() {
    console.log('in blockYoutubeUrl')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {  
            location.replace('http://youtube.com')
            chrome.runtime.sendMessage({createNotification: true}, function(response) {
                console.log('create notification');
            });           
        }
    });
}





