const checkoutMethods = {
  upi: {
    title: 'Pay with UPI',
    mark: 'UPI',
    description: 'In a live checkout, your payment provider would securely open your UPI app.'
  },
  card: {
    title: 'Pay by card',
    mark: 'CARD',
    description: 'In a live checkout, card details would be entered only on your payment provider’s secure page.'
  },
  netbanking: {
    title: 'Pay with net banking',
    mark: 'BANK',
    description: 'In a live checkout, your payment provider would redirect you to your selected bank.'
  },
  wallet: {
    title: 'Pay with a wallet',
    mark: 'PAY',
    description: 'In a live checkout, your payment provider would securely connect to a supported wallet.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const methodOptions = document.querySelectorAll('.method-option');
  const methodDetails = document.getElementById('method-details');
  const continueButton = document.getElementById('continue-button');
  const checkoutMessage = document.getElementById('checkout-message');
  const courseName = document.getElementById('order-course');
  const subtotal = document.getElementById('order-subtotal');
  const total = document.getElementById('order-total');

  const query = new URLSearchParams(window.location.search);
  const course = query.get('course');
  const priceText = query.get('price');
  const price = Number(priceText);
  if (course && course.trim()) {
    courseName.textContent = course.trim().slice(0, 80);
  }

  const displayPrice = priceText && priceText.trim() !== '' && Number.isFinite(price) && price >= 0 && price <= 10000000
    ? price
    : 2999;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayPrice);
  subtotal.textContent = formattedPrice;
  total.textContent = formattedPrice;

  methodOptions.forEach(option => {
    option.addEventListener('click', () => {
      const method = checkoutMethods[option.dataset.method];
      if (!method) return;

      methodOptions.forEach(item => {
        const selected = item === option;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      methodDetails.querySelector('strong').textContent = method.title;
      methodDetails.querySelector('p').textContent = method.description;
      methodDetails.querySelector('.details-icon').textContent = method.mark;
      checkoutMessage.hidden = true;
      checkoutMessage.textContent = '';
    });
  });

  continueButton.addEventListener('click', () => {
    checkoutMessage.textContent = 'Demo only: no payment was made. Connect a payment provider to accept real payments.';
    checkoutMessage.hidden = false;
  });
});
