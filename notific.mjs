/**
* @private
* @module NotificPrivate
* @classdesc Create browser native Notification or as a substitute page element notification (depends of settings) - private part
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/youtube-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.2
* @readonly
*/
const NotificPrivate = class
{

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
		rootElement: document.getElementById( 'notific-root' ),
		notificationsLastId: 0,
		modulesImportPath: 'https://iiic.dev/js/modules',
		elementNotification: {
			allowLineBreak: true,
			alertNodeName: 'SPAN',
			flashIdPrefix: 'notific-',
			titleSuffix: '-title',
			bodySuffix: '-body',
			titleNodeName: 'STRONG',
			bodyNodeName: 'SPAN',
			smallNodeName: 'SMALL',
			defaultImage: {
				src: null,
				alt: 'ilustrační obrázek notifikace',
			}
		},
		autoRun: true,
	};

	/**
	 * @public
	 * @type {Function}
	 */
	importWithIntegrity;

	browserNotification ( /** @type {Object} */ options )
	{
		return new Notification( options.title, options );
	}

	async initImportWithIntegrity ( /** @type {Object} */ settings )
	{
		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;
			// @ts-ignore
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
							// @ts-ignore
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

	pageElementNotification ( /** @type {Object} */ options )
	{
		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			/** @type {HTMLElement} */
			const root = this.settings.rootElement;

			const el = this.elCreator;

			el.asyncHiddenInputRadio().then( ( /** @type {HTMLInputElement} */ input ) =>
			{
				root.appendChild( input );
				resolve( input );
				const flash = el.singleFlashLabel();
				const alert = el.alert( options.body );

				const title = el.title( options.title );
				if ( title ) {
					alert.appendChild( title );
				}
				alert.appendChild( el.br() );
				const image = el.image( options.image, options.title );
				if ( image ) {
					alert.appendChild( image );
				}
				const body = el.body( options.body );
				if ( body ) {
					alert.appendChild( body );
				}

				alert.appendChild( el.small( window.location.hostname ) );

				flash.appendChild( alert );
				root.appendChild( flash );
			} );
		} );
	}

	elCreator = {
		br: () =>
		{
			if ( this.settings.elementNotification.allowLineBreak ) {
				return document.createElement( 'BR' );
			}
		},
		asyncHiddenInputRadio: () =>
		{
			return new Promise( ( /** @type { Function } */ resolve ) =>
			{
				/** @type {HTMLInputElement} */
				const input = ( document.createElement( 'INPUT' ) );

				input.type = 'radio';
				input.hidden = true;
				input.id = this.settings.elementNotification.flashIdPrefix + String( this.settings.notificationsLastId );
				this.importWithIntegrity(
					'https://iiic.dev/js/modules/element/bindFunction.mjs',
					'It+wjKjaTpHHrAxhjhTf+ul9s4JcRCghE5jgzx42W3o='
					// @ts-ignore
				).then( (/** @type { Module } */ bindFunction ) =>
				{
					new bindFunction.append( Element );
					// @ts-ignore
					input.bindFunction( 'close', function ()
					{
						this.checked = true;
					} );
					resolve( input );
				} );
			} );
		},
		singleFlashLabel: () =>
		{
			/** @type {HTMLLabelElement} */
			const label = ( document.createElement( 'LABEL' ) );

			label.htmlFor = this.settings.elementNotification.flashIdPrefix + String( this.settings.notificationsLastId );
			return label;
		},
		alert: ( /** @type {String} */ body ) =>
		{
			/** @type {HTMLElement} */
			const el = ( document.createElement( this.settings.elementNotification.alertNodeName ) );

			el.tabIndex = 0;
			el.setAttribute( 'role', 'alert' );
			el.setAttribute( 'aria-hidden', 'false' );
			el.setAttribute( 'aria-labelledby', this.settings.elementNotification.flashIdPrefix + String( this.settings.notificationsLastId ) + this.settings.elementNotification.titleSuffix );
			if ( body ) {
				el.setAttribute( 'aria-describedby', this.settings.elementNotification.flashIdPrefix + String( this.settings.notificationsLastId ) + this.settings.elementNotification.bodySuffix );
			}
			return el;
		},
		image: ( /** @type {String} */ path, /** @type {String} */ title ) =>
		{
			if ( this.settings.elementNotification.defaultImage.src || path ) {
				/** @type {HTMLPictureElement} */
				const picture = ( document.createElement( 'PICTURE' ) );

				/** @type {HTMLImageElement} */
				const img = ( document.createElement( 'IMG' ) );

				img.src = path ? path : this.settings.elementNotification.defaultImage.src;
				img.alt = this.settings.elementNotification.defaultImage.alt ? this.settings.elementNotification.defaultImage.alt : title;
				img.width = 80;
				img.height = 80;
				img.setAttribute( 'loading', 'lazy' );

				picture.appendChild( img );
				return picture;
			}
			return null;
		},
		title: ( /** @type {String} */ title ) =>
		{
			/** @type {HTMLElement} */
			const el = document.createElement( this.settings.elementNotification.titleNodeName );
			el.appendChild( document.createTextNode( title ) );
			el.id = this.settings.elementNotification.flashIdPrefix + String( this.settings.notificationsLastId ) + this.settings.elementNotification.titleSuffix;
			return el;
		},
		body: ( /** @type {String} */ body ) =>
		{
			if ( body ) {
				/** @type {HTMLElement} */
				const el = document.createElement( this.settings.elementNotification.bodyNodeName );
				el.appendChild( document.createTextNode( body ) );
				el.id = this.settings.elementNotification.flashIdPrefix + String( this.settings.notificationsLastId ) + this.settings.elementNotification.bodySuffix;
				return el;
			}
			return null;
		},
		small: ( /** @type {String} */ small ) =>
		{
			if ( small ) {
				/** @type {HTMLElement} */
				const el = document.createElement( this.settings.elementNotification.smallNodeName );
				el.appendChild( document.createTextNode( small ) );
				return el;
			}
			return null;
		},
	}

};

