/**
* @private
* @module NotificPrivate
* @classdesc Create browser native Notification or as a substitute page element notification (depends of settings) - private part
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/notific
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.3
* @readonly
*/
const NotificPrivate = class
{

	static TYPE_STRING = 'String';
	static LINK_NODE_NAME = 'LINK';
	static INPUT_NODE_NAME = 'INPUT';
	static LABEL_NODE_NAME = 'LABEL';
	static PICTURE_NODE_NAME = 'PICTURE';
	static IMAGE_NODE_NAME = 'IMG';
	static BR_NODE_NAME = 'BR';
	static NOTIFIC_ID_STARTS_ON = 1;

	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
		initAskForPermissions: false, // this can be a bit aggressive, use carefully
		onTheFlyAskForPermissions: false, // this can be a bit aggressive, use carefully
		permissionRequestTimeout: 8, // in s
		autoCloseAfter: 15, // in s
		elementsOrNotificationStrategy: Notific.COMBINE_BY_DOCUMENT_VISIBILITY,
		browserNotificationsPossible: null, // permissions && browser compatibility
		rootElementId: 'notific-root',
		askForPermissionsId: 'get-notification-permission',
		resultSnippetElements: {
			title: 'STRONG',
			alert: 'SPAN',
			body: 'SPAN',
			hostname: 'SMALL',
		},
		structure: [
			'title',
			'br',
			'image',
			'body',
			'hostname'
		],
		resultSnippetBehaviour: {
			allowLineBreak: true,
			flashIdPrefix: 'notific-',
			titleSuffix: '-title',
			bodySuffix: '-body',
			defaultImage: {
				src: null,
				width: 80, // int in px
				height: 80 // int in px
			}
		},
		texts: {
			defaultImageAlt: 'default notification image',
			askPermissionsResultSuccess: 'Now you can receive browser Notifications from this app.',
			askPermissionsResultCanceled: 'You canceled the possibility to display Notifications, this status is now remembered in the browser, to re-enable it, click on the small lock icon in front of the url address of this page and select allowed or ask.',
			permissionsResultAlreadyGranted: 'You have already allowed the default browser Notification for this app.',
		},
		CSSStyleSheets: [
			{ href: '/notific.css', integrity: 'sha256-DErgeoS4SQg0UMgS8E4mhJbyqNPHbyooBGsPqlRQviw=' }
		],
		preloadImages: [], // can be used if css contains images
		modulesImportPath: 'https://iiic.dev/js/modules',
		autoRun: true,
	};

	/**
	 * @public
	 * @type {HTMLElement}
	 */
	rootElement = HTMLElement;

	async initImportWithIntegrity ( /** @type {Object} */ settings = null )
	{

		console.groupCollapsed( '%c NotificPrivate %c initImportWithIntegrity %c(' + ( settings === null ? 'without settings' : 'with settings' ) + ')',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME,
			Notific.CONSOLE.INTEREST_PARAMETER
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;
			import( ip + '/importWithIntegrity.mjs' ).then( ( /** @type {Module} */ module ) =>
			{
				/** @type {Function} */
				this.importWithIntegrity = module.importWithIntegrity;
				resolve( true );
			} ).catch( () =>
			{
				const SKIP_SECURITY_URL = '#skip-security-test-only'
				if ( window.location.hash === SKIP_SECURITY_URL ) {
					console.warn( '%c NotificPrivate %c initImportWithIntegrity %c without security!',
						Notific.CONSOLE.CLASS_NAME,
						Notific.CONSOLE.METHOD_NAME,
						Notific.CONSOLE.WARNING
					);
					this.importWithIntegrity = (/** @type {String} */ path ) =>
					{
						return new Promise( ( /** @type {Function} */ resolve ) =>
						{
							import( path ).then( ( /** @type {Module} */ module ) =>
							{
								resolve( module );
							} );
						} );
					};
					resolve( true );
				} else {
					throw 'Security Error : Import with integrity module is missing! You can try to skip this error by adding ' + SKIP_SECURITY_URL + ' hash into website URL';
				}
			} );
		} );
	}

	browserNotification ( /** @type {Object} */ options )
	{
		return new Notification( options.title, options );
	}

	async initImportWithIntegrity ( /** @type {Object} */ settings )
	{
		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;
			import( ip + '/importWithIntegrity.mjs' ).then( ( /** @type {Module} */ module ) =>
			{
				/** @type {Function} */
				this.importWithIntegrity = module.importWithIntegrity;
				resolve( true );
			} ).catch( () =>
			{
				const SKIP_SECURITY_URL = '#skip-security-test-only'
				if ( window.location.hash === SKIP_SECURITY_URL ) {
					this.importWithIntegrity = (/** @type {String} */ path ) =>
					{
						return new Promise( ( /** @type {Function} */ resolve ) =>
						{
							import( path ).then( ( /** @type {Module} */ module ) =>
							{
								resolve( module );
							} );
						} );
					};
					resolve( true );
				} else {
					throw 'Security Error : Import with integrity module is missing! You can try to skip this error by adding ' + SKIP_SECURITY_URL + ' hash into website URL';
				}
			} );
		} );
	}

	async pageElementNotification ( /** @type {Object} */ options )
	{
		console.groupCollapsed( '%c Notific %c pageElementNotification',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);
		console.debug( { options } );

		const id = this.settings.resultSnippetBehaviour.flashIdPrefix + String( Notific.notificationsLastId++ );

		/** @type {HTMLInputElement} */
		const input = await this.elCreator.hiddenInputRadio( id );

		/** @type {HTMLLabelElement} */
		const label = await this.elCreator.singleFlashLabel( id );

		/** @type {HTMLSpanElement} */
		const alertElement = await this.elCreator.alert( options.body, id );

		this.settings.structure.forEach( ( /** @type {String} */ method ) =>
		{
			if ( method in this.elCreator ) {
				this.elCreator[ method ]( alertElement, options, id );
			}
		} );

		label.appendChild( alertElement );

		console.groupEnd();

		return input;
	}

	elCreator = {
		br: ( /** @type {HTMLElement} */ parentElement, /** @type {Object} */ options ) =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				if ( this.settings.resultSnippetBehaviour.allowLineBreak ) {
					parentElement.appendChild( document.createElement( NotificPrivate.BR_NODE_NAME ) );
				}
				resolve( true );
			} );
		},
		hiddenInputRadio: ( /** @type {String} */ id ) =>
		{
			return new Promise( ( /** @type { Function } */ resolve ) =>
			{
				/** @type {HTMLInputElement} */
				const input = ( document.createElement( NotificPrivate.INPUT_NODE_NAME ) );

				input.type = 'radio';
				input.hidden = true;
				input.id = id;

				this.importWithIntegrity(
					this.settings.modulesImportPath + '/element/bindFunction.mjs',
					'sha256-It+wjKjaTpHHrAxhjhTf+ul9s4JcRCghE5jgzx42W3o='
				).then( ( /** @type {Module} */ bindFunction ) =>
				{
					new bindFunction.append( Element );
					input.bindFunction( 'close', function ()
					{
						this.checked = true;
					} );
					this.rootElement.appendChild( input );
					resolve( input );
				} );
			} );
		},
		singleFlashLabel: ( /** @type {String} */ id ) =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				/** @type {HTMLLabelElement} */
				const label = ( document.createElement( NotificPrivate.LABEL_NODE_NAME ) );

				label.htmlFor = id;
				this.rootElement.appendChild( label );
				resolve( label );
			} );
		},
		alert: ( /** @type {String} */ body, /** @type {String} */ id ) =>
		{
			const NAME = 'alert';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {String} */
				const tag = this.settings.resultSnippetElements[ NAME ];

				if ( tag ) {

					/** @type {HTMLElement} */
					const el = ( document.createElement( tag ) );

					el.tabIndex = 0;
					el.setAttribute( 'role', 'alert' );
					el.setAttribute( 'aria-hidden', 'false' );
					el.setAttribute( 'aria-labelledby', id + this.settings.resultSnippetBehaviour.titleSuffix );
					if ( body ) {
						el.setAttribute( 'aria-describedby', id + this.settings.resultSnippetBehaviour.bodySuffix );
					}
					resolve( el );
				} else {
					resolve( false );
				}
			} );
		},
		image: ( /** @type {HTMLElement} */ parentElement, /** @type {Object} */ options ) =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				if ( options.image || this.settings.resultSnippetBehaviour.defaultImage.src ) {

					/** @type {HTMLPictureElement} */
					const picture = ( document.createElement( NotificPrivate.PICTURE_NODE_NAME ) );

					/** @type {HTMLImageElement} */
					const img = ( document.createElement( NotificPrivate.IMAGE_NODE_NAME ) );

					img.src = options.image ? options.image : this.settings.resultSnippetBehaviour.defaultImage.src;
					img.alt = this.settings.resultSnippetBehaviour.defaultImage.alt ? this.settings.resultSnippetBehaviour.defaultImage.alt : options.title;
					img.width = this.settings.resultSnippetBehaviour.defaultImage.width;
					img.height = this.settings.resultSnippetBehaviour.defaultImage.height;
					// img.setAttribute( 'loading', 'lazy' );
					img.setAttribute( 'crossorigin', 'anonymous' );

					picture.appendChild( img );
					parentElement.appendChild( picture );
				}
				resolve( true );
			} );
		},
		title: ( /** @type {HTMLElement} */ parentElement, /** @type {Object} */ options, /** @type {String} */ id ) =>
		{
			const NAME = 'title';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {String} */
				const tag = this.settings.resultSnippetElements[ NAME ];

				if ( tag ) {

					/** @type {HTMLElement} */
					const el = document.createElement( tag );

					el.appendChild( document.createTextNode( options.title ) );
					el.id = id + this.settings.resultSnippetBehaviour.titleSuffix;
					parentElement.appendChild( el );
				}
				resolve( true );
			} );
		},
		body: ( /** @type {HTMLElement} */ parentElement, /** @type {Object} */ options, /** @type {String} */ id ) =>
		{
			const NAME = 'body';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {String} */
				const tag = this.settings.resultSnippetElements[ NAME ];

				if ( tag ) {

					/** @type {HTMLElement} */
					const el = document.createElement( tag );

					el.appendChild( document.createTextNode( options.body ) );
					el.id = id + this.settings.resultSnippetBehaviour.bodySuffix;
					parentElement.appendChild( el );
				}
				resolve( true );
			} );
		},
		hostname: ( /** @type {HTMLElement} */ parentElement, /** @type {Object} */ options ) =>
		{
			const NAME = 'hostname';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {String} */
				const tag = this.settings.resultSnippetElements[ NAME ];

				if ( tag ) {

					/** @type {HTMLElement} */
					const el = document.createElement( tag );

					el.appendChild( document.createTextNode( window.location.hostname ) );
					parentElement.appendChild( el );
				}
				resolve( true );
			} );
		},
	}

};

