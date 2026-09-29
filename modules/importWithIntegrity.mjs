/** @type {Map<String, Promise>} one fetch and one import per url */
const imports = new Map();

export function importWithIntegrity ( /** @type {String} */ path, /** @type {String} */ integrity )
{
	const POSSIBLE_HASHES = [ 'sha256', 'sha384', 'sha512' ]; // same length… 6 chars
	const INTEGRITY_DIVIDER = '-';

	/** @type {String} */
	const url = new URL( path, document.baseURI ).href;

	if ( imports.has( url ) ) {
		return imports.get( url );
	}
	if ( !integrity ) {
		integrity = 'is missing!';
	}
	if (
		!POSSIBLE_HASHES.includes( integrity.substring( 0, 6 ).toLowerCase() )
		|| integrity.substring( 6, 7 ) !== INTEGRITY_DIVIDER
	) {
		integrity = POSSIBLE_HASHES[ 0 ] + INTEGRITY_DIVIDER + integrity;
	}

	// fetch() rejects when the file doesn't match integrity, then exactly this checked content is imported through blob: url
	// (import( url ) would download the file again, without any check)
	imports.set( url, fetch( url, {
		integrity: integrity,
	} ).then( ( /** @type {Response} */ response ) =>
	{
		return response.arrayBuffer();
	} ).then( ( /** @type {ArrayBuffer} */ source ) =>
	{
		/** @type {String} */
		const blobUrl = URL.createObjectURL( new Blob( [ source ], { type: 'text/javascript' } ) );

		return import( blobUrl ).finally( () =>
		{
			URL.revokeObjectURL( blobUrl );
		} );
	} ).catch( ( /** @type {Error} */ error ) =>
	{
		imports.delete( url ); // next call can try it again
		throw error;
	} ) );
	return imports.get( url );
}
