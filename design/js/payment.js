document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabBtns.length && tabContents.length) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    const verifyBtn = document.querySelector('.verify-btn');
    const upiInput = document.querySelector('.upi-input input');
    
    if (verifyBtn && upiInput) {
        verifyBtn.addEventListener('click', () => {
            const upiId = upiInput.value.trim();
            const upiPattern = /^[\w.-]+@[\w.-]+$/;
            
            if (upiPattern.test(upiId)) {
                showToast('UPI ID verified successfully', 'success');
                verifyBtn.classList.add('verified');
                verifyBtn.textContent = 'Verified';
            } else {
                showToast('Invalid UPI ID format', 'error');
            }
        });
    }

    const cardInput = document.querySelector('#card input[placeholder="Card Number"]');
    cardInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19);
    });

    const expiryInput = document.querySelector('#card input[placeholder="MM/YY"]');
    expiryInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
});


const paymentOptions = {
   debit: {
      title: "Debit Card",
      desc: "Pay securely using your debit card.",
      cards: [
         { icon: "fas fa-credit-card", title: "MasterCard (All Banks)" },
         { icon: "fas fa-credit-card", title: "Visa (All Banks)" },
         { icon: "fas fa-credit-card", title: "Rupay DebitCard" }
      ]
   },
   credit: {
      title: "Credit Card",
      desc: "Pay securely using your credit card.",
      cards: [
         { icon: "fas fa-credit-card", title: "MasterCard (All Banks)" },
         { icon: "fas fa-credit-card", title: "Visa (All Banks)" },
         { icon: "fas fa-credit-card", title: "American Express" }
      ]
   },
   netbanking: {
      title: "Netbanking",
      desc: "Pay using your bank's netbanking facility.",
      cards: [
         { icon: "fas fa-university", title: "HDFC Bank" },
         { icon: "fas fa-university", title: "ICICI Bank" },
         { icon: "fas fa-university", title: "SBI" }
      ]
   },
   upi: {
      title: "UPI",
      desc: "Pay instantly using your UPI ID.",
      cards: [
         { icon: "fas fa-mobile-alt", title: "Google Pay" },
         { icon: "fas fa-mobile-alt", title: "PhonePe" },
         { icon: "fas fa-mobile-alt", title: "Paytm UPI" }
      ]
   },
   wallets: {
      title: "Wallets",
      desc: "Pay using your favorite wallet.",
      cards: [
         { icon: "fas fa-wallet", title: "Paytm Wallet" },
         { icon: "fas fa-wallet", title: "Mobikwik" }
      ]
   },
   emi: {
      title: "EMI",
      desc: "Pay in easy monthly installments.",
      cards: [
         { icon: "fas fa-money-check-alt", title: "HDFC Bank EMI" },
         { icon: "fas fa-money-check-alt", title: "ICICI Bank EMI" }
      ]
   },
   bnpl: {
      title: "BNPL",
      desc: "Buy now, pay later with supported providers.",
      cards: [
         { icon: "fas fa-hand-holding-usd", title: "Simpl" },
         { icon: "fas fa-hand-holding-usd", title: "LazyPay" }
      ]
   },
   international: {
      title: "International Payments",
      desc: "Give your customers the comfort of card payment in local currency",
      cards: [
         { icon: "fas fa-credit-card", title: "International Cards" },
         { icon: "fas fa-exchange-alt", title: "Multi Currency Conversion" },
         { icon: "fab fa-paypal", title: "PayPal" }
      ]
   }
};

