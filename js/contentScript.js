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
        initiate();
    } 
    else {
        console.log('Blocking not activated. Not initiating')
    }
});

chrome.runtime.onMessage.addEventListener("change", function(request, sender, sendResponse) {
    if (request.query === 'Page updated')
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
    console.log("Initiating Youtube Blocker for new url: " + currentUrl);

    chrome.runtime.sendMessage({url: currentUrl}, function(response) {
        console.log("-------Response from send url message: -----------");
        processYoutubeData(response.json, blockYoutubeUrl)
    });
 }

  function processYoutubeData(json, callbackBlockYoutubeUrl) {
    const allowedIds = ['26', '27', '28']; // video category ids for Howto & Style, Education, Science & technology
    let videoCategory = json.items[0].snippet.categoryId;
    let videoCategoryString = youtubeCategoryMappings[videoCategory];
    console.log("YouTube Video Category: " + videoCategoryString);

    let isAllowedResult = allowedIds.includes(videoCategory);

    console.log('isAllowedUrl: ' + isAllowedResult);
    if(isAllowedResult == false) {
        callbackBlockYoutubeUrl(videoCategoryString);
    }
  }


function blockYoutubeUrl(videoCategoryString) {
    console.log('in blockYoutubeUrl')
    chrome.storage.local.get(['activated'], function(data) {
        console.log('Blocking Activated value: ' + data.activated)
    
        if (data.activated === true) {  
            console.log('---- Sent create notification to service_worker ----');
            // Block redirecting happens here
            location.replace('http://youtube.com')
            chrome.runtime.sendMessage({createNotification: true, videoCategoryString: videoCategoryString}, 
                function(response) {
            });           
        }
    });
}


  export function activateOptionsPage() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  }


