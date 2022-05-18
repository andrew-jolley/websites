function isAmazonEnabled() {

    const checkBox = document.getElementById('amazon');

    return checkBox ? checkBox.checked : false;

}

function persist() {

    if ( ! window.localStorage )
        return ;

    var amazon = isAmazonEnabled();
    var content = document.getElementById( 'input' ).value;

    window.localStorage.setItem( 'amazon', amazon );
    window.localStorage.setItem( 'input', content );

}

function restore() {

    if ( ! window.localStorage )
        return ;

    var amazon = window.localStorage.getItem( 'amazon' );
    var content = window.localStorage.getItem( 'input' );

    if (typeof amazon === 'undefined')
        amazon = true;

    if (typeof content === 'undefined')
        content = '';

    if ( document.getElementById( 'amazon' ) )
        document.getElementById( 'amazon' ).checked = amazon;

    document.getElementById( 'input' ).value = content;

}

function reset() {

    var result = document.getElementById( 'result' );

    result.classList.add( 'none' );
    result.classList.remove( 'error' );

}

function error(text) {

    var result = document.getElementById( 'result' );

    result.classList.remove( 'none' );
    result.classList.add( 'error' );

    result.innerText = text;

}

function success( pairings ) {

    var result = document.getElementById( 'result' );

    result.classList.remove( 'none' );
    result.classList.remove( 'error' );

    result.innerHTML = '';

    var table = document.createElement( 'table' );
    table.className = 'result-table';
    result.appendChild( table );

    var names = Object.keys( pairings ).sort();

    for ( var t = 0, T = names.length; t < T; ++ t ) {

        var name = names[ t ];
        var prettyName = names[ t ].replace( /\([^)]+\)/g, ' ' ).replace( / +/g, ' ' ).trim();

        var tr = document.createElement( 'tr' );
        tr.className = 'result-row';
        table.appendChild( tr );

        var tdName = document.createElement( 'td' );
        tdName.className = 'result-name';
        tr.appendChild( tdName );

        var tdLink = document.createElement( 'td' );
        tdLink.className = 'result-link';
        tr.appendChild( tdLink );

        var link = document.createElement( 'a' );
        tdLink.appendChild( link );

        var key = String( _.random( 0x0000, 0xFFFF ) );
        var encryptedPairing = CryptoJS.AES.encrypt( pairings[ name ], key );

        var pairingPath = window.location.pathname.replace( /[^/]+$/, '' ) + 'pairing.html';
        var pairingQueryString = '?name=' + encodeURIComponent( prettyName ) + '&key=' + encodeURIComponent( key ) + '&pairing=' + encodeURIComponent( encryptedPairing );

        if ( isAmazonEnabled() )
            pairingQueryString += '&extra=1';

        tdName.innerText = name;

        link.addEventListener( 'click', protect );
        link.setAttribute( 'data-name', name );
        link.href = window.location.protocol + '//' + window.location.host + pairingPath + pairingQueryString;
        link.target = '_blank';
        link.innerText = link.href;

    }

}

function updateAmazon() {

    var result = document.getElementById( 'result' );
    var links = result.getElementsByTagName( 'a' );

    for ( var t = 0; t < links.length; ++t ) {

        var link = links[t];

        if ( isAmazonEnabled() )
            link.href += '&extra=1';
        else
            link.href = link.href.replace( /&extra=[01]/, '' );

        link.innerText = link.href;

    }

}

function generate( e ) {

    e.preventDefault();

    var content = document.getElementById( 'input' ).value;

    // Convert carriage returns into line feeds
    content = content.replace( /(\r\n|\r)/g, '\n' );

    // Merge adjacent blank characters into a single space
    content = content.replace( /[ \t]+/g, ' ' );

    // Trim lines
    content = content.replace( /^ | $/gm, '' );

    // Strip comments
    content = content.replace( /^#.*$/gm, '' );

    // Strip empty lines
    content = content.replace( /\n+/g, '\n' );

    // Remove leading/trailing newlines
    content = content.replace( /^\n|\n$/g, '' );

    var lines = content.split( /\n/g );

    if ( lines.length === 0 || lines.length === 1 && lines[ 0 ].length === 0 )
        return reset();

    var santa = new SecretSanta();

    for ( var t = 0, T = lines.length; t < T; ++ t ) {

        var match = lines[ t ].match( /^((?:(?![!=]).)+)((?: [!=](?:(?! [!=]).)+)*)$/ );

        if ( ! match )
            return error( 'Syntax error: "' + lines[ t ] + '" isn\'t valid' );

        var name = match[ 1 ];
        var rules = match[ 2 ] ? match[ 2 ].match(/[!=][^!=]+/g) : null;

        var person = santa.add( name );

        if (rules) {

            for ( var u = 0, U = rules.length; u < U; ++ u ) {

                var fnName = {

                    '=': 'enforce',
                    '!': 'blacklist'

                }[ rules[ u ].charAt( 0 ) ];

                person[ fnName ]( rules[ u ].slice( 1 ).trim() );

            }

        }

    }

    try {
        return success( santa.generate() );
    } catch ( err ) {
      console.error(err.stack)
        return error( err.message );
    }

}

function protect( e ) {

    var name = e.currentTarget.getAttribute( 'data-name' );

    if ( ! confirm( 'If you click this link, you will be revealed ' + name + '\'s pairing! Are you sure you want to do this? Only do this if you\'re actually ' + name + '.\n\nUse right-click to copy the link target instead.' ) ) {
        e.preventDefault();
    }

}