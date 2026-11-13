document.addEventListener('DOMContentLoaded', initializeBillingPage);

function initializeBillingPage() {
  const options = Array.from(document.querySelectorAll('.method-option'));
  const label = document.getElementById('method-guidance-label');
  const title = document.getElementById('method-guidance-title');
  const copy = document.getElementById('method-guidance-copy');
  const loading = document.getElementById('billing-loading');
  const errorPanel = document.getElementById('billing-error');
  const errorMessage = document.getElementById('billing-error-message');
  const content = document.getElementById('billing-content');
  const retryButton = document.getElementById('billing-retry');
  const pageSize = 10;
  const state = { transactions: [], page: 1 };
  const guidance = {
    upi: {
      label: 'BEST FOR MOST ONE-TIME PAYMENTS IN INDIA',
      title: 'UPI is the simplest starting point',
      copy: 'It is quick and familiar for many students. Use a provider’s secure checkout when payments are enabled.'
    },
    card: {
      label: 'BEST FOR RECURRING OR INTERNATIONAL PAYMENTS',
      title: 'A card may suit recurring payments',
      copy: 'Choose a credit or debit card if you need international support or recurring billing, when offered by the payment provider.'
    },
    netbanking: {
      label: 'A DIRECT BANK PAYMENT OPTION',
      title: 'Net banking is a useful alternative',
      copy: 'Use it if you prefer to approve a payment through your bank instead of a UPI app or card.'
    },
    wallet: {
      label: 'CONVENIENT IF YOUR WALLET IS SUPPORTED',
      title: 'A wallet can be quick for small payments',
      copy: 'Wallet support depends on the provider. Check fees, limits, and refund rules before using one.'
    }
  };

  if (options.length === 0 || !label || !title || !copy || !loading || !errorPanel || !content) {
    console.error('Billing page is missing required elements.');
    return;
  }

  function selectMethod(option) {
    const selectedGuidance = guidance[option.dataset.method];
    if (!selectedGuidance) {
      console.error(`Unsupported billing method: ${option.dataset.method || 'unknown'}`);
      return;
    }

    options.forEach(item => {
      const selected = item === option;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });

    label.textContent = selectedGuidance.label;
    title.textContent = selectedGuidance.title;
    copy.textContent = selectedGuidance.copy;
  }

  options.forEach(option => {
    option.addEventListener('click', () => selectMethod(option));
  });
  const initialOption = options.find(option => option.getAttribute('aria-pressed') === 'true') || options[0];
  selectMethod(initialOption);

  retryButton.addEventListener('click', loadBilling);
  [
    'transaction-search',
    'transaction-status',
    'transaction-date-from',
    'transaction-date-to',
    'transaction-sort'
  ].forEach(id => {
    const control = document.getElementById(id);
    if (control) {
      control.addEventListener(id === 'transaction-search' ? 'input' : 'change', () => {
        state.page = 1;
        renderTransactions();
      });
    }
  });

  document.getElementById('transaction-prev').addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    renderTransactions();
  });
  document.getElementById('transaction-next').addEventListener('click', () => {
    state.page += 1;
    renderTransactions();
  });

  loadBilling();

  async function loadBilling() {
    loading.hidden = false;
    errorPanel.hidden = true;
    content.hidden = true;

    const token = localStorage.getItem('token');
    if (!token) {
      showError('Sign in to view billing information.', true);
      return;
    }

    try {
      const response = await fetch('/api/students/billing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        throw new Error(response.status === 404
          ? 'The billing API route was not found. Restart the Node app and try again.'
          : `The billing API returned an unexpected response (${response.status}).`);
      }

      const result = await response.json();
      if (!response.ok || result.success !== true || !result.data) {
        throw new Error(result.message || 'Unable to load billing information.');
      }
      validateBillingData(result.data);

      loading.hidden = true;
      content.hidden = false;
      renderBilling(result.data);
    } catch (error) {
      console.error('Unable to load student billing:', error);
      showError(error.message || 'Unable to load billing information. Please try again.');
    }
  }

  function validateBillingData(data) {
    if (!data.billingProfile || !data.summary ||
        !Array.isArray(data.registeredCourses) ||
        !Array.isArray(data.feeBreakdown) ||
        !Array.isArray(data.transactions) ||
        !Array.isArray(data.invoices) ||
        !Array.isArray(data.installments)) {
      throw new Error('The billing service returned incomplete data. Please try again later.');
    }
  }

  function showError(message, includeLoginLink = false) {
    loading.hidden = true;
    content.hidden = true;
    errorPanel.hidden = false;
    errorMessage.replaceChildren(document.createTextNode(message));

    if (includeLoginLink) {
      const link = document.createElement('a');
      link.href = '/student/html/login.html';
      link.textContent = ' Sign in';
      errorMessage.appendChild(link);
    }
  }

  function renderBilling(data) {
    const profile = data.billingProfile;
    const summary = data.summary;
    document.getElementById('billing-student-id').textContent = profile.studentId || 'Not assigned';
    document.getElementById('billing-student-name').textContent = profile.name || 'Not available';
    document.getElementById('billing-student-email').textContent = profile.email || 'Not available';
    document.getElementById('summary-total-fees').textContent = formatMoney(summary.totalFees, summary.totalFeesCurrency);
    document.getElementById('summary-amount-paid').textContent = formatMoney(
      summary.amountPaid,
      summary.amountPaidCurrency
    );
    document.getElementById('summary-outstanding').textContent = formatMoney(
      summary.outstandingBalance,
      summary.outstandingBalanceCurrency
    );
    document.getElementById('summary-next-due').textContent = formatDate(summary.nextPaymentDue) || 'Not scheduled';

    const paymentNotice = document.getElementById('billing-payment-notice');
    const statusTitle = document.getElementById('billing-status-title');
    const statusCopy = document.getElementById('billing-status-copy');
    const paymentAvailable = data.paymentProviderConfigured === true;
    statusTitle.textContent = paymentAvailable ? 'Provider available' : 'Online payments unavailable';
    statusCopy.textContent = paymentAvailable
      ? 'Use the provider’s secure checkout to make a payment.'
      : 'No charges can be made from this portal.';
    paymentNotice.hidden = paymentAvailable;
    paymentNotice.textContent = paymentAvailable
      ? ''
      : data.paymentUnavailableMessage ||
        'Online payment is currently unavailable. Please contact the administrator for assistance.';

    renderRegisteredCourses(data.registeredCourses);
    renderFeeBreakdown(data.feeBreakdown);
    renderRecordList(data.invoices, 'invoice-list', 'invoice-empty', 'No invoices are available.');
    renderRecordList(data.installments, 'installment-list', 'installment-empty', 'No installment schedule is available.');
    state.transactions = data.transactions;
    state.page = 1;
    renderTransactions();
  }

  function renderRegisteredCourses(courses) {
    const list = document.getElementById('billing-registered-courses');
    list.replaceChildren();
    if (courses.length === 0) {
      appendTextItem(list, 'No course enrollments are recorded.', 'muted-text');
      return;
    }
    courses.forEach(course => appendTextItem(list, course.title || 'Course enrollment'));
  }

  function renderFeeBreakdown(fees) {
    const empty = document.getElementById('fee-breakdown-empty');
    const tableWrap = document.getElementById('fee-breakdown-table-wrap');
    const body = document.getElementById('fee-breakdown-body');
    body.replaceChildren();
    empty.hidden = fees.length > 0;
    tableWrap.hidden = fees.length === 0;

    fees.forEach(fee => {
      const row = document.createElement('tr');
      appendCell(row, fee.description || fee.category || 'Fee');
      appendCell(row, fee.courseTitle || '—');
      appendCell(row, formatMoney(fee.amount, fee.currency));
      appendStatusCell(row, fee.status || 'unpaid');
      body.appendChild(row);
    });
  }

  function renderRecordList(records, listId, emptyId, emptyMessage) {
    const list = document.getElementById(listId);
    const empty = document.getElementById(emptyId);
    list.replaceChildren();
    empty.hidden = records.length > 0;
    list.hidden = records.length === 0;
    if (records.length === 0) return;

    records.forEach(record => {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = record.invoiceNumber || record.title || record.description || 'Billing record';
      item.appendChild(name);
      const metadata = document.createElement('span');
      metadata.textContent = ` — ${formatDate(record.createdAt || record.issuedAt) || emptyMessage}`;
      item.appendChild(metadata);
      list.appendChild(item);
    });
  }

  function renderTransactions() {
    const rows = getFilteredTransactions();
    const body = document.getElementById('transaction-table-body');
    const empty = document.getElementById('transaction-empty');
    const tableWrap = document.getElementById('transaction-table-wrap');
    const pagination = document.getElementById('transaction-pagination');
    const pageLabel = document.getElementById('transaction-page-label');
    const previous = document.getElementById('transaction-prev');
    const next = document.getElementById('transaction-next');

    body.replaceChildren();
    if (rows.length === 0) {
      empty.hidden = false;
      empty.querySelector('p').textContent = state.transactions.length === 0
        ? 'No payment transactions are recorded for this account.'
        : 'No transactions match these filters.';
      tableWrap.hidden = true;
      pagination.hidden = true;
      return;
    }

    const pageCount = Math.ceil(rows.length / pageSize);
    state.page = Math.min(state.page, pageCount);
    const start = (state.page - 1) * pageSize;
    rows.slice(start, start + pageSize).forEach(transaction => {
      const row = document.createElement('tr');
      appendCell(row, formatDate(transaction.createdAt) || 'Date unavailable');
      appendCell(row, transaction.transactionId || 'Not provided');
      appendCell(row, transaction.description || 'Payment');
      appendCell(row, transaction.paymentMethod || 'Not provided');
      appendCell(row, formatMoney(transaction.amount, transaction.currency));
      appendStatusCell(row, transaction.status || 'unknown');

      const actionCell = document.createElement('td');
      const detailButton = document.createElement('button');
      detailButton.type = 'button';
      detailButton.className = 'transaction-details-button';
      detailButton.textContent = 'Details';
      detailButton.setAttribute('aria-expanded', 'false');
      actionCell.appendChild(detailButton);
      row.appendChild(actionCell);
      body.appendChild(row);

      const detailsRow = document.createElement('tr');
      detailsRow.className = 'transaction-details-row';
      detailsRow.hidden = true;
      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 7;
      detailsCell.textContent = [
        `Transaction ID: ${transaction.transactionId || 'Not provided'}`,
        `Status: ${transaction.status || 'Unknown'}`,
        `Recorded date: ${formatDate(transaction.createdAt) || 'Not available'}`
      ].join(' · ');
      detailsRow.appendChild(detailsCell);
      body.appendChild(detailsRow);
      detailButton.addEventListener('click', () => {
        detailsRow.hidden = !detailsRow.hidden;
        detailButton.setAttribute('aria-expanded', String(!detailsRow.hidden));
      });
    });

    empty.hidden = true;
    tableWrap.hidden = false;
    pagination.hidden = rows.length <= pageSize;
    pageLabel.textContent = `Page ${state.page} of ${pageCount} · ${rows.length} transactions`;
    previous.disabled = state.page <= 1;
    next.disabled = state.page >= pageCount;
  }

  function getFilteredTransactions() {
    const query = document.getElementById('transaction-search').value.trim().toLowerCase();
    const status = document.getElementById('transaction-status').value;
    const dateFrom = document.getElementById('transaction-date-from').value;
    const dateTo = document.getElementById('transaction-date-to').value;
    const sort = document.getElementById('transaction-sort').value;

    return state.transactions
      .filter(transaction => {
        const searchable = [
          transaction.transactionId,
          transaction.description,
          transaction.paymentMethod
        ].join(' ').toLowerCase();
        if (query && !searchable.includes(query)) return false;
        if (status !== 'all' && String(transaction.status).toLowerCase() !== status) return false;

        const transactionDate = transaction.createdAt ? new Date(transaction.createdAt) : null;
        if (dateFrom && (!transactionDate || Number.isNaN(transactionDate.getTime()) ||
            transactionDate < new Date(`${dateFrom}T00:00:00`))) return false;
        if (dateTo && (!transactionDate || Number.isNaN(transactionDate.getTime()) ||
            transactionDate > new Date(`${dateTo}T23:59:59.999`))) return false;
        return true;
      })
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt || 0).getTime() || 0;
        const rightTime = new Date(right.createdAt || 0).getTime() || 0;
        return sort === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
      });
  }

  function formatMoney(amount, currency) {
    if (amount === null || amount === undefined || !Number.isFinite(Number(amount)) || !currency) {
      return 'Not available';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: String(currency).toUpperCase()
    }).format(Number(amount));
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function appendCell(row, value) {
    const cell = document.createElement('td');
    cell.textContent = value === null || value === undefined ? '—' : String(value);
    row.appendChild(cell);
  }

  function appendStatusCell(row, status) {
    const cell = document.createElement('td');
    const badge = document.createElement('span');
    const normalizedStatus = String(status).toLowerCase();
    badge.className = `billing-status-badge ${/^[a-z_-]+$/.test(normalizedStatus) ? normalizedStatus : ''}`;
    badge.textContent = String(status);
    cell.appendChild(badge);
    row.appendChild(cell);
  }

  function appendTextItem(list, text, className = '') {
    const item = document.createElement('li');
    item.textContent = text;
    if (className) item.className = className;
    list.appendChild(item);
  }
}
