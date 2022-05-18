document.getElementById( 'input' ).placeholder = document.getElementById( 'input-placeholder' ).innerHTML.trim().replace( /^[ \t]+/gm, '' );
document.getElementById( 'input' ).addEventListener( 'change', persist );

if ( document.getElementById( 'amazon' ) ) {
    document.getElementById( 'amazon' ).addEventListener( 'change', updateAmazon );
    document.getElementById( 'amazon' ).addEventListener( 'change', persist );
}

document.getElementById( 'form' ).addEventListener( 'submit', generate );

restore();