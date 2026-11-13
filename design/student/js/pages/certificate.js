document.addEventListener('DOMContentLoaded', loadCertificates);

async function loadCertificates() {
  const grid = document.getElementById('certificates-grid');
  const message = document.getElementById('certificate-message');
  const token = localStorage.getItem('token');
  grid.replaceChildren();

  if (!token) {
    message.textContent = 'Sign in to view your course certificates.';
    return;
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };
    const [courseResult, certificateResult] = await Promise.all([
      fetchStudentJson('/api/students/courses', { headers }),
      fetchStudentJson('/api/students/certificates', { headers })
    ]);
    const summary = renderCertificates(
      Array.isArray(courseResult.data) ? courseResult.data : [],
      Array.isArray(courseResult.enrollments) ? courseResult.enrollments : [],
      Array.isArray(certificateResult.data) ? certificateResult.data : [],
      grid
    );
    grid.hidden = summary.completedCount === 0;
    message.textContent = summary.completedCount === 0
      ? 'No completed courses are eligible for a certificate yet.'
      : summary.issuedCount === 0
        ? 'Completed courses are eligible; issue a certificate when you are ready.'
        : 'Only certificates issued for your completed courses are listed here.';
  } catch (error) {
    console.error('Unable to load certificates:', error);
    message.textContent = error.message || 'Unable to load certificates. Please try again later.';
  }

  initializeCertificateActions();
}

async function fetchStudentJson(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('The Student API returned an unexpected response. Restart the Flask app and try again.');
  }
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    throw new Error(result.message || 'Unable to load certificate data.');
  }
  return result;
}

function renderCertificates(courses, enrollments, issuedCertificates, grid) {
  const enrollmentByCourse = new Map(
    enrollments.map(enrollment => [Number(enrollment.course_id), enrollment])
  );
  const certificateByCourse = new Map(
    issuedCertificates.map(certificate => [Number(certificate.course_id), certificate])
  );
  let completedCount = 0;

  courses.forEach(course => {
    const enrollment = enrollmentByCourse.get(Number(course.id));
    const progress = enrollment
      ? Math.min(100, Math.max(0, Number(enrollment.progress) || 0))
      : 0;
    const completed = Boolean(enrollment) &&
      (enrollment.status === 'completed' || progress >= 100);
    if (!completed) return;
    completedCount++;

    const certificate = certificateByCourse.get(Number(course.id));
    const card = document.createElement('article');
    card.className = 'certificate-card';

    const header = document.createElement('div');
    header.className = 'certificate-header';
    const title = document.createElement('h3');
    title.className = 'certificate-title';
    title.textContent = course.title || 'Untitled course';
    const issuer = document.createElement('p');
    issuer.className = 'certificate-issuer';
    issuer.textContent = 'Online Education Platform';
    header.append(title, issuer);

    const body = document.createElement('div');
    body.className = 'certificate-body';
    const info = document.createElement('div');
    info.className = 'certificate-info';
    info.append(
      createCertificateInfo('Course progress', `${progress}%`),
      createCertificateInfo(
        certificate ? 'Certificate ID' : 'Certificate status',
        certificate ? certificate.certificate_id : 'Not issued'
      )
    );

    const actions = document.createElement('div');
    actions.className = 'certificate-actions';
    if (certificate) {
      actions.append(
        createCertificateButton('View Certificate', 'view-btn', course.id),
        createCertificateButton('Download SVG', 'download-btn', course.id),
        createCertificateButton('Print / Save as PDF', 'print-btn', course.id)
      );
    } else {
      actions.append(createCertificateButton('Issue Certificate', 'issue-btn', course.id));
    }
    body.append(info, actions);
    card.append(header, body);
    grid.appendChild(card);
  });

  return {
    completedCount,
    issuedCount: certificateByCourse.size
  };
}

function createCertificateButton(label, action, courseId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `certificate-btn ${action}`;
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.courseId = String(courseId);
  return button;
}

function createCertificateInfo(labelText, valueText) {
  const item = document.createElement('div');
  item.className = 'info-item';
  const label = document.createElement('span');
  label.className = 'info-label';
  label.textContent = labelText;
  const value = document.createElement('span');
  value.className = 'info-value';
  value.textContent = valueText;
  item.append(label, value);
  return item;
}

