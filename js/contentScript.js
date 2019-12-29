console.log("Initiating Youtube Scholar");
let currentURL = location.href;
const allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology

  chrome.runtime.sendMessage({url: currentURL}, function(response) {
    console.log('receiving');
    console.log(response.json);
    processYoutubeData(response.json, blockYoutubeUrl)
  });


  function processYoutubeData(json, callback) {
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
            alert("You were watching a non educational youtube video so you were redirected.")
        }
    });
}




