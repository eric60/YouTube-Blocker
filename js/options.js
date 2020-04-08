$(document).ready(function(){
    getApiKey();
    $('#saveKey').click(save_options);
    initiateHarderToDeactivateActions();

    function save_options() {
        if(confirm("Are you sure you want to save this key?")) {
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
                value = "Your current Youtube key is: <b>" + key + "</b>"
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
            else if (value == "10") {
                console.log('trggier')
                $("#harder10").prop("checked", true);
            }
            else if (value == "20") {
                $('#harder20').prop("checked", true);
            }
            else if (value == "30") {
                $('#harder30').prop("checked", true);
            }
        }); 
    }

    $("#saveHarderClicks").click(function() {
        let radioVal = $("input[name=clicksRadio]:checked", '#myForm').val();
        console.log(radioVal)
        if (radioVal) {
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
        })
    }
 }) 