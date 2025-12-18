const yearEl = document.getElementById("currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ==================== COUNTDOWN ====================
const WEDDING_DATE = new Date("2026-05-02T18:00:00")

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
    // Before wedding
    labelElement.textContent = "Faltam"
    days = Math.floor(difference / (1000 * 60 * 60 * 24))
    hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    minutes = Math.floor((difference / 1000 / 60) % 60)
    seconds = Math.floor((difference / 1000) % 60)
  } else {
    // After wedding - show time married
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

// Update countdown every second
updateCountdown()
setInterval(updateCountdown, 1000)

// ==================== RSVP FORM ====================
const rsvpInitial = document.getElementById("rsvp-initial")
const rsvpForm = document.getElementById("rsvp-form")
const rsvpSuccess = document.getElementById("rsvp-success")
const confirmationForm = document.getElementById("confirmation-form")
const btnConfirm = document.getElementById("btn-confirm")
const btnCancel = document.getElementById("btn-cancel")
const btnAddChild = document.getElementById("btn-add-child")
const btnReset = document.getElementById("btn-reset")
const childrenList = document.getElementById("children-list")
const childrenEmpty = document.getElementById("children-empty")
const successMessage = document.getElementById("success-message")
const guestNameInput = document.getElementById("guest-name")

let children = []
let childIdCounter = 0

// Show form
if(btnConfirm) {
  btnConfirm.addEventListener("click", () => {
    rsvpInitial.classList.add("hidden")
    rsvpForm.classList.remove("hidden")
  })
}

// Cancel form
if(btnCancel) {
  btnCancel.addEventListener("click", (e) => {
    if(e) e.preventDefault();
    resetForm()
  })
}

// Add child
if(btnAddChild) {
  btnAddChild.addEventListener("click", () => {
    const childId = ++childIdCounter
    children.push({ id: childId, name: "", age: "" })
    renderChildren()
  })
}

// Render children list
function renderChildren() {
  if(!childrenList) return;

  if (children.length === 0) {
    childrenEmpty.classList.remove("hidden")
    childrenList.innerHTML = ""
    return
  }

  childrenEmpty.classList.add("hidden")
  childrenList.innerHTML = children
    .map(
      (child, index) => `
    <div class="child-item" data-id="${child.id}">
      <div class="child-inputs">
        <div class="child-input-group">
          <label>Nome do(a) filho(a) ${index + 1}</label>
          <input type="text" class="child-name" value="${child.name}" placeholder="Nome da criança" required>
        </div>
        <div class="child-input-group age">
          <label>Idade</label>
          <input 
            type="number" 
            class="child-age" 
            value="${child.age}" 
            placeholder="Idade" 
            min="0" 
            max="15" 
            required 
            oninvalid="this.setCustomValidity('A idade deve ser menor ou igual a 15')" 
            oninput="this.setCustomValidity('')"
          >
        </div>
      </div>
      <button type="button" class="btn-remove" onclick="removeChildItem(${child.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `,
    )
    .join("")

  // Add event listeners for inputs
  document.querySelectorAll(".child-item").forEach((item) => {
    const id = Number.parseInt(item.dataset.id)
    const nameInput = item.querySelector(".child-name")
    const ageInput = item.querySelector(".child-age")

    nameInput.addEventListener("input", (e) => {
      const child = children.find((c) => c.id === id)
      if (child) child.name = e.target.value
    })

    ageInput.addEventListener("input", (e) => {
      const child = children.find((c) => c.id === id)
      if (child) child.age = e.target.value
    })
  })
}

// Remove child
window.removeChildItem = function(id) { 
  children = children.filter((child) => child.id !== id)
  renderChildren()
}

// Form submission
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyM8oAekXjywc07FYtYN40RrU803n90689ppHtJUmH6rlGUte8UiGqVtT-S_oxYzVsC-Q/exec";

if(confirmationForm) {
  confirmationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const honeypot = document.getElementById("boco_honey");
    if (honeypot && honeypot.value) return;

    const submitBtn = confirmationForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Verificando...";

    const guestName = guestNameInput.value.trim();
    const guestCode = document.getElementById("guest-code").value.trim();
    const guestSpouse = document.getElementById("guest-spouse").value.trim();

    const payload = {
      name: guestName,
      spouse: guestSpouse,
      code: guestCode,
      children: children
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    })
    .then(response => response.json())
    .then(data => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      if (data.result === "success") {
        console.log("Sucesso:", data);
        showSuccess(guestName);
        
        guestNameInput.value = "";
        document.getElementById("guest-code").value = ""; 
        children = [];
      } else {
        console.warn("Rejeitado:", data);
        alert("⚠️ " + (data.message || "Erro na verificação."));
      }
    })
    .catch((error) => {
      console.error("Erro:", error);
      alert("Erro de conexão.");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
  });
}

