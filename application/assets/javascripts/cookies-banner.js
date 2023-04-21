// TODO: Add GA if opt in
// TODO: Add remember settings function {"essential":true,"settings":false,"usage":false,"campaigns":false}
// TODO: Add Cookie preferences page function (disabled version when no Javascript)

(function () {

    function createJsonPreferences(essential, settings, usage, campaigns) {
        return '{"essential":'+ essential + 
        ',"settings":'+ settings + 
        ',"usage":'+ usage + 
        ',"campaigns":' + campaigns + '}';
    }

    function getPreference(key) {
        var JsonString = getCookie('stw_cookie_preferences');
        var cookieObj = JSON.parse(JsonString);
        return cookieObj[key];
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

    function setCookie(e) {
        var usagePreference = e.target.value;

        if (usagePreference === '') {
            var cookieBanner = document.querySelector('.govuk-cookie-banner');
            cookieBanner.setAttribute('hidden', true);

            return;
        }

        var expiryDate = new Date();

        expiryDate.setDate(expiryDate.getDate() + 28);

        document.cookie ='stw_cookie_preferences;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';

        var prefs = createJsonPreferences(true, true, usagePreference == "accept" ? true : false, false);

        document.cookie = 'stw_cookie_preferences=' + prefs + ';domain=' + location.hostname + ';expires=' + expiryDate.toUTCString() + ';path=/';
    
        var questionBanner = document.querySelector('#a11y-cookies-question');

        questionBanner.setAttribute('hidden', true);

        var confirmationBanner = document.querySelector('#a11y-cookies-' + usagePreference);

        confirmationBanner.removeAttribute('hidden');
    }

    // If user preference cookie does not exist show cookie banner
    if (document.cookie.indexOf('stw_cookie_preferences') == -1) {
        var questionBanner = document.querySelector('#a11y-cookies-question');

        questionBanner.removeAttribute('hidden');

        var cookieBanner = document.querySelector('.govuk-cookie-banner');

        cookieBanner.addEventListener('click', setCookie);
    }
    // Otherwise check if opted in and add analytics snippet
    else if (getPreference('usage') == true) {
        //Add GA snippet
        console.log('ga added');
    }

})();
