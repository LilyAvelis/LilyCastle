const vscode = acquireVsCodeApi();

let currentSessionId = null;
let currentSessionTitle = '';
let currentSessionWho = '';
let currentSessionModel = 'unknown';
let sessions = [];
let isStreaming = false;

const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const sessionSelector = document.getElementById('sessionSelector');
const editSessionBtn = document.getElementById('editSessionBtn');
const apiKeyBtn = document.getElementById('apiKeyBtn');
const modelBtn = document.getElementById('modelBtn');

const sessionModal = document.getElementById('sessionModal');
const modalTitle = document.getElementById('modalTitle');
const modalModel = document.getElementById('modalModel');
const modalWho = document.getElementById('modalWho');
const modalDelete = document.getElementById('modalDelete');
const modalCancel = document.getElementById('modalCancel');
const modalSave = document.getElementById('modalSave');

if (typeof marked !== 'undefined') {
  marked.setOptions({ breaks: true, gfm: true });
}

function renderMarkdown(content) {
  if (typeof marked !== 'undefined') {
    return marked.parse(content);
  }
  return content.replace(/\n/g, '<br>');
}

function formatDelta(delta) {
  if (!delta) return '';
  if (delta < 1000) return delta + 'ms';
  return (delta / 1000).toFixed(1) + 's';
}

function createPageElement(page) {
  const div = document.createElement('div');
  div.className = 'page ' + (page.type === 'INVOKE' ? 'invoke' : 'response');
  div.id = 'page-' + page.pageId;
  div.dataset.content = page.content || '';

  const contentHtml = page.content ? renderMarkdown(page.content) : '';
  const isLong = (page.content || '').split('\n').length > 5 || (page.content || '').length > 300;

  div.innerHTML = `
    <div class="page-header">
      <span class="page-id">#${page.pageId}</span>
      <span class="page-who">${page.who}</span>
      <span class="page-delta">${formatDelta(page.delta)}</span>
      <button class="page-action-btn copy-btn" title="Копировать">📋</button>
      ${isLong ? '<button class="page-action-btn collapse-btn" title="Свернуть/Развернуть">▼</button>' : ''}
    </div>
    <div class="page-content-wrapper ${isLong ? 'collapsed' : 'expanded'}">
      <div class="page-content">${contentHtml}</div>
    </div>
  `;

  const copyBtn = div.querySelector('.copy-btn');
  const collapseBtn = div.querySelector('.collapse-btn');
  const wrapper = div.querySelector('.page-content-wrapper');

  copyBtn.addEventListener('click', () => {
    vscode.postMessage({ type: 'copyContent', content: div.dataset.content });
  });

  if (collapseBtn && wrapper) {
    collapseBtn.addEventListener('click', () => {
      const isCollapsed = wrapper.classList.contains('collapsed');
      wrapper.classList.toggle('collapsed', !isCollapsed);
      wrapper.classList.toggle('expanded', isCollapsed);
      collapseBtn.textContent = isCollapsed ? '▼' : '▶';
    });
  }

  return div;
}

sessionSelector.addEventListener('change', (e) => {
  const val = e.target.value;
  if (val === '__new__') {
    const title = 'Chat ' + new Date().toLocaleString('ru-RU');
    vscode.postMessage({ type: 'createSession', title });
  } else if (val) {
    vscode.postMessage({ type: 'selectSession', sessionId: val });
  }
});

editSessionBtn.addEventListener('click', () => {
  if (!currentSessionId) return;
  modalTitle.value = currentSessionTitle;
  modalModel.textContent = currentSessionModel;
  modalWho.value = currentSessionWho;
  sessionModal.classList.add('visible');
});

modalCancel.addEventListener('click', () => {
  sessionModal.classList.remove('visible');
});

modalSave.addEventListener('click', () => {
  if (currentSessionId && modalTitle.value.trim()) {
    const newWho = modalWho.value.trim() || currentSessionWho;
    vscode.postMessage({
      type: 'updateSession',
      sessionId: currentSessionId,
      title: modalTitle.value.trim(),
      who: newWho.startsWith('@') ? newWho : '@' + newWho
    });
  }
  sessionModal.classList.remove('visible');
});

modalDelete.addEventListener('click', () => {
  if (!currentSessionId) return;
  vscode.postMessage({ type: 'deleteSession', sessionId: currentSessionId });
  sessionModal.classList.remove('visible');
});

sessionModal.addEventListener('click', (e) => {
  if (e.target === sessionModal) {
    sessionModal.classList.remove('visible');
  }
});