function showSuccess(name) {
  let message = `Obrigado, <span class="guest-name">${name}</span>!`;
  if (children.length > 0) {
    message += ` Você e ${children.length} filho${children.length > 1 ? "s" : ""} foram confirmados.`;
  }
  successMessage.innerHTML = message;

  rsvpForm.classList.add("hidden");
  rsvpSuccess.classList.remove("hidden");
}

// ==================== LÓGICA DE RESET ====================

function resetForm() {
  if(guestNameInput) guestNameInput.value = "";
  
  const codeInput = document.getElementById("guest-code");
  if (codeInput) codeInput.value = "";

  const spouseInput = document.getElementById("guest-spouse");
  if (spouseInput) spouseInput.value = "";
  
  children = [];
  renderChildren();
  
  rsvpForm.classList.add("hidden");
  rsvpSuccess.classList.add("hidden");
  rsvpInitial.classList.remove("hidden");
}

if(btnReset) {
  btnReset.addEventListener("click", () => {
    resetForm();
  });
}

// ==================== LOJA COM CARROSSEL ====================
const storeTrack = document.getElementById('store-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentSlide = 0;
let totalItems = 0;
let itemsPerView = 3;

// Atualiza quantos itens cabem na tela
function updateItemsPerView() {
  if (window.innerWidth < 768) {
    itemsPerView = 1; // Celular
  } else if (window.innerWidth < 1024) {
    itemsPerView = 2; // Tablets
  } else {
    itemsPerView = 3; // PC
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

        // --- AQUI ESTÁ A MUDANÇA (Lógica do "Você Decide") ---
        let displayPrice;
        
        // Verifica se o preço é zero, nulo ou vazio
        if (!product.price || product.price == 0 || product.price === "0") {
             displayPrice = "Você decide o valor! ✨"; 
        } else {
             // Lógica padrão de formatação (R$ 50,00)
             const priceNumber = parseFloat(String(product.price).replace(',', '.'));
             if (!isNaN(priceNumber)) {
                  displayPrice = priceNumber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
             } else {
                  displayPrice = `R$ ${product.price}`;
             }
        }
        // -----------------------------------------------------

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
            
            <button class="btn btn-primary btn-buy" onclick="buyItem('${product.id}')" ${isSoldOut ? 'disabled' : ''}>
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

// Lógica de Movimento do Carrossel (para os botões funcionarem)
window.moveCarousel = function(direction) {
  const maxSlides = Math.max(0, totalItems - itemsPerView);
  
  currentSlide += direction;

  if (currentSlide < 0) currentSlide = 0;
  if (currentSlide > maxSlides) currentSlide = maxSlides;

  updateCarouselPosition();
  updateCarouselButtons();
}

function updateCarouselPosition() {
  if(!storeTrack.children[0]) return;
  
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

// ==================== FUNÇÃO DE COMPRA (CORRIGIDA - NOVA ABA) ====================

window.buyItem = function(itemId) {
  const btn = event.target; 
  const originalText = btn.innerText;

  // --- ABERTURA IMEDIATA DA ABA (Anti-Bloqueio) ---
  const newTab = window.open('', '_blank');
  
  if (newTab) {
    // Tela de espera na nova aba
    newTab.document.write(`
      <html>
        <head><title>Processando...</title></head>
        <body style="font-family: 'Montserrat', sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background-color:#e8e2d4; color:#3d3833;">
          <h2 style="margin-bottom: 10px;">Reservando seu presente...</h2>
          <p>Aguarde um instante, estamos gerando seu link de pagamento.</p>
        </body>
      </html>
    `);
  } else {
    alert("Seu navegador bloqueou a nova aba. Por favor, permita popups para este site.");
    return;
  }

  btn.innerText = "Reservando...";
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
      // SUCESSO: Redireciona a aba aberta
      if (newTab) {
        newTab.location.href = data.link;
      }
      btn.innerText = "Reservado!";
      loadStore(); 
    } else {
      // ERRO: Fecha a aba
      if (newTab) newTab.close();
      
      alert("Ops: " + data.message);
      btn.innerText = originalText;
      btn.disabled = false;
      loadStore();
    }
  })
  .catch(error => {
    // ERRO DE CONEXÃO
    if (newTab) newTab.close();
    
    console.error(error);
    alert("Erro de conexão.");
    btn.innerText = originalText;
    btn.disabled = false;
  });
}
loadStore();