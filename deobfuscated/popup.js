
// Deobfuscated popup.js

document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('audioPlayer');
    if (player) {
        player.play().catch(e => console.log("Audio play failed", e));
    }
});
