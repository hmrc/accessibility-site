// TODO: Add GA if opt in
// TODO: Add remember settings function {"essential":true,"settings":false,"usage":false,"campaigns":false}
// TODO: Add Cookie preferences page function (disabled version when no Javascript)

(function () {

    // -----------------
    // Generic functions
    // -----------------
    function createJsonPreferences(essential, settings, usage, campaigns) {
        return '{"essential":'+ essential + 
        ',"settings":'+ settings + 
        ',"usage":'+ usage + 
        ',"campaigns":' + campaigns + '}';
    }

    function cookieExists() {
        return document.cookie.indexOf('stw_cookie_preferences') !== -1;
    }

    function getCookie(key) {
        var name = key + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }

    function deleteSettingsCookie() {
        document.cookie ='stw_cookie_preferences=;domain=' + location.hostname + ';expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    }

    function createCookie(usagePreference) {
        var expiryDate = new Date();

        expiryDate.setDate(expiryDate.getDate() + 28);

        var prefs = createJsonPreferences(true, true, usagePreference, false);

        document.cookie = 'stw_cookie_preferences=' + prefs + ';domain=' + location.hostname + ';expires=' + expiryDate.toUTCString() + ';path=/';
    
    }
    function getPreference(key) {
        var JsonString = getCookie('stw_cookie_preferences');
        var cookieObj = JSON.parse(JsonString);
        return cookieObj[key];
    }

    // -------------
    // Cookie banner 
    // -------------
    function setCookie(e) {
        var usagePreference = e.target.value;

        if (usagePreference === '') {
            var cookieBanner = document.querySelector('.govuk-cookie-banner');
            cookieBanner.setAttribute('hidden', true);

            return;
        }

        deleteSettingsCookie();

        createCookie(usagePreference == "accept" ? true : false);

        var questionBanner = document.querySelector('#a11y-cookies-question');

        questionBanner.setAttribute('hidden', true);

        var confirmationBanner = document.querySelector('#a11y-cookies-' + usagePreference);

        confirmationBanner.removeAttribute('hidden');
    }

    // If user preference cookie does not exist show cookie banner
    if (!cookieExists()) {
        var questionBanner = document.querySelector('#a11y-cookies-question');

        questionBanner.removeAttribute('hidden');

        var cookieBanner = document.querySelector('.govuk-cookie-banner');

        cookieBanner.addEventListener('click', setCookie);
    }
    // Otherwise check if opted in and add analytics snippet
    else if (getPreference('usage') == true) {
        //Add GA snippet
        console.log('TODO: GA Snippet added to DOM');
    }

    // ------------------
    // Cookie preferences
    // ------------------

    function clearPreferences() {
        var radio = document.getElementsByTagName('input');
        for(var i = 0;i < radio.length; i++) {
            radio[i].checked = false;
            radio[i].addEventListener('click',resetStatus);
        }
    }

    function populatePreference(pref, id) {
        var prefValue = getPreference(pref);
        var radio = document.querySelector('#' + id + '-' + prefValue);

        if (radio) {
            radio.checked = true;
        }
    }

    function populatePreferences(e) {
        clearPreferences();

        if (cookieExists()) {

            populatePreference('usage', 'cookieGoogleAnalytics');
            populatePreference('settings', 'cookieRememberSettings');
        }
    }

    function updateStatus(message) {
        var statusMessage = document.querySelector('#status-message');

        if (!statusMessage) {
            return;
        }

        statusMessage.innerHTML = message;
    }

    function resetStatus() {
        updateStatus('');
    }

    function savePreferences(e) {
        deleteSettingsCookie();

        var settingsPref = document.querySelector('#cookieRememberSettings-false');

        if (!settingsPref || settingsPref.checked) {
            updateStatus("You've asked us not to remember your settings on this site. Your preference has been updated.");
            return;
        }

        var usagePref = document.querySelector('#cookieGoogleAnalytics-true');

        if (!usagePref) {
            return;
        }
        
        createCookie(usagePref.checked);
        updateStatus("Your preferences have been updated.");
    }

    // Check if on cookies page
    var savePrefsButton = document.querySelector('#save-cookie-prefs');

    if (savePrefsButton) {
        populatePreferences();
        savePrefsButton.addEventListener('click', savePreferences);
    }

})();