function initializeCertificateActions() {
  const preview = document.getElementById('certificate-preview');
  const documentContainer = document.getElementById('certificate-preview-document');
  const closeButton = preview.querySelector('.preview-close');
  const downloadButton = document.getElementById('certificate-preview-download');
  const printButton = document.getElementById('certificate-preview-print');
  const grid = document.getElementById('certificates-grid');
  let selectedCertificate = null;

  grid.addEventListener('click', async event => {
    const button = event.target instanceof Element
      ? event.target.closest('button[data-action]')
      : null;
    if (!button) return;
    button.disabled = true;
    selectedCertificate = null;
    try {
      const action = button.dataset.action;
      selectedCertificate = action === 'issue-btn'
        ? await requestCertificate(button.dataset.courseId)
        : await getIssuedCertificate(button.dataset.courseId);
      if (action === 'download-btn') {
        downloadCertificate(selectedCertificate);
      } else {
        renderCertificatePreview(documentContainer, selectedCertificate);
        preview.classList.add('active');
        preview.setAttribute('aria-hidden', 'false');
        closeButton.focus();
        if (action === 'print-btn') window.setTimeout(() => window.print(), 0);
        if (action === 'issue-btn') {
          const infoValues = button.closest('.certificate-card').querySelectorAll('.info-value');
          if (infoValues[1]) infoValues[1].textContent = selectedCertificate.certificateId;
          const actions = button.parentElement;
          actions.replaceChildren(
            createCertificateButton('View Certificate', 'view-btn', selectedCertificate.courseId),
            createCertificateButton('Download SVG', 'download-btn', selectedCertificate.courseId),
            createCertificateButton('Print / Save as PDF', 'print-btn', selectedCertificate.courseId)
          );
          document.getElementById('certificate-message').textContent =
            'Certificate issued and saved to your account.';
        }
      }
    } catch (error) {
      console.error('Unable to access course certificate:', error);
      document.getElementById('certificate-message').textContent =
        error.message || 'Unable to access the certificate. Please try again.';
    } finally {
      button.disabled = false;
    }
  });

  function closePreview() {
    preview.classList.remove('active');
    preview.setAttribute('aria-hidden', 'true');
  }

  closeButton.addEventListener('click', closePreview);
  preview.addEventListener('click', event => {
    if (event.target === preview) closePreview();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && preview.classList.contains('active')) closePreview();
  });
  downloadButton.addEventListener('click', () => {
    if (selectedCertificate) downloadCertificate(selectedCertificate);
  });
  printButton.addEventListener('click', () => {
    if (selectedCertificate) window.print();
  });
}

async function requestCertificate(courseId) {
  const token = localStorage.getItem('token');
  const result = await fetchStudentJson('/api/students/certificates', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ courseId: Number(courseId) })
  });
  return normalizeCertificate(result.data);
}

async function getIssuedCertificate(courseId) {
  const token = localStorage.getItem('token');
  const result = await fetchStudentJson(`/api/students/certificate/${encodeURIComponent(courseId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return normalizeCertificate(result.data);
}

function normalizeCertificate(certificate) {
  return {
    courseId: certificate.course_id,
    courseTitle: certificate.course_title,
    studentName: certificate.student_name,
    certificateId: certificate.certificate_id,
    issuedAt: certificate.issued_at
  };
}

function renderCertificatePreview(container, certificate) {
  container.replaceChildren();
  const heading = document.createElement('h2');
  heading.id = 'certificate-preview-title';
  heading.textContent = 'Certificate of Completion';
  const copy = document.createElement('p');
  copy.textContent = 'This certifies that';
  const name = document.createElement('h3');
  name.textContent = certificate.studentName;
  const completed = document.createElement('p');
  completed.textContent = 'has successfully completed';
  const course = document.createElement('h4');
  course.textContent = certificate.courseTitle;
  const id = document.createElement('p');
  id.className = 'certificate-id';
  id.textContent = `Certificate ID: ${certificate.certificateId}`;
  const issued = document.createElement('p');
  issued.className = 'certificate-id';
  issued.textContent = `Issued ${new Date(certificate.issuedAt).toLocaleDateString()}`;
  container.append(heading, copy, name, completed, course, id, issued);
}

function downloadCertificate(certificate) {
  const issueDate = new Date(certificate.issuedAt).toLocaleDateString();
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">',
    '<rect width="1200" height="800" fill="#f8fafc"/>',
    '<rect x="36" y="36" width="1128" height="728" rx="24" fill="#fff" stroke="#6d4aff" stroke-width="8"/>',
    '<rect x="58" y="58" width="1084" height="684" rx="16" fill="none" stroke="#c4b5fd" stroke-width="2"/>',
    '<text x="600" y="200" text-anchor="middle" font-family="Georgia,serif" font-size="54" fill="#312e81">Certificate of Completion</text>',
    '<text x="600" y="300" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" fill="#475569">This certifies that</text>',
    `<text x="600" y="390" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#111827">${escapeCertificateText(certificate.studentName)}</text>`,
    '<text x="600" y="465" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" fill="#475569">has successfully completed</text>',
    `<text x="600" y="535" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="#6d4aff">${escapeCertificateText(certificate.courseTitle)}</text>`,
    `<text x="600" y="620" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#64748b">Certificate ID: ${escapeCertificateText(certificate.certificateId)}</text>`,
    `<text x="600" y="660" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#64748b">Issued ${escapeCertificateText(issueDate)}</text>`,
    '</svg>'
  ].join('');
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `certificate-${certificate.courseId}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCertificateText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
