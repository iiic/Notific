# Notific v 0.3

On page or native Notifications.
Just vanilla javascript, no `jQuery` or other libraries. Styles and examples included in repo. Same parameters as browser's default `Notification()` function.

# What's new in version 0.3 ?
- script settings by json file
- possible preload images and prefetch video
- repaired bug with 2 notifications at the same time and duplicate element ids
- modules are now included in the repository

# Use

Polyfill is in single javascript module file `notific.mjs`. Include it into your site like this:

``` html
<div id="notific-root" hidden></div>
<script type="text/json" id="notific-settings">
	{
		"modulesImportPath": "/modules",
		"askForPermissionsId": "get-notification-permission"
	}
</script>
<script type="module" src="/notific.mjs?v=0.3" crossorigin="anonymous" integrity="sha256-3nzzhRl/ewML9yvxIwoj5N/5d+GVSElKo+IGAvdHzrI="></script>
```

All other files like `example-usage.html` and `notific.css` are there to help, but they are not needed for Notific function.

Styles in `notific.css` have media queries for small displays, so the page needs `<meta name="viewport" content="width=device-width, initial-scale=1">`.

Modules are loaded by `fetch()` with integrity check and exactly the checked content is imported through `blob:` url. So a page with Content Security Policy needs `blob:` allowed in `script-src` and modules from other domain need CORS header `Access-Control-Allow-Origin`.

# Events

Event handlers `onclick`, `onclose`, `onerror` and `onshow` can be set in options (or later on the instance). They work for page and also for browser notifications, `this` in the handler is the Notific instance.

``` js
new Notific( 'Hello', {
	body: 'notification text',
	onclick: function ( event )
	{
		// event.preventDefault(); keeps page notification opened
		console.log( 'clicked', this.title );
	},
	onclose: function ( event )
	{
		console.log( 'closed', this.title );
	},
} );
```

# Services

Unpkg: https://unpkg.com/notific-on-page-or-native-notifications

NPM: https://www.npmjs.com/package/notific-on-page-or-native-notifications

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

more info at https://iiic.dev/notific-on-page-or-native-notifications
