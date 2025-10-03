document.addEventListener('DOMContentLoaded', function() {

  const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 15 + 's';
        particlesContainer.appendChild(particle);
    }


    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

          });
    });


    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            const iframe = document.getElementById('game-iframe');
            iframe.src = link;
            document.getElementById('game-container').classList.remove('hidden');
        });
    });


    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const link = this.getAttribute('data-link');
            const iframe = document.getElementById('game-iframe');
            iframe.src = link;
            const container = document.getElementById('game-container');
            container.classList.remove('hidden');
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        });
    });


    document.getElementById('close-game').addEventListener('click', function() {
        const iframe = document.getElementById('game-iframe');
        iframe.src = '';
        document.getElementById('game-container').classList.add('hidden');
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    });


    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll('.game-card');
        cards.forEach(card => {
            const name = card.querySelector('h2').textContent.toLowerCase();
            card.style.display = name.includes(query) ? 'inline-block' : 'none';
        });
    });
});
