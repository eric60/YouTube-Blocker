let activated;
let category;
let observer;
let prevUrls = [];
let url;
let reinitiateCnt = 1;
const ytCategoryMappings = [
    "Film & Animation",      
    "Autos & Vehicles",      
    "Music",      
    "Pets & Animals",      
    "Sports",      
    "Short Movies",      
    "Travel & Events",      
    "Gaming",      
    "Videoblogging",      
    "People & Blogs",      
    "Comedy",      
    "Entertainment",      
    "News & Politics",      
    "Howto & Style",      
    "Education",      
    "Science & Technology",      
    "Nonprofits & Activism",      
    "Movies",      
    "Anime/Animation",      
    "Action/Adventure",      
    "Classics",      
    "Comedy",      
    "Documentary",      
    "Drama",      
    "Family",      
    "Foreign",      
    "Horror",      
    "Sci-Fi/Fantasy",     
    "Thriller",      
    "Shorts",      
    "Shows",      
    "Trailers"
]
    
    

// function initiateMutationObserver() {
//     MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

//     observer = new MutationObserver(function(mutations, observer) {
//         // fired when a mutation occurs
//         if(activated == true) {
//             initiate()
//         }
//     });

//     // define what element should be observed by the observer
//     // and what types of mutations fr the callback
//     observer.observe(document, {
//         subtree: true,
//         childList: true
//     });
// }

function getActivated() {
    chrome.storage.local.get('activated', function(data) {
        activated = data.activated;  
        if (activated == true) {
            console.log('--- Activated. Initiating YouTube Blocker blocking')
            return true;
        } 
        else {
            console.log('--- Not activated. Not initiating')
            return false;
        }
    });
}
getActivated()

// Youtube SPA updates DOM dynamically
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {  
    if (request.query === 'Page updated') {
        console.log('Page updated, Activated: ' + request.activated);
        initiate()
    }
    else if (request.query == "Changed activated") {
        activated = request.activated;
    }
    console.log("--- activated: " + activated)
 });
 
 

//  function excludeDuplicateUrls(url) {
//     if (prevUrls.includes(url)) {
//         return;
//     }
//     prevUrls.push(url)
//  }

 /*
    clickMore
    getCategory
    processYoutubeCategory 
    BlockYoutubeUrl

    check activated value before each initiate, as background may have turned activated off
    so content needs to check each time.
 */
 function initiate() {
    if (activated == false) {
        return;
    }
    else if (activated == true) {
        console.log('--- Inside initiate initiating, activated:' + activated)
        url = window.location.href;
        if (!isYoutubeVideo(url)) {
            console.log("Not youtube video")
            return;
        } 
        else {
            console.log("Initiating Youtube Blocker for " + url);
            clickMoreTrigger()
        }
    }
 }

 function clickMoreTrigger() {
    $(document).ready(function() {
        setTimeout(clickMoreToExposeCategory, 1000)
    })
 }

 function clickMoreToExposeCategory() {
     try {
        let result = document.querySelector("paper-button#more").click()
        console.log("triggered click more: " + result)
        if (result == undefined) {
            setTimeout(getCategory, 500)
        }
     } 
     catch(err) {
        console.log('Error Clicking More. Reinitiating')
        initiate()
     }
 }

 function isYoutubeVideo(url) {
    let match = url.includes("v=")
    if (!match) {
        return false
    }
    return true
 }

 function getCategory() {
     try {
        console.log("Trigger getCategory")
        let collapsible = document.getElementById("collapsible").getElementsByTagName("a")
        let categoryIdx = collapsible.length - 1; // category will be last element in collapsible elements
        console.log('------ collapsible length: ' + collapsible.length);

        if (collapsible.length == 0) {
            // not showing 'show more' div 
            console.log("Trigger no collapsible div")

            category = document.querySelector("yt-formatted-string.content.content-line-height-override.style-scope.ytd-metadata-row-renderer")
            .getElementsByTagName("a")[categoryIdx].text
        }
        else {
            // showing more collapsible div, could be multiple like caption authors
            category = document.getElementById("collapsible").getElementsByTagName("a")[categoryIdx].text
        }        
        console.log('triggered getCategory: ' + category)
        processYoutubeCategory()
     } 
     catch(err) {
         console.log(err)
         if (reinitiateCnt % 30 == 0) {
             console.log('Failed to get category. Stopping reinitating: ' + reinitiateCnt)
            chrome.runtime.sendMessage({getCategoryFail: true, category: category})
         }
         else {
            console.log('Error getting category. Possibly did not click "show more" properly. Reinitiating.')
            initiate()
            reinitiateCnt++;
         }
     }
   
 }

function isCategoryValid(category) {
    if (!ytCategoryMappings.includes(category)) {
        console.log('-------- category not valid: ' + category)
        return false;
    }
    return true
}

function processYoutubeCategory() {
    console.log("inside processYoutube")
    console.log('------>' +  category)
    let allowedCategories = ["Education", "Science & Technology", "Howto & Style"]

    if (category) {
        if (!isCategoryValid(category)) {
            chrome.runtime.sendMessage({getCategoryFail: true, category: category})
        } 
        else {
            let isAllowedResult = allowedCategories.includes(category);
            console.log('isAllowedUrl: ' + isAllowedResult);
    
            if (isAllowedResult == false) {
                blockYoutubeUrl();
            }
        }
    }   
}

function blockYoutubeUrl() {
    console.log('in blockYoutubeUrl')
    chrome.runtime.sendMessage({createNotification: true, category: category})
    location.replace('http://youtube.com')
}





