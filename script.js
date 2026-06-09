const yearEl = document.getElementById("currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ==================== COUNTDOWN ====================
const WEDDING_DATE = new Date("2026-05-02T18:00:00-03:00");

function updateCountdown() {
  const now = new Date()
  const difference = WEDDING_DATE.getTime() - now.getTime()

  const labelElement = document.getElementById("countdown-label")
  const daysElement = document.getElementById("days")
  const hoursElement = document.getElementById("hours")
  const minutesElement = document.getElementById("minutes")
  const secondsElement = document.getElementById("seconds")

  let days, hours, minutes, seconds

  if (difference > 0) {
    labelElement.textContent = "Faltam"
    days = Math.floor(difference / (1000 * 60 * 60 * 24))
    hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    minutes = Math.floor((difference / 1000 / 60) % 60)
    seconds = Math.floor((difference / 1000) % 60)
  } else {
    labelElement.textContent = "Casados há"
    const marriedDiff = now.getTime() - WEDDING_DATE.getTime()
    days = Math.floor(marriedDiff / (1000 * 60 * 60 * 24))
    hours = Math.floor((marriedDiff / (1000 * 60 * 60)) % 24)
    minutes = Math.floor((marriedDiff / 1000 / 60) % 60)
    seconds = Math.floor((marriedDiff / 1000) % 60)
  }

  if(daysElement) daysElement.textContent = String(days).padStart(2, "0")
  if(hoursElement) hoursElement.textContent = String(hours).padStart(2, "0")
  if(minutesElement) minutesElement.textContent = String(minutes).padStart(2, "0")
  if(secondsElement) secondsElement.textContent = String(seconds).padStart(2, "0")
}

updateCountdown()
setInterval(updateCountdown, 1000)

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyM8oAekXjywc07FYtYN40RrU803n90689ppHtJUmH6rlGUte8UiGqVtT-S_oxYzVsC-Q/exec";


// ==================== LOJA COM CARROSSEL ====================
const storeTrack = document.getElementById('store-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentSlide = 0;
let totalItems = 0;
let itemsPerView = 3;
function updateItemsPerView() {
  if (window.innerWidth < 768) {
    itemsPerView = 1;
  } else if (window.innerWidth < 1024) {
    itemsPerView = 2;
  } else {
    itemsPerView = 3;
  }
}

window.addEventListener('resize', () => {
  updateItemsPerView();
  updateCarouselPosition();
});

function loadStore() {
  if(!storeTrack) return;
  updateItemsPerView();

  fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(products => {
      storeTrack.innerHTML = ''; 
      totalItems = products.length;

      if (totalItems === 0) {
        storeTrack.innerHTML = '<p style="text-align:center; width:100%">A loja está fechada no momento.</p>';
        return;
      }

      products.forEach(product => {
        const isSoldOut = product.stock <= 0;
        const imageUrl = product.image ? product.image : 'https://placehold.co/600x400/e8e4de/3d3833?text=Presente';
        let displayPrice;
        if (!product.price || product.price == 0 || product.price === "0") {
             displayPrice = "Você decide o valor! ✨"; 
        } else {
             const priceNumber = parseFloat(String(product.price).replace(',', '.'));
             if (!isNaN(priceNumber)) {
                  displayPrice = priceNumber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
             } else {
                  displayPrice = `R$ ${product.price}`;
             }
        }

        const card = document.createElement('div');
        card.className = `product-card ${isSoldOut ? 'product-sold-out' : ''}`;
        
        card.innerHTML = `
          <div class="product-image-container">
             ${isSoldOut ? '<div class="badge-sold">ESGOTADO</div>' : ''}
             <img src="${imageUrl}" alt="${product.name}">
          </div>
          <div class="product-info">
            <h3 class="card-title">${product.name}</h3>
            <p class="card-description">${product.description}</p>
            
            <div class="product-price">${displayPrice}</div>
            
            <button class="btn btn-primary btn-buy" onclick="buyItem('${product.id}', this)" ${isSoldOut ? 'disabled' : ''}>
              ${isSoldOut ? 'Já levaram' : 'Presentear'}
            </button>
          </div>
        `;
        storeTrack.appendChild(card);
      });
      
      updateCarouselButtons();
    })
    .catch(error => {
      console.error("Erro:", error);
      storeTrack.innerHTML = '<p>Erro ao carregar.</p>';
    });
}

window.moveCarousel = function(direction) {
  const maxSlides = Math.max(0, totalItems - itemsPerView);
  
  currentSlide += direction;

  if (currentSlide < 0) currentSlide = 0;
  if (currentSlide > maxSlides) currentSlide = maxSlides;

  updateCarouselPosition();
  updateCarouselButtons();
}

function updateCarouselPosition() {
  if(!storeTrack || !storeTrack.children[0]) return;
  
  const item = storeTrack.children[0];
  const itemWidth = item ? item.offsetWidth : 0;
  const gap = 16; 
  const moveAmount = (itemWidth + gap) * currentSlide;
  
  storeTrack.style.transform = `translateX(-${moveAmount}px)`;
}

function updateCarouselButtons() {
  if(!prevBtn || !nextBtn) return;
  
  prevBtn.disabled = currentSlide === 0;
  
  const maxSlides = Math.max(0, totalItems - itemsPerView);
  nextBtn.disabled = currentSlide >= maxSlides;
}

// ==================== FUNÇÃO DE COMPRA ====================

window.buyItem = function(itemId, btnElement) {
  const btn = btnElement; 
  const originalText = btn.innerText;

  btn.innerText = "Gerando Link...";
  btn.disabled = true;

  const payload = {
    action: "buy",
    itemId: itemId
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "text/plain;charset=utf-8" },
  })
  .then(response => response.json())
  .then(data => {
    if (data.result === "success") {
      btn.innerText = "Redirecionando...";
      window.open(data.link, '_blank');
      loadStore(); 
    } else {
      alert("Ops: " + data.message);
      btn.innerText = originalText;
      btn.disabled = false;
      loadStore();
    }
  })
  .catch(error => {
    console.error(error);
    alert("Erro de conexão. Tente novamente.");
    btn.innerText = originalText;
    btn.disabled = false;
  });
}
loadStore();

