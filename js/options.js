$(document).ready(function(){
    let activated;
    getApiKey();
    $('#saveKey').click(save_options);
    initiateHarderToDeactivateActions();
    initiateActivatedValueActions();

    function initiateActivatedValueActions() {
        chrome.storage.local.get('activated', function(data) {
            if (data.activated === false) {
                activated = false
            } 
            else if (data.activated == true) {
                activated = true;
            }
            console.log('activated value: ' + activated)
        })
    }

    function save_options() {
        if (confirm("Are you sure you want to save this key?")) {
            setApiKey()
            alert('You have saved your options')
        }
    }
    
    function getApiKey() {
        chrome.storage.local.get('apiKey', function(data) {
            let value = ""
            console.log('Key value is: ' + data.apiKey)
            let key = data.apiKey;
            if (key == "") {
                value = "Your current Youtube key is the default key which will run out"
            } 
            else {
                value = "Your current Youtube key is: <b id='key'>" + key + "</b>"
            }
            $('#currKey').html(value)
        })  
    }
    
    function setApiKey() {
        let key = $('#API_KEY').val()
        console.log(key)
        chrome.storage.local.set({apiKey : key}, function(){
            console.log('set api key: ' + key)
            location.reload()
            // chrome.runtime.reload()
        })
    }

    function initiateHarderToDeactivateActions() {
        chrome.storage.local.get('harderDeactivateClicks', function(data) {
            let value = data.harderDeactivateClicks;
            console.log('harderDeactivate value is ' + value)
            if (!value) {
                $('#harder10').prop("checked", true);
                setHarderDeactivateClicks("10");
            }
            else {
                $(`#harder${value}`).prop("checked", true);
            }                      
        }); 
    }

    $("#saveHarderClicks").click(function() {
        let radioVal = $("input[name=clicksRadio]:checked", '#myForm').val();
        console.log(radioVal)
        if (activated) {
            alert("You cannot change clicks options when YouTube Study is activated")
        }
        else if (radioVal) {
            alert("You have saved your option for " + radioVal + " clicks.");
            setHarderDeactivateClicks(radioVal);
        }
        else {
            alert("Please set a clicks value");
        }
    })

    function setHarderDeactivateClicks(value) {
        chrome.storage.local.set({harderDeactivateClicks : value}, function(){
            console.log('Set deactivate harder clicks  to ' + value)
            location.reload();
        })
    }
 }) 