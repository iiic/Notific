# Notific v 0.3

On page or native Notifications.
Just vanilla javascript, no `jQuery` or other libraries. Styles and examples included in repo. Same parameters as browser's default `Notification()` function.

# What's new in version 0.3 ?
- script settings by json file
- possible preload images and prefetch video
- repaired bug with 2 notifications at the same time and element id duplicit.
- modules are now includes at repository

# Use

Polyfill is in single javascript module file `notific.mjs`. Include it into your site like this:

``` html
<div id="notific-canvas" hidden></div>
<script type="text/json" id="notific-settings">
	{
		"modulesImportPath": "/modules",
		"askForPermissionsId": "get-notification-permission"
	}
</script>
<script type="module" src="/notific.mjs?v0.3" crossorigin="anonymous" integrity="sha256-wuA31+60YeoRKlFT/YZoVHhDEK5aqPz+XO+e4tI3e+s="></script>
```

All other files like `example-usage.html` and `notific.css` are there to help, but they are not needed for Notific function.

# Services

Unpkg: https://unpkg.com/notific-on-page-or-native-notifications

NPM: https://www.npmjs.com/package/notific-on-page-or-native-notifications

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

more info at https://iiic.dev/notific-on-page-or-native-notifications
