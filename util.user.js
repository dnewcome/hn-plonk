// ==UserScript==
// @match <all_urls>
// ==/UserScript==

/**
* This Google Chrome user script is a bootstrap for loading other scripts from the web.
* For example, loading jQuery looks like this:
* addScript('https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js');
*
* Scripts may be loaded from the JS console this way.
*
* Note that we have to browse to a URL first. The <all_urls> match pattern 
* will not match the Chrome start page. The <all_urls> match pattern is used instead
* of @match http:// * / * in order to match file: and https: <all_urls> doesn't seem
* to work with chrome:// urls though. chrome://extensions for example.
* This is probably by design, evidenced by the following comment from the pattern code:
*
*    // SCHEME_ALL will match every scheme, including chrome://, chrome-
*    // extension://, about:, etc. Because this has lots of security
*    // implications, third-party extensions should never be able to get access
*    // to URL patterns initialized this way. It should only be used for internal
*    // Chrome code.
*
* More details on patterns can be found here:
* http://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/extensions/url_pattern.h?view=markup
*
* Install by dragging util.user.js to the Chrome window. Chrome will detect it as an 
* extension. Removing the extension will remove the user script.
*
* Although the <script> tag trick is not necessary in Opera, the script will work
* as-is. In Opera preferences under 'content' add the folder where this file resides
* and Opera will load it with the next page refresh.
* http://www.opera.com/docs/userjs/using/#writingscripts
*
*/

function addScript( url ) { 
        var el = document.createElement('script'); 
        el.src = url; 
        document.head.appendChild( el );
}

/*
* Note that we have to take our script from above and insert it into the dom
* using a script tag. This is necessary because we don't have direct access
* to the window object in Chrome. Anything we add to 'window' will be lost since 
* it is actually a proxy called 'safeWindow', not the real window. However, 
* DOM manipulations apply to the real document when using document object. 
* Thus, we drop the code  into a script tag and add it to the document in order
* to gain access to the script in the global window scope as desired.
*
* See this StackOverflow question for more details:
* http://stackoverflow.com/questions/2303147/injecting-js-functions-into-the-page-from-a-greasemonkey-script-on-chrome
*
*/
var script = addScript.toString();
var el = document.createElement('script'); 
el.text = script;
document.head.appendChild( el );
