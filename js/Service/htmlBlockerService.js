// {"@context":"https://schema.org","@type":"VideoObject","description":"Go to https://www.casetify.com/nickcrowley today to get 15% off your new favorite phone case!\nThese five videos have proven to be some of the darkest and most mysterious found on YouTube.\n\nTopics explored include; Clem Schultz Tornado Video, Ring doorbell predator, Tebebe Makonnen , Toddler Wakes Up at Funeral, and Daniel Bartlam\n\nTwitter: https://twitter.com/nickcrowleyyt?lan...\nInstagram: https://www.instagram.com/nick_crowleyyt\nPATREON:  https://www.patreon.com/NickCrowley\nMERCH: https://crowdmade.com/collections/nickcrowley\n\nMUSIC USED: \nThe Black Mirror by REPULSIVE - https://www.youtube.com/watch?v=vMPloAXoAMI\nOf the Sixth Kind by Monst3r Music - https://www.youtube.com/watch?v=NaMmWG3ufpc&t=152s\nGhost Story by CO.AG - https://www.youtube.com/watch?v=43cEoEgIO2s&t=30s\nCountach by White Bat Audio - https://www.youtube.com/watch?v=vpci3Mt-aUY\nJuro Uxoris by Repulsive - https://www.youtube.com/watch?v=E-26N1OE9lY\nAbyssal Void by Monst3r Music - https://www.youtube.com/watch?v=XTlGoLR1cFQ&t=142s\nFrom the Darkness by CO.AG - https://www.youtube.com/watch?v=xqBJcEHubsU\nSatanic by CO.AG - https://www.youtube.com/watch?v=E_gQrAMVK8U&t=55s\nShe is in the Woods by CO.AG - https://www.youtube.com/watch?v=We0A0Xmajw8\nShadow Land by CO.AG - https://www.youtube.com/watch?v=kOIX-1g-uTQ\nConfusion by Repulsive - https://www.youtube.com/watch?v=1tO5K4A6JcM\nFather of the People by Repulsive - https://www.youtube.com/watch?v=TwXbyHC6Upk\nThat Was My Home Once - https://www.youtube.com/watch?v=ACHKNHNoThE&t=27s\n\nCHAPTERS: \n0:00 - Struck by a Tornado\n4:08 - Castify Ad\n5:16 The Man at the Door\n12:25 - The Tebebe Makonnen Incident\n21:41 - Buried Alive\n26:53 - My New iMac","duration":"PT2217S","embedUrl":"https://www.youtube.com/embed/YXIlY4kFT7Y","interactionCount":"338945","name":"YouTube's Darkest Videos 2","thumbnailUrl":["https://i.ytimg.com/vi/YXIlY4kFT7Y/maxresdefault.jpg"],"uploadDate":"2021-10-10","genre":"Entertainment","author":"Nick Crowley"}
export function blockHtml() {
    
}

function blocker() {
    var curUrl = window.location.href;

    window.setInterval(function(){
        if(curUrl != window.location.href) {
            curUrl = window.location.href;

            setTimeout(function(){
                checkUrl();
            }, 1000);


        }
    }, 10);
    checkUrl();


    function checkUrl(){
        var scripts = document.scripts;
        for(index in scripts) {
            if(typeof scripts[index].innerHTML !== "undefined" && scripts[index].innerHTML.indexOf('"category":') !== -1) {
                pos = scripts[index].innerHTML.indexOf('"category":');
                tmp = scripts[index].innerHTML.substring(pos+12,pos+100);
                pos = tmp.indexOf('"');

                tmp = tmp.substring(0,pos);
                if(tmp != "Education" && tmp.substring(0,5) != "Howto") {
                    window.location.replace("https://www.youtube.com");
                }
                break;
            }

            if(typeof scripts[index].innerHTML !== "undefined" && scripts[index].innerHTML.indexOf('"genre":') !== -1) {
                pos = scripts[index].innerHTML.indexOf('"genre":');
                tmp = scripts[index].innerHTML.substring(pos+9,pos+100);
                pos = tmp.indexOf('"');
                tmp = tmp.substring(0,pos);
                if(tmp != "Education" && tmp.substring(0,5) != "Howto") {
                    window.location.replace("https://www.youtube.com");
                }
                break;
            }

        }

    }


}