/**
* @public
* @module Notific
* @classdesc Create browser native Notification or as a substitute page element notification (depends of settings)
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/notific
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.3
*/
export class Notific
{

	/**
	 * @private
	 * @description '#private' is not currently supported by Firefox, so that's why '_private'
	 */
	_private;

	static ONLY_PAGE_ELEMENTS = 0;
	static COMBINE_BY_DOCUMENT_VISIBILITY = 1;
	static COMBINE_BY_PERMISSIONS = 2;
	static ONLY_BROWSER_NOTIFICATIONS = 3;
	static PERMISSIONS_GRANTED = 'granted';

	/**
	* @public
	* @description colors used for browser's console output
	*/
	static CONSOLE = {
		CLASS_NAME: 'color: gray',
		METHOD_NAME: 'font-weight: normal; color: green',
		INTEREST_PARAMETER: 'font-weight: normal; font-size: x-small; color: blue',
		EVENT_TEXT: 'color: orange',
		WARNING: 'color: red',
	};

	constructor (
		/** @type {String} */ theTitle,
		/** @type {Object | null} */ options = null
	)
	{
		console.groupCollapsed( '%c Notific',
			Notific.CONSOLE.CLASS_NAME
		);
		console.debug( '%c' + 'constructor',
			Notific.CONSOLE.METHOD_NAME,
			[ { arguments } ]
		);

		this._private = new NotificPrivate;

		/** @type {HTMLScriptElement | null} */
		const settingsElement = document.getElementById( 'notific-settings' );

		/** @type {Object} */
		const settings = settingsElement ? JSON.parse( settingsElement.text ) : null;

		if ( options ) {
			const keys = Object.keys( options );
			keys.forEach( ( /** @type {String} */ key ) =>
			{
				this[ key ] = options[ key ];
			} );
		}
		this.title = theTitle;
		this._private.initImportWithIntegrity( settings ).then( () =>
		{
			if ( settings ) {
				this.setSettings( settings ).then( () =>
				{
					if ( this.settings.autoRun ) {
						this.run();
					}
				} );
			} else if ( this.settings.autoRun ) {
				this.run();
			}
		} );

		console.groupEnd();
	}