// ==================== FRASES DINÂMICAS ====================
const frasesDeAmor = [
  { text: "O amor não se vê com os olhos, mas com a alma.", author: "William Shakespeare" },
  { text: "A suprema felicidade da vida é ter a convicção de que somos amados.", author: "Victor Hugo" },
  { text: "Amo-te sem saber como, nem quando, nem onde, amo-te simplesmente sem problemas nem orgulho.", author: "Pablo Neruda" },
  { text: "O amor é fogo que arde sem se ver; é ferida que dói, e não se sente.", author: "Luís Vaz de Camões" },
  { text: "Cada qual sabe amar a seu modo; o modo, pouco importa; o essencial é que saiba amar.", author: "Machado de Assis" },
  { text: "Amai, porque nada melhor para a saúde que um amor correspondido.", author: "Vinicius de Moraes" },
  { text: "O amor não é um hábito, um compromisso, ou uma dívida. O amor é simplesmente... o amor.", author: "Paulo Coelho" },
  { text: "As mais belas coisas do mundo não podem ser vistas nem tocadas, mas sim sentidas com o coração.", author: "Helen Keller" },
  { text: "Sempre há um pouco de loucura no amor, mas sempre há um pouco de razão na loucura.", author: "Friedrich Nietzsche" },
  { text: "O verdadeiro amor nunca se esgota. Quanto mais se dá, mais se tem.", author: "Antoine de Saint-Exupéry" }
];

const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');

if (quoteTextEl && quoteAuthorEl) {
  const randomIndex = Math.floor(Math.random() * frasesDeAmor.length);
  const fraseSorteada = frasesDeAmor[randomIndex];
  
  quoteTextEl.textContent = `"${fraseSorteada.text}"`;
  quoteAuthorEl.textContent = `— ${fraseSorteada.author}`;
}