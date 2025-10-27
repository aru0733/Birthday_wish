// Small page enter transition
(function(){
  document.documentElement.classList.add('loaded');
})();

// Surprise Modal logic on page3
(function(){
  const trigger = document.getElementById('surpriseBtn');
  const modal = document.getElementById('surpriseModal');
  const close = document.getElementById('closeModal');
  if(!trigger || !modal) return;
  trigger.addEventListener('click', ()=>{
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
  });
  const hide = ()=>{
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  };
  modal.addEventListener('click', (e)=>{ if(e.target === modal) hide(); });
  if(close) close.addEventListener('click', hide);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal.classList.contains('show')) hide(); });
})();

// Floating hearts (no music)
(function(){
  // Hearts container
  let heartsContainer = document.querySelector('.hearts');
  if(!heartsContainer){
    heartsContainer = document.createElement('div');
    heartsContainer.className = 'hearts';
    document.body.appendChild(heartsContainer);
  }

  function spawnHeart(){
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = '❤';
    const size = 12 + Math.random()*16; // 12-28px
    heart.style.fontSize = size + 'px';
    heart.style.left = Math.random()*100 + 'vw';
    const duration = 6 + Math.random()*6; // 6-12s
    heart.style.animationDuration = duration + 's';
    heart.style.bottom = '-40px';
    heartsContainer.appendChild(heart);
    setTimeout(()=> heart.remove(), duration*1000);
  }

  // Spawn hearts intermittently
  setInterval(spawnHeart, 900);
  for(let i=0;i<8;i++) setTimeout(spawnHeart, i*300);

})();

// Confetti burst on Next button (index only)
(function(){
  const isIndex = document.body.classList.contains('page1');
  if(!isIndex) return;
  const next = document.querySelector('.hero .btn');
  if(!next) return;

  function confettiBurst(x, y){
    const colors = ['#ff6b9c','#ff8fb3','#ffb27a','#fff3f7'];
    for(let i=0;i<24;i++){
      const piece = document.createElement('span');
      piece.style.position = 'fixed';
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
      piece.style.width = piece.style.height = 6 + Math.random()*5 + 'px';
      piece.style.borderRadius = Math.random() > .6 ? '50%' : '2px';
      piece.style.background = colors[i % colors.length];
      piece.style.zIndex = 20;
      const angle = Math.random() * Math.PI * 2;
      const velocity = 3 + Math.random() * 6;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 2;
      const gravity = 0.12 + Math.random()*0.08;
      let life = 0;
      const maxLife = 60 + Math.random()*30;
      const tick = ()=>{
        life++;
        const nx = x + vx * life;
        const ny = y + vy * life + gravity * life * life * 0.5;
        piece.style.transform = `translate(${nx - x}px, ${ny - y}px) rotate(${life*8}deg)`;
        piece.style.opacity = String(1 - life / maxLife);
        if(life < maxLife) requestAnimationFrame(tick); else piece.remove();
      };
      document.body.appendChild(piece);
      requestAnimationFrame(tick);
    }
  }

  next.addEventListener('click', (e)=>{
    const rect = next.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    confettiBurst(cx, cy);
  }, { passive: true });
})();

