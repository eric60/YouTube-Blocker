console.log("initiating Youtube Scholar");
let currentURL = location.href;
let allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology

console.log(location.href)
//console.log(document.getElementsByClassName("yt-simple-endpoint style-scope yt-formatted-string"))

// let allowed;
// chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
//     isAllowed = message.isAllowed;
// });

// function setAllowed(value) {
//     chrome.storage.local.set({allowed : value}, function(){
//     })
// }

 initiateisAllowed(currentURL)
    .then(json => {
        processYoutubeData(json, finishBlockingYoutubeUrl)
    })

  function parseToId(url){
    var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    var match = url.match(regEx);

    // check match array not null first, returns string id of YouTube video
    return (match && match[2].length == 11) ? match[2] : null; 
  }

  async function initiateisAllowed(url) {
    let videoId = parseToId(url);
    console.log('Youtube video id:' + videoId)

    if(videoId == null){
       return; // If URL is NOT a Youtube video then return true
    }
    const restAPI = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&fields=items(snippet(categoryId))&part=snippet`

    let response = await fetch(restAPI)
    console.log(response)
    let json = await response.json();
    console.log(JSON.stringify(json))
    return json;
  }

  function processYoutubeData(json, callback) {
    let videoCategory = json.items[0].snippet.categoryId;
    console.log("The video category of the Youtube video is " + videoCategory);

    let isAllowedResult = allowedIds.includes(videoCategory);

    console.log('isAllowedUrl: ' + isAllowedResult);
    if(isAllowedResult) {
        callback();
    }
  }


function finishBlockingYoutubeUrl() {
    chrome.storage.local.get(['activated'], function(data) {
        console.log('In content script- activated value: ' + data.activated)
    
        if (data.activated === true) {  
            alert("You are watching a non educational youtube video. Redirecting you back to youtube")
            //location.replace('http://youtube.com')
        }
    });
}