// Render option cards
function renderOptionCards(method) {
   const container = document.getElementById('option-cards');
   if (!container) return;
   container.innerHTML = '';
   const cards = paymentOptions[method].cards;
   cards.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'option-card';
      const innerDiv = document.createElement('div');
      innerDiv.innerHTML = `<span class="option-title"><i class="${card.icon}"></i> ${card.title}</span>`;
      cardDiv.appendChild(innerDiv);
      // Add Pay button for every card
      const payBtn = document.createElement('button');
      payBtn.className = 'option-action pay-btn';
      payBtn.textContent = 'Pay';
      payBtn.onclick = (e) => {
         e.preventDefault();
         openPayModal(method, card.title);
      };
      cardDiv.appendChild(payBtn);
      // If there's an extra action (like Activate Now or Link PayPal)
      if (card.action) {
         const btn = document.createElement('button');
         btn.className = 'option-action';
         btn.textContent = card.action;
         btn.onclick = () => alert(`${card.action} for ${card.title}`);
         cardDiv.appendChild(btn);
      }
      container.appendChild(cardDiv);
   });
}

// Sidebar click logic
window.addEventListener('DOMContentLoaded', function() {
   const sidebarItems = document.querySelectorAll('.payment-sidebar ul li');
   if (sidebarItems.length) {
      sidebarItems.forEach(item => {
         item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const method = this.getAttribute('data-method');
            document.getElementById('method-title').textContent = paymentOptions[method].title;
            document.getElementById('section-desc').textContent = paymentOptions[method].desc;
            renderOptionCards(method);
         });
      });
      // Initial render
      renderOptionCards('international');
   }
});

// Payment modal logic
function openPayModal(method, cardTitle) {
   const modal = document.getElementById('pay-modal');
   if (!modal) return;
   modal.style.display = 'flex';
   document.getElementById('pay-modal-title').textContent = `Pay with ${cardTitle}`;
   // Show different fields based on method
   let fields = '';
   if (method === 'upi') {
      fields = `
         <label>UPI ID<br>
            <input type="text" name="upi" required style="width:100%;padding:8px;margin-top:4px;">
         </label>
      `;
   } else if (method === 'debit' || method === 'credit' || method === 'international') {
      fields = `
         <label>Card Number<br>
            <input type="text" name="card" maxlength="19" required style="width:100%;padding:8px;margin-top:4px;">
         </label><br>
         <label>Expiry<br>
            <input type="text" name="expiry" placeholder="MM/YY" maxlength="5" required style="width:100%;padding:8px;margin-top:4px;">
         </label><br>
         <label>CVV<br>
            <input type="password" name="cvv" maxlength="4" required style="width:100%;padding:8px;margin-top:4px;">
         </label>
      `;
   } else if (method === 'emi') {
      fields = `
         <label>Card Number<br>
            <input type="text" name="emi_card" maxlength="19" required style="width:100%;padding:8px;margin-top:4px;">
         </label><br>
         <label>Tenure<br>
            <select name="tenure" required style="width:100%;padding:8px;margin-top:4px;">
               <option value="">Select Tenure</option>
               <option value="3">3 Months</option>
               <option value="6">6 Months</option>
               <option value="9">9 Months</option>
               <option value="12">12 Months</option>
            </select>
         </label><br>
         <label>CVV<br>
            <input type="password" name="emi_cvv" maxlength="4" required style="width:100%;padding:8px;margin-top:4px;">
         </label>
      `;
   } else {
      fields = `
         <label>Account/Wallet ID<br>
            <input type="text" name="wallet" required style="width:100%;padding:8px;margin-top:4px;">
         </label>
      `;
   }
   document.getElementById('pay-form-fields').innerHTML = fields;
}

// Close modal logic
if (document.getElementById('close-modal')) {
   document.getElementById('close-modal').onclick = function() {
      document.getElementById('pay-modal').style.display = 'none';
   };
}
if (document.getElementById('pay-modal')) {
   document.getElementById('pay-modal').onclick = function(e) {
      if (e.target === this) this.style.display = 'none';
   };
}
if (document.getElementById('pay-form')) {
   document.getElementById('pay-form').onsubmit = function(e) {
      e.preventDefault();
      document.getElementById('pay-modal').style.display = 'none';
      showToast('Payment Successful!', 'success');
   };
}

// --- Toast notification function ---
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}