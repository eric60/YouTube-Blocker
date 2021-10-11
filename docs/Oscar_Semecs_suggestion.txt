// ==UserScript==
// @name         Youtube Blocker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {


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


})();