	static notificationsLastId = NotificPrivate.NOTIFIC_ID_STARTS_ON;

	actions = [];

	badge = '';

	body = '';

	data = null;

	dir = 'auto';

	icon = '';

	image = '';

	lang = '';

	onclick = null;

	onclose = null;

	onerror = null;

	onshow = null;

	renotify = false;

	requireInteraction = false;

	silent = false;

	tag = '';

	timestamp = Date.now();

	title = '';

	vibrate = [];


	set rootElement ( /** @type {HTMLElement} */ htmlElement )
	{
		this._private.rootElement = htmlElement;
	}

	/**
	 * @description : get root element
	 * @returns {HTMLElement} root element
	 */
	get rootElement ()
	{
		return this._private.rootElement;
	}

	/**
	 * @description : get script settings
	 * @returns {Object} settings of self
	 */
	get settings ()
	{
		return this._private.settings;
	}

	/**
	 * @description : Get dynamic Import function
	 * @returns {Function}
	 */
	get importWithIntegrity ()
	{
		return this._private.importWithIntegrity;
	}

	get elCreator ()
	{
		return this._private.elCreator;
	}

	async setSettings ( /** @type {Object} */ inObject )
	{
		console.groupCollapsed( '%c Notific %c setSettings',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/object/deepAssign.mjs',
				'sha256-qv6PwXwb5wOy4BdBQVGgGUXAdHKXMtY7HELWvcvag34='
			).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				this._private.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this._private.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	async propagate ()
	{
		console.debug( '%c Notific %c propagate',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);

		const options = {
			actions: this.actions,
			badge: this.badge,
			body: this.body,
			data: this.data,
			dir: this.dir,
			icon: this.icon,
			image: this.image,
			lang: this.lang,
			renotify: this.renotify,
			requireInteraction: this.requireInteraction,
			silent: this.silent,
			tag: this.tag,
			title: this.title,
			vibrate: this.vibrate,
		};

		if ( this.settings.elementsOrNotificationStrategy === Notific.ONLY_PAGE_ELEMENTS ) {
			return this._private.browserNotification( options );
		} else if ( this.settings.elementsOrNotificationStrategy === Notific.COMBINE_BY_DOCUMENT_VISIBILITY ) {
			if ( document.hidden ) {
				return this._private.browserNotification( options );
			} else {
				return await this._private.pageElementNotification( options );
			}
		} else if ( this.settings.elementsOrNotificationStrategy === Notific.COMBINE_BY_PERMISSIONS ) {
			if ( Notification.permission === Notific.PERMISSIONS_GRANTED ) {
				return this._private.browserNotification( options );
			} else {
				return await this._private.pageElementNotification( options );
			}
		} else if ( this.settings.elementsOrNotificationStrategy === Notific.ONLY_BROWSER_NOTIFICATIONS ) {
			return await this._private.pageElementNotification( options );
		}
	}

	async initAskForPermissions ()
	{
		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			if (
				this.settings.browserNotificationsPossible !== false
				&& this.settings.elementsOrNotificationStrategy > Notific.ONLY_PAGE_ELEMENTS
			) {
				if ( 'Notification' in window ) {
					if ( Notification.permission === Notific.PERMISSIONS_GRANTED ) {
						this.settings.browserNotificationsPossible = true;
						resolve( true );
					} else {
						if ( this.settings.initAskForPermissions ) {
							const timeout = setTimeout( () =>
							{
								this.settings.browserNotificationsPossible = false;
								resolve( true );
							}, Number( this.settings.permissionRequestTimeout ) * 1000 );
							Notification.requestPermission().then( ( /** @type { String } */ permission ) =>
							{
								if ( permission === Notific.PERMISSIONS_GRANTED ) {
									this.settings.browserNotificationsPossible = true;
									clearTimeout( timeout );
									resolve( true );
								} else {
									this.settings.browserNotificationsPossible = false;
									clearTimeout( timeout );
									resolve( true );
								}
							} );
						} else {
							this.settings.browserNotificationsPossible = false;
							resolve( true );
						}
					}
				} else {
					this.settings.browserNotificationsPossible = false;
					resolve( true );
				}
			}
		} );
	}

	appendAutoCloseOn ( /** @type {HTMLInputElement | Notification} */ notification )
	{
		if ( this.settings.autoCloseAfter ) {
			setTimeout( function ()
			{
				notification.close();
			}, this.settings.autoCloseAfter * 1000 );
		}
	}

	async addCSSStyleSheets ()
	{
		console.debug( '%c Notific %c addCSSStyleSheets',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const usedStyleSheets = new Set();
			[ ...document.styleSheets ].forEach( ( /** @type {CSSStyleSheet} */ css ) =>
			{
				if ( css.disabled === false ) {
					usedStyleSheets.add( css.href );
				}
			} );
			this.settings.CSSStyleSheets.forEach( ( /** @type {Object} */ assignment ) =>
			{
				let url = URL;
				if ( assignment.href.startsWith( 'https://', 0 ) || assignment.href.startsWith( 'http://', 0 ) ) {
					url = new URL( assignment.href );
				} else {
					url = new URL( assignment.href, window.location.protocol + '//' + window.location.hostname );
				}
				if ( !usedStyleSheets.has( url.href ) ) {
					fetch( url.href, {
						method: 'HEAD',
						credentials: 'omit',
						cache: 'force-cache',
						referrerPolicy: 'no-referrer',
						redirect: 'manual',
						mode: 'cors'
					} ).then( ( /** @type {Response} */ response ) =>
					{
						if ( response.ok ) {
							return true;
						} else {
							throw 'error';
						}
					} ).then( () =>
					{
						/** @type {HTMLLinkElement} */
						const link = document.createElement( NotificPrivate.LINK_NODE_NAME );

						link.href = url.href;
						link.rel = 'stylesheet';
						link.setAttribute( 'crossorigin', 'anonymous' );
						if ( assignment.integrity ) {
							link.integrity = assignment.integrity;
						}
						document.head.appendChild( link );
					} ).catch( () =>
					{
						resolve( false );
					} );
				}
			} );
			resolve( true );
		} );
	}

	checkRequirements ()
	{
		console.debug( '%c Notific %c checkRequirements',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);

		if ( !this.settings.rootElementId ) {
			throw 'Root Element\'s id is missing';
		}
	}

	initRootElement ()
	{
		console.debug( '%c Notific %c initRootElement',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);

		this.rootElement = document.getElementById( this.settings.rootElementId );
	}

	preloadImages ()
	{
		console.groupCollapsed( '%c Notific %c preloadImages',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);
		console.debug( this.settings.preloadImages );

		this.settings.preloadImages.forEach( ( /** @type {URL|String} */ url ) =>
		{

			/** @type {String} */
			const href = ( url.constructor.name === NotificPrivate.TYPE_STRING ) ? url : url.href;

			/** @type {HTMLLinkElement} */
			const link = document.createElement( NotificPrivate.LINK_NODE_NAME );

			link.rel = 'preload';
			link.href = href;
			link.as = 'image';
			// link.setAttribute( 'crossorigin', 'anonymous' ); // cannot be anonymous !
			document.head.appendChild( link );
		} );

		console.groupEnd();
	}

	showResult ()
	{
		console.debug( '%c Notific %c showResult',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME,
		);

		this.rootElement.hidden = false;
	}

	askForPermissionsEventListener ( /** @type {MouseEvent} */ event )
	{
		if ( Notification.permission === Notific.PERMISSIONS_GRANTED && 'Notific' in window && this.settings.texts.permissionsResultAlreadyGranted ) {
			new Notific( this.settings.texts.permissionsResultAlreadyGranted );
		} else {
			const timeout = setTimeout( () =>
			{
				this.settings.browserNotificationsPossible = false;
			}, Number( this.settings.permissionRequestTimeout ) * 1000 );
			Notification.requestPermission().then( ( /** @type { String } */ permission ) =>
			{
				if ( permission === Notific.PERMISSIONS_GRANTED ) {
					this.settings.browserNotificationsPossible = true;
					clearTimeout( timeout );
					if ( 'Notific' in window && this.settings.texts.askPermissionsResultSuccess ) {
						new Notific( this.settings.texts.askPermissionsResultSuccess );
					}
				} else {
					this.settings.browserNotificationsPossible = false;
					clearTimeout( timeout );
					if ( 'Notific' in window && this.settings.texts.askPermissionsResultCanceled ) {
						new Notific( this.settings.texts.askPermissionsResultCanceled );
					}
				}
			} );
		}
	}

	async createAskForPermissionsAction ()
	{
		console.debug( '%c Notific %c createAskForPermissionsAction',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME,
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( this.settings.askForPermissionsId && 'Notification' in window ) {

				/** @type {HTMLButtonElement | HTMLElement} */
				const element = document.getElementById( this.settings.askForPermissionsId );

				if ( element && Notific.notificationsLastId === NotificPrivate.NOTIFIC_ID_STARTS_ON ) {
					element.addEventListener( 'click', this.askForPermissionsEventListener.bind( this ), {
						capture: false,
						once: false,
						passive: true,
					} );
				}
			}
			resolve( true );
		} );
	}

	run ()
	{
		console.groupCollapsed( '%c Notific %c run',
			Notific.CONSOLE.CLASS_NAME,
			Notific.CONSOLE.METHOD_NAME
		);

		this.checkRequirements();
		this.createAskForPermissionsAction();
		this.initAskForPermissions().then( () =>
		{
			this.addCSSStyleSheets();
			this.initRootElement();
			this.propagate().then( ( /** @type {HTMLInputElement | Notification} */ notification ) =>
			{
				this.appendAutoCloseOn( notification );
			} );
			this.showResult();
		} );
		this.preloadImages();

		console.groupEnd();

		return this;
	}
};

Object.defineProperty( window, 'Notific', {
	value: Notific,
	writable: false,
	configurable: true,
	enumerable: false,
} );
