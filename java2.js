// Variables globales
let isPlaying = false;
let player = null; // YouTube player (legacy)
let vimeoPlayer = null; // Vimeo player
let currentSlide = 0;
const totalSlides = 8;
let enableMusic = false;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeCarousel();
    initializeModal();
    initializeParallax();
    // applySectionTheming(); // Desactivado para respetar colores específicos por icono
});

// Modal de bienvenida
function initializeModal() {
    const enterInvitation = document.getElementById('enterInvitation');
    const modal = document.getElementById('welcomeModal');
    if (!enterInvitation || !modal) return;

    enterInvitation.addEventListener('click', function() {
        modal.style.display = 'none';
        // Intentar reproducir Vimeo con sonido
        tryPlayVimeoWithSound();
    });
}

function tryPlayVimeoWithSound() {
    const iframe = document.getElementById('vimeo-player');
    if (!iframe || !window.Vimeo || !window.Vimeo.Player) return;
    if (!vimeoPlayer) {
        vimeoPlayer = new window.Vimeo.Player(iframe);
    }
    // Quitar mute si estuviese aplicado por políticas previas
    vimeoPlayer.setVolume(1).then(() => {
        return vimeoPlayer.play();
    }).then(() => {
        isPlaying = true;
    }).catch(() => {
        // Si falla (por políticas del navegador), intentamos play nuevamente
        vimeoPlayer.play().catch(() => {});
    });
}

// Cargar la API de YouTube
function loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

// Función llamada por la API de YouTube
function initializeYouTubePlayer() {
    if (!enableMusic) return;

    player = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'jb0K64SGsfc',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playlist: 'jb0K64SGsfc'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    const musicPlayer = document.getElementById('musicPlayer');
    const musicToggle = document.getElementById('musicToggle');
    
    musicPlayer.style.display = 'block';
    musicToggle.addEventListener('click', toggleMusic);
    
    // Reproducir si está habilitada la música
    if (enableMusic) {
        event.target.playVideo();
        isPlaying = true;
        updateMusicIcon();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
    }
    updateMusicIcon();
}

function onPlayerError(event) {
    console.log('Error al cargar el video de YouTube');
    const musicPlayer = document.getElementById('musicPlayer');
    musicPlayer.style.display = 'block';
    isPlaying = false;
    updateMusicIcon();
}

function toggleMusic() {
    if (player) {
        if (isPlaying) {
            player.pauseVideo();
            isPlaying = false;
        } else {
            player.playVideo();
            isPlaying = true;
        }
        updateMusicIcon();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (isPlaying) {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"></path>
        `;
    } else {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
    }
}

// Countdown
function initializeCountdown() {
    // Cuenta regresiva hasta el 31/12/2025 23:59:59 hora local
    const targetDate = new Date('2025-12-31T23:59:59').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');

    if (!track || !prevBtn || !nextBtn || !currentSlideElement || !totalSlidesElement) {
        return;
    }

    totalSlidesElement.textContent = totalSlides;
    updateSlideCounter();

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = totalSlides - 1;
        }
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarousel();
    });

    // Auto-play del carrusel
    setInterval(() => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarousel();
    }, 4000);
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const translateX = -currentSlide * 100;
    track.style.transform = `translateX(${translateX}%)`;
    updateSlideCounter();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    if (!currentSlideElement) return;
    currentSlideElement.textContent = currentSlide + 1;
}

// Parallax en la portada izquierda (layer transform to emulate fixed background)
function initializeParallax() {
    const heroLeft = document.querySelector('.hero-left');
    const heroLayer = document.querySelector('.hero-left .hero-left-bg');
    if (!heroLeft || !heroLayer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let lastScrollY = window.scrollY || window.pageYOffset;
    let ticking = false;

    const computeSpeed = () => (window.innerWidth <= 768 ? 0.65 : 0.5);

    const render = () => {
        if (prefersReducedMotion.matches) {
            heroLayer.style.transform = 'translate3d(0,0,0)';
        } else {
            const speed = computeSpeed();
            heroLayer.style.transform = `translate3d(0, ${Math.round(lastScrollY * speed)}px, 0)`;
        }
        ticking = false;
    };

    const onScroll = () => {
        lastScrollY = window.scrollY || window.pageYOffset;
        if (!ticking) {
            window.requestAnimationFrame(render);
            ticking = true;
        }
    };

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', render);
}

// Funciones de los botones
function openLocation(location) {
    const addresses = {
        ceremony: "Parroquia Nuestra Señora de Lujan, Av. Pergamino 203, Santo Domingo",
        celebration: "Salón de fiestas Avril, Av. Los Reartes 12, Santo Domingo"
    };
    
    const address = addresses[location];
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
}

function suggestMusic() {
    const whatsappMessage = "¡Hola! Me gustaría sugerir una canción para la playlist de Rosmery 🎵";
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
}

function showDressCode() {
    showToast("Dress Code", "Elegante sport - Colores tierra y dorados son bienvenidos 👗");
}

function showTips() {
    showToast("Tips y Notas", "La ceremonia será al aire libre. Se recomienda llegar 15 minutos antes ⛪");
}

function showGifts() {
    const message = "Hola, me gustaría información sobre los regalos para Rosmery 🎁";
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function confirmAttendance() {
    const message = "¡Hola! Quiero confirmar mi asistencia a la invitación de Rosmery 💖✨";
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 600; color: hsl(var(--brown)); margin-bottom: 0.5rem;">${title}</h4>
        <p style="color: hsl(var(--foreground) / 0.7);">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Aplicar colores a iconos (lord-icon) según la sección
function applySectionTheming() {
    const lightSections = document.querySelectorAll('.countdown-section, .gallery-section, .gifts-section, .footer-section');
    const pastelSections = document.querySelectorAll('.events-section, .party-section, .rsvp-section');

    lightSections.forEach(section => {
        const lordIcons = section.querySelectorAll('lord-icon');
        lordIcons.forEach(icon => {
            icon.setAttribute('colors', 'primary:#000000,secondary:#000000');
        });
    });

    pastelSections.forEach(section => {
        const lordIcons = section.querySelectorAll('lord-icon');
        lordIcons.forEach(icon => {
            icon.setAttribute('colors', 'primary:#000000,secondary:#000000');
        });
    });
}
