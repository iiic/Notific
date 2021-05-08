export class append
{
	constructor ( e = Element )
	{
		const FUNCTION_NAME = 'bindFunction';

		if ( typeof e.prototype[ FUNCTION_NAME ] !== 'function' ) {
			Object.defineProperty( e.prototype, FUNCTION_NAME, {
				value: function ( /** @type {String} */ name, /** @type {Function} */ newFunction )
				{
					this[ name ] = newFunction.bind( this );
				},
				writable: false,
				configurable: false,
				enumerable: false,
			} );
		}
	}
}
