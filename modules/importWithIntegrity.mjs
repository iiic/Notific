/** @type {Map<String, Promise>} one <script> element and one import per path */
const imports = new Map();

export function importWithIntegrity ( /** @type {String} */ path, /** @type {String} */ integrity )
{
	if ( imports.has( path ) ) {
		return imports.get( path );
	}

	const POSSIBLE_HASHES = [ 'sha256', 'sha384', 'sha512' ]; // same length… 6 chars
	const INTEGRITY_DIVIDER = '-';

	if ( !integrity ) {
		integrity = 'is missing!';
	}
	if (
		!POSSIBLE_HASHES.includes( integrity.substring( 0, 6 ).toLowerCase() )
		|| integrity.substring( 6, 7 ) !== INTEGRITY_DIVIDER
	) {
		integrity = POSSIBLE_HASHES[ 0 ] + INTEGRITY_DIVIDER + integrity;
	}

	/** @type {HTMLScriptElement} */
	const element = ( document.createElement( 'SCRIPT' ) ); // link rel="preload" also working, but NOT in Firefox :(

	element.type = 'module';
	element.src = path;
	element.integrity = integrity;
	element.setAttribute( 'crossorigin', 'anonymous' );
	document.head.appendChild( element );
	imports.set( path, import( path ) ); // rejects when the module fails to load (e.g. wrong integrity)
	return imports.get( path );
}
