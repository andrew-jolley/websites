var queryString = _.chain( location.search.slice( 1 ).split( /&/g ) )
    .map( function ( item ) { if ( item ) return item.split( /=/ ).map( function ( str ) { return decodeURIComponent( str ); } ); } )
    .compact().object().value();

var name = queryString.name;

var pairing = CryptoJS.AES.decrypt( queryString.pairing, queryString.key ).toString(CryptoJS.enc.Utf8);
var pairingDefinition = pairing.match( /^([^(]+)(?: (\([^)]+\)))?$/ );