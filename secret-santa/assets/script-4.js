document.getElementById('pairing-name').innerText = pairingDefinition[1];

if (pairingDefinition[2]) {
    document.getElementById('pairing-details').innerText = pairingDefinition[2];
} else {
    document.getElementById('pairing-details').style.display = 'none';
}