// Index-only extras: smooth parallax and cursor heart trail
(function(){
  if(!document.body.classList.contains('page1')) return;
  const wrap = document.querySelector('.parallax-wrap');
  const sparkles = document.querySelector('.sparkles');
  if(!wrap) return;
  
  // Check if device supports hover (desktop)
  const isTouchDevice = !window.matchMedia('(hover: hover)').matches;
  
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  function onMove(e){
    const x = (e.clientX / window.innerWidth - .5);
    const y = (e.clientY / window.innerHeight - .5);
    targetX = x; targetY = y;
  }
  
  // Only add parallax on non-touch devices
  if(!isTouchDevice){
    window.addEventListener('mousemove', onMove, { passive:true });
    function tick(){
      // ease toward target
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      // wrap moves subtly; sparkles move slightly more
      wrap.style.transform = `translate(${currentX*-8}px, ${currentY*-6}px)`;
      if(sparkles) sparkles.style.transform = `translate(${currentX*10}px, ${currentY*8}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Cursor heart trail - reduced intensity on mobile
  const trail = (x,y)=>{
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = '❤';
    h.style.position = 'fixed';
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    h.style.fontSize = (8 + Math.random()*6) + 'px';
    h.style.opacity = isTouchDevice ? '.6' : '.9';
    h.style.transition = 'transform .8s ease, opacity .8s ease';
    document.body.appendChild(h);
    requestAnimationFrame(()=>{
      h.style.transform = 'translateY(-20px) scale(1.2)';
      h.style.opacity = '0';
    });
    setTimeout(()=> h.remove(), 700);
  };
  
  // Throttle trail on mobile
  let lastTrail = 0;
  const throttleDelay = isTouchDevice ? 100 : 50;
  window.addEventListener('pointermove', (e)=> {
    const now = Date.now();
    if(now - lastTrail > throttleDelay){
      trail(e.clientX, e.clientY);
      lastTrail = now;
    }
  }, { passive:true });
})();

// Page 2 Slider functionality
(function(){
  if(!document.body.classList.contains('page2')) return;
  
  const track = document.getElementById('sliderTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');
  
  if(!track || !prevBtn || !nextBtn || !dotsContainer) return;
  
  const cards = track.querySelectorAll('.slider-card');
  const totalCards = cards.length;
  let currentIndex = 0;
  
  // Create dots
  for(let i = 0; i < totalCards; i++){
    const dot = document.createElement('button');
    dot.className = 'slider-dot';
    if(i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
  
  function updateSlider(){
    const translateX = -currentIndex * 100;
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
    
    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalCards - 1;
  }
  
  function goToSlide(index){
    if(index >= 0 && index < totalCards){
      currentIndex = index;
      updateSlider();
    }
  }
  
  function nextSlide(){
    if(currentIndex < totalCards - 1){
      currentIndex++;
      updateSlider();
    }
  }
  
  function prevSlide(){
    if(currentIndex > 0){
      currentIndex--;
      updateSlider();
    }
  }
  
  // Button events
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);
  
  // Touch/swipe support
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });
  
  track.addEventListener('touchmove', (e) => {
    if(!isDragging) return;
    e.preventDefault();
  }, { passive: false });
  
  track.addEventListener('touchend', (e) => {
    if(!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Only swipe if horizontal movement is greater than vertical
    if(Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50){
      if(diffX > 0 && currentIndex < totalCards - 1){
        nextSlide();
      } else if(diffX < 0 && currentIndex > 0){
        prevSlide();
      }
    }
    
    isDragging = false;
  }, { passive: true });
  
  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') prevSlide();
    if(e.key === 'ArrowRight') nextSlide();
  });
  
  // Initialize
  updateSlider();
})();

// Page 3 Enhanced Surprise Effects
(function(){
  if(!document.body.classList.contains('page3')) return;
  
  const loveNotes = document.getElementById('loveNotes');
  const heartRain = document.getElementById('heartRain');
  const sparkleContainer = document.getElementById('sparkleContainer');
  const surpriseBtn = document.getElementById('surpriseBtn');
  const btnHearts = surpriseBtn?.querySelector('.btn-hearts');
  const surpriseMessages = document.getElementById('surpriseMessages');
  const floatingHeartsBg = document.getElementById('floatingHeartsBg');
  
  if(!loveNotes || !heartRain || !sparkleContainer || !surpriseBtn) return;
  
  // Love notes data
  const notes = [
    "You're my sunshine ☀️",
    "Forever & always 💕",
    "My heart belongs to you ❤️",
    "You make me smile 😊",
    "Love you to the moon 🌙",
    "You're my everything ✨",
    "My favorite person 💖",
    "You're amazing 🌟"
  ];
  
  // Floating love notes
  function createLoveNote(){
    const note = document.createElement('div');
    note.className = 'love-note';
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    note.style.left = Math.random() * 100 + 'vw';
    note.style.top = Math.random() * 100 + 'vh';
    note.style.animationDelay = Math.random() * 2 + 's';
    loveNotes.appendChild(note);
    
    setTimeout(() => note.remove(), 8000);
  }
  
  // Heart rain effect
  function createHeartRain(){
    const heart = document.createElement('div');
    heart.className = 'rain-heart';
    heart.textContent = '❤';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (3 + Math.random() * 2) + 's';
    heartRain.appendChild(heart);
    
    setTimeout(() => heart.remove(), 5000);
  }
  
  // Sparkle effect
  function createSparkle(){
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparkleContainer.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 2000);
  }
  
  // Button heart burst
  function createBtnHeart(){
    if(!btnHearts) return;
    const heart = document.createElement('div');
    heart.className = 'btn-heart';
    heart.textContent = '❤';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.top = Math.random() * 100 + '%';
    btnHearts.appendChild(heart);
    
    setTimeout(() => heart.remove(), 1500);
  }
  
  // Surprise text popup - mobile friendly
  function createSurpriseText(){
    if(!surpriseMessages) return;
    const texts = surpriseMessages.querySelectorAll('.surprise-text');
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    const clone = randomText.cloneNode(true);
    
    // Mobile-friendly positioning (avoid edges and button area)
    const isMobile = window.innerWidth <= 768;
    const leftRange = isMobile ? 20 : 15; // More margin on mobile
    const topRange = isMobile ? 30 : 25; // Avoid button area on mobile
    const widthRange = isMobile ? 60 : 70;
    const heightRange = isMobile ? 40 : 50;
    
    clone.style.left = Math.random() * widthRange + leftRange + '%';
    clone.style.top = Math.random() * heightRange + topRange + '%';
    clone.style.position = 'absolute';
    clone.style.zIndex = '10';
    clone.style.pointerEvents = 'none';
    
    surpriseMessages.appendChild(clone);
    
    setTimeout(() => clone.remove(), 2500);
  }
  
  // Background floating hearts
  function createBgHeart(){
    if(!floatingHeartsBg) return;
    const heart = document.createElement('div');
    heart.className = 'bg-heart';
    heart.textContent = '💖';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (8 + Math.random() * 8) + 's';
    floatingHeartsBg.appendChild(heart);
    
    setTimeout(() => heart.remove(), 16000);
  }
  
  // Reduced intensity effects - non-blocking (NO POPUP MESSAGES)
  setInterval(createBgHeart, 5000); // Gentle background hearts
  setInterval(createSparkle, 4000); // Less frequent sparkles
  // Removed createSurpriseText - no popup messages on page3
  
  // Initial effects - minimal
  setTimeout(createBgHeart, 1000);
  setTimeout(createSparkle, 2000);
  // Removed createSurpriseText initial call
  
  // Button interactions
  surpriseBtn.addEventListener('mouseenter', () => {
    for(let i = 0; i < 3; i++){
      setTimeout(createBtnHeart, i * 100);
    }
  });
  
  surpriseBtn.addEventListener('touchstart', () => {
    for(let i = 0; i < 3; i++){
      setTimeout(createBtnHeart, i * 100);
    }
    // No popup messages on page3
  }, { passive: true });
  
  // Touch interactions for mobile
  let touchStartTime = 0;
  surpriseBtn.addEventListener('touchstart', () => {
    touchStartTime = Date.now();
  }, { passive: true });
  
  surpriseBtn.addEventListener('touchend', () => {
    const touchDuration = Date.now() - touchStartTime;
    if(touchDuration > 500){ // Long press
      // No popup messages, just extra heart effects
      for(let i = 0; i < 5; i++){
        setTimeout(createBtnHeart, i * 200);
      }
    }
  }, { passive: true });
  
  // Page visibility effects
  document.addEventListener('visibilitychange', () => {
    if(!document.hidden){
      // Resume effects when page becomes visible
      setTimeout(createSparkle, 500);
      setTimeout(createLoveNote, 1000);
    }
  });
})();

// Page 4 Birthday Celebration
(function(){
  if(!document.body.classList.contains('page4')) return;
  
  // Mobile detection and optimization
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const candles = document.querySelectorAll('.candle');
  const flames = document.querySelectorAll('.flame');
  const wishReveal = document.getElementById('wishReveal');
  const balloonRelease = document.getElementById('balloonRelease');
  const confettiContainer = document.getElementById('confettiContainer');
  
  if(!candles.length || !wishReveal || !balloonRelease || !confettiContainer) return;
  
  let blownCandles = 0;
  const totalCandles = candles.length;
  
  // Wish messages
  const wishes = [
    "Your wish came true! ✨",
    "You're the most amazing person! 💖", 
    "May all your dreams come true! 🌟",
    "You're so special! 💕",
    "Happy Birthday! 🎂",
    "You make the world brighter! ☀️"
  ];
  
  // Blow out candle
  function blowOutCandle(candle, flame) {
    if (flame.classList.contains('blown')) return;
    
    flame.classList.add('blown');
    blownCandles++;
    
    // Create confetti burst
    createConfettiBurst(candle);
    
    // Check if all candles are blown
    if (blownCandles === totalCandles) {
      setTimeout(() => {
        celebrateBirthday();
      }, 500);
    }
  }
  
  // Confetti burst
  function createConfettiBurst(element) {
    const rect = element.getBoundingClientRect();
    const colors = ['#ff6b9c', '#ff8fb3', '#ffb27a', '#fff3f7', '#ffd6e6'];
    
    for(let i = 0; i < 15; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.position = 'fixed';
      confetti.style.left = rect.left + rect.width/2 + 'px';
      confetti.style.top = rect.top + 'px';
      confetti.style.background = colors[i % colors.length];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.width = (4 + Math.random() * 4) + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
      confetti.style.setProperty('--drift', (Math.random() - 0.5) * 100 + 'px');
      
      confettiContainer.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }
  }
  
  // Balloon release
  function createBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = Math.random() * 100 + '%';
    balloon.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
    balloon.style.setProperty('--drift', (Math.random() - 0.5) * 60 + 'px');
    balloon.style.animationDuration = (6 + Math.random() * 4) + 's';
    
    balloonRelease.appendChild(balloon);
    setTimeout(() => balloon.remove(), 10000);
  }
  
  // Wish message popup - Fixed positioning
  function createWishMessage() {
    const message = document.createElement('div');
    message.className = 'wish-text';
    message.textContent = wishes[Math.floor(Math.random() * wishes.length)];
    
    // Center the messages in the viewport
    const centerX = isMobile ? 48 : 48;
    const centerY = isMobile ? 48 : 45;
    const spread = 30; // How far from center
    
    message.style.left = (centerX + (Math.random() - 0.5) * spread) + '%';
    message.style.top = (centerY + (Math.random() - 0.5) * spread) + '%';
    message.style.position = 'fixed';
    message.style.zIndex = '100';
    message.style.pointerEvents = 'none';
    message.style.transform = 'translate(-50%, -50%)';
    
    wishReveal.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  }
  
  // Full birthday celebration
  function celebrateBirthday() {
    // Activate wish reveal container
    wishReveal.classList.add('active');
    
    // Release balloons
    for(let i = 0; i < 8; i++) {
      setTimeout(createBalloon, i * 200);
    }
    
    // Show wish messages - only after candles are blown
    for(let i = 0; i < 5; i++) {
      setTimeout(createWishMessage, i * 800);
    }
    
    // Big confetti burst
    setTimeout(() => {
      for(let i = 0; i < 50; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.position = 'fixed';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.top = '0px';
          confetti.style.background = ['#ff6b9c', '#ff8fb3', '#ffb27a', '#fff3f7', '#ffd6e6'][Math.floor(Math.random() * 5)];
          confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
          confetti.style.width = (6 + Math.random() * 6) + 'px';
          confetti.style.height = confetti.style.width;
          confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
          confetti.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
          
          confettiContainer.appendChild(confetti);
          setTimeout(() => confetti.remove(), 5000);
        }, i * 50);
      }
    }, 1000);
  }
  
  // Candle interactions
  candles.forEach((candle, index) => {
    const flame = flames[index];
    
    // Click/tap to blow out
    candle.addEventListener('click', (e) => {
      e.preventDefault();
      blowOutCandle(candle, flame);
    });
    
    // Touch for mobile - improved
    candle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      blowOutCandle(candle, flame);
    }, { passive: false });
    
    // Also handle touchend for better mobile support
    candle.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    // Hover effect (desktop only)
    candle.addEventListener('mouseenter', () => {
      if (!flame.classList.contains('blown')) {
        candle.style.transform = 'scale(1.1)';
      }
    });
    
    candle.addEventListener('mouseleave', () => {
      candle.style.transform = 'scale(1)';
    });
    
    // Visual feedback for touch
    candle.addEventListener('touchstart', () => {
      if (!flame.classList.contains('blown')) {
        candle.style.transform = 'scale(0.95)';
      }
    });
    
    candle.addEventListener('touchend', () => {
      candle.style.transform = 'scale(1)';
    });
  });
  
  // No auto-celebration - only celebrate after candles are blown
})();