/**
* @public
* @module Notific
* @classdesc Create browser native Notification or as a substitute page element notification (depends of settings)
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/youtube-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q2 2020
* @version 0.2
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

	constructor (
		/** @type {String} */ theTitle,
		/** @type {Object | null} */ options = null,
		/** @type {Object | null} */ settings = null
	)
	{
		this._private = new NotificPrivate;
		this._private.initImportWithIntegrity( settings ).then( () =>
		{
			if ( options ) {
				const keys = Object.keys( options );
				keys.forEach( ( /** @type {String} */ key ) =>
				{
					this[ key ] = options[ key ];
				} );
			}
			this.title = theTitle;
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
	}

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


	/**
	 * @description : Get dynamic Import function
	 * @returns {Function}
	 */
	get importWithIntegrity ()
	{
		return this._private.importWithIntegrity;
	}

	/**
	 * @description : get script settings
	 * @returns {Object} settings of self
	 */
	get settings ()
	{
		return this._private.settings;
	}

	async setSettings ( /** @type {Object} */ inObject )
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/object/deepAssign.mjs',
				'sha256-qv6PwXwb5wOy4BdBQVGgGUXAdHKXMtY7HELWvcvag34='
				// @ts-ignore
			).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				// @ts-ignore
				this._private.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this._private.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	prepareNotification ()
	{
		if ( this.settings.elementsOrNotificationStrategy !== Notific.ONLY_BROWSER_NOTIFICATIONS ) {
			if ( this.settings.rootElement ) {
				this.settings.rootElement.querySelectorAll( 'label' ).forEach( ( /** @type {HTMLLabelElement} */ label ) =>
				{
					if ( label.htmlFor ) {
						const num = label.htmlFor.split( '-' );
						if ( Number( num[ 1 ] ) > this.settings.notificationsLastId ) {
							this.settings.notificationsLastId = Number( num[ 1 ] );
						}
					}
				} );
				this.settings.notificationsLastId++;
			} else {
				throw 'Error : flashes root element not found';
			}
		}
	}

	async propagate ()
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
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
				resolve( this._private.browserNotification( options ) );
			} else if ( this.settings.elementsOrNotificationStrategy === Notific.COMBINE_BY_DOCUMENT_VISIBILITY ) {
				if ( document.hidden ) {
					resolve( this._private.browserNotification( options ) );
				} else {
					this._private.pageElementNotification( options ).then( ( /** @type {HTMLInputElement} */ input ) =>
					{
						resolve( input );
					} );
				}
			} else if ( this.settings.elementsOrNotificationStrategy === Notific.COMBINE_BY_PERMISSIONS ) {
				if ( Notification.permission === Notific.PERMISSIONS_GRANTED ) {
					resolve( this._private.browserNotification( options ) );
				} else {
					this._private.pageElementNotification( options ).then( ( /** @type {HTMLInputElement} */ input ) =>
					{
						resolve( input );
					} );
				}
			} else if ( this.settings.elementsOrNotificationStrategy === Notific.ONLY_BROWSER_NOTIFICATIONS ) {
				this._private.pageElementNotification( options ).then( ( /** @type {HTMLInputElement} */ input ) =>
				{
					resolve( input );
				} );
			}
		} );
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

	appendAutoClose ( /** @type {HTMLInputElement | Notification} */ notification )
	{
		if ( this.settings.autoCloseAfter ) {
			setTimeout( function ()
			{
				// @ts-ignore
				notification.close();
			}, this.settings.autoCloseAfter * 1000 );
		}
	}

	run ()
	{
		this.initAskForPermissions().then( () =>
		{
			this.prepareNotification();
			this.propagate().then( ( /** @type {HTMLInputElement | Notification} */ notification ) =>
			{
				this.appendAutoClose( notification );
			} );
		} );

		return this;
	}
};

Object.defineProperty( window, 'Notific', {
	value: Notific,
	writable: false,
	configurable: true,
	enumerable: false,
} );