apiKeyBtn.addEventListener('click', () => {
  vscode.postMessage({ type: 'setApiKey' });
});

modelBtn.addEventListener('click', () => {
  vscode.postMessage({ type: 'selectModel' });
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 100) + 'px';
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || isStreaming) return;
  vscode.postMessage({ type: 'sendMessage', message });
  messageInput.value = '';
  messageInput.style.height = 'auto';
}

window.addEventListener('message', (event) => {
  const data = event.data;

  switch (data.type) {
    case 'sessionsList':
      sessions = data.sessions;
      sessionSelector.innerHTML = '<option value="__new__">✨ Новый диалог...</option>';
      sessions.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.sessionId;
        opt.textContent = s.title;
        sessionSelector.appendChild(opt);
      });
      if (currentSessionId) {
        sessionSelector.value = currentSessionId;
      }
      break;

    case 'loadMessages':
      currentSessionId = data.sessionId;
      currentSessionTitle = data.sessionTitle;
      currentSessionWho = data.sessionWho || '';
      currentSessionModel = data.sessionModel || 'unknown';
      modalModel.textContent = currentSessionModel || 'unknown';
      sessionSelector.value = data.sessionId;
      messagesContainer.innerHTML = '';
      emptyState.style.display = 'none';

      data.pages.forEach(page => {
        messagesContainer.appendChild(createPageElement(page));
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      break;

    case 'sessionCreated':
      currentSessionId = data.sessionId;
      currentSessionTitle = data.title;
      break;

    case 'clearMessages':
      messagesContainer.innerHTML = '';
      emptyState.style.display = 'flex';
      currentSessionId = null;
      sessionSelector.value = '__new__';
      break;

    case 'addPage':
      emptyState.style.display = 'none';
      messagesContainer.appendChild(createPageElement(data.page));
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      break;

    case 'startResponse':
      isStreaming = true;
      sendBtn.disabled = true;
      emptyState.style.display = 'none';

      const streamingPage = document.createElement('div');
      streamingPage.className = 'page response';
      streamingPage.id = 'page-' + data.pageId;
      streamingPage.dataset.content = '';
      streamingPage.innerHTML = `
        <div class="page-header">
          <span class="page-id">#${data.pageId}</span>
          <span class="page-who">${data.who}</span>
          <span class="page-delta">⏳</span>
          <button class="page-action-btn copy-btn" title="Копировать">📋</button>
        </div>
        <div class="page-content-wrapper expanded">
          <div class="page-content"><span class="streaming-cursor"></span></div>
        </div>
      `;
      messagesContainer.appendChild(streamingPage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      break;

    case 'streamToken':
      const page = document.getElementById('page-' + data.pageId);
      if (page) {
        page.dataset.content += data.token;
        const content = page.querySelector('.page-content');
        content.innerHTML = renderMarkdown(page.dataset.content) + '<span class="streaming-cursor"></span>';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      break;

    case 'endResponse':
      isStreaming = false;
      sendBtn.disabled = false;

      const finishedPage = document.getElementById('page-' + data.pageId);
      if (finishedPage) {
        const rawContent = finishedPage.dataset.content;
        const isLong = rawContent.split('\n').length > 5 || rawContent.length > 300;

        const delta = finishedPage.querySelector('.page-delta');
        delta.textContent = formatDelta(data.delta);

        const header = finishedPage.querySelector('.page-header');
        if (isLong && !header.querySelector('.collapse-btn')) {
          const collapseBtn = document.createElement('button');
          collapseBtn.className = 'page-action-btn collapse-btn';
          collapseBtn.title = 'Свернуть/Развернуть';
          collapseBtn.textContent = '▼';
          header.appendChild(collapseBtn);

          const wrapper = finishedPage.querySelector('.page-content-wrapper');
          collapseBtn.addEventListener('click', () => {
            const isCollapsed = wrapper.classList.contains('collapsed');
            wrapper.classList.toggle('collapsed', !isCollapsed);
            wrapper.classList.toggle('expanded', isCollapsed);
            collapseBtn.textContent = isCollapsed ? '▼' : '▶';
          });
        }

        const content = finishedPage.querySelector('.page-content');
        content.innerHTML = renderMarkdown(rawContent);

        const copyBtn = finishedPage.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => {
          vscode.postMessage({ type: 'copyContent', content: rawContent });
        });
      }
      break;

    case 'error':
      isStreaming = false;
      sendBtn.disabled = false;
      alert(data.message);
      break;
  }
});

vscode.postMessage({ type: 'webviewReady' });
