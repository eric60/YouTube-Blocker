let prevUrls = [];
let activated = false;
const youtubeCategoryMappings = {
    "1": "Film & Animation",
    "2": "Autos & Vehicles",
    "10": "Music",
    "15": "Pets & Animals",
    "17": "Sports",
    "18": "Short Movies",
    "19": "Travel & Events",
    "20": "Gaming",
    "21": "Videoblogging",
    "22": "People & Blogs",
    "23": "Comedy",
    "24": "Entertainment",
    "25": "News & Politics",
    "26": "Howto & Style",
    "27": "Education",
    "28": "Science & Technology",
    "29": "Nonprofits & Activism",
    "30": "Movies",
    "31": "Anime/Animation",
    "32": "Action/Adventure",
    "33": "Classics",
    "34": "Comedy",
    "35": "Documentary",
    "36": "Drama",
    "37": "Family",
    "38": "Foreign",
    "39": "Horror",
    "40": "Sci-Fi/Fantasy",
    "41": "Thriller",
    "42": "Shorts",
    "43": "Shows",
    "44": "Trailers"
  }

chrome.storage.local.get(['activated'], function(data) {
    activated = data.activated;  
    console.log('Activated value: ' + activated)  

    if (activated == true) {
        console.log('Blocking is activated. Initiating blocking')
        initiateYoutubeVideoBlocking();
    } 
    else {
        console.log('Blocking not activated. Not initiating')
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.query === 'Page updated')
    {
        console.log('Page updated');
        initiateYoutubeVideoBlocking();
    }
 });
 
 function initiateYoutubeVideoBlocking() {
    let currentUrl = location.href;
    if (prevUrls.includes(currentUrl)) {
        console.log('--------- Url already fetched. Not fetching again. ---------')
        return;
    }
    prevUrls.push(currentUrl);
    if (currentUrl == "https://www.youtube.com/") {
        console.log("Not messaging service_worker for action blockYoutubeVideo because url doesn't have a video")
        return;
    }
    console.log("Initiating Youtube Blocker for new url: " + currentUrl);
    sendMessageToServiceWorkerBackgroundToBlockYoutubeVideo(currentUrl)
 }

 function sendMessageToServiceWorkerBackgroundToBlockYoutubeVideo(currentUrl) {
     chrome.runtime.sendMessage({action: "blockYoutubeVideo", url: currentUrl}, function(response) {
        if (response.json == undefined) {return;}

        // blockYoutubeUrl function MUST be a callback function because the service_worker calling the Youtube Data API is an async function, if not callback then it would NOT execute
        processYoutubeData(response.json, blockYoutubeUrl)
    });
 }

  function processYoutubeData(json, blockYoutubeUrlCallbackFunction) {
    if (json == undefined) {return;}

    const allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology
    let videoCategory = json.items[0].snippet.categoryId;
    let videoCategoryString = youtubeCategoryMappings[videoCategory];
    console.log("YouTube Video Category: " + videoCategoryString);

    let isAllowedResult = allowedIds.includes(videoCategory);
    console.log('isAllowedUrl: ' + isAllowedResult);

    if(isAllowedResult == false) {
        blockYoutubeUrlCallbackFunction(videoCategoryString);
    }
  }


function blockYoutubeUrl(videoCategoryString) {
    console.log('in blockYoutubeUrl() function')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {
            blockTheYoutubeVideo()
            console.log('----> Sent message to the service_worker for action (createNotification). Response: ' + response);
            chrome.runtime.sendMessage({action: "createNotification", videoCategoryString: videoCategoryString}, function(response) {
            });
        }
    });
}

function blockTheYoutubeVideo() {
     location.replace('https://youtube.com')
}


