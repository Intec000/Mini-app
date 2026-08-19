/* PawColor V1.1 — Telegram Mini App */
const tg = window.Telegram?.WebApp;

// URL corrigée et configurée pour ton webhook Ngrok
const N8N_WEBHOOK_URL = 'https://attach-unsoiled-elephant.ngrok-free.dev/webhook-test/pawcolor/order';
const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const form = document.getElementById('bookForm');
const formView = document.getElementById('formView');
const loaderView = document.getElementById('loaderView');
const catNameInput = document.getElementById('catName');
const photoInput = document.getElementById('photos');
const uploadZone = document.getElementById('uploadZone');
const previewGrid = document.getElementById('previewGrid');
const photoCount = document.getElementById('photoCount');
const errorMessage = document.getElementById('errorMessage');
const submitBtn = document.getElementById('submitBtn');

let selectedFiles = [];

function initTelegram() {
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#fff8f5');
    tg.setBackgroundColor?.('#fff8f5');
}

function setError(message = '') {
    errorMessage.textContent = message;
}

function renderPreviews() {
    previewGrid.replaceChildren();
    photoCount.textContent = `${selectedFiles.length} / ${MAX_PHOTOS}`;

    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        const image = document.createElement('img');
        image.alt = `Selected cat photo ${index + 1}`;
        image.src = URL.createObjectURL(file);
        image.onload = () => URL.revokeObjectURL(image.src);
        const number = document.createElement('span');
        number.className = 'preview-number';
        number.textContent = String(index + 1);
        item.append(image, number);
        previewGrid.append(item);
    });
}

function validateFiles(files) {
    if (files.length !== MAX_PHOTOS) return 'Please select exactly 3 photos.';
    for (const file of files) {
        if (!ALLOWED_TYPES.has(file.type)) return 'Use JPG, PNG or WEBP images only.';
        if (file.size > MAX_FILE_SIZE) return 'Each photo must be 10 MB or smaller.';
    }
    return '';
}

function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    const validationError = validateFiles(files);
    if (validationError) {
        selectedFiles = [];
        photoInput.value = '';
        renderPreviews();
        setError(validationError);
        return;
    }
    selectedFiles = files;
    setError('');
    renderPreviews();
}

photoInput.addEventListener('change', () => handleFiles(photoInput.files));

['dragenter', 'dragover'].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.add('dragging');
    });
});

['dragleave', 'drop'].forEach((eventName) => {
    uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.remove('dragging');
    });
});

uploadZone.addEventListener('drop', (event) => handleFiles(event.dataTransfer.files));

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
    });
}

function getTelegramUserId() {
    return tg?.initDataUnsafe?.user?.id ?? null;
}

function showLoader() {
    formView.classList.add('hidden');
    loaderView.classList.remove('hidden');
}

function resetAfterError() {
    formView.classList.remove('hidden');
    loaderView.classList.add('hidden');
    submitBtn.disabled = false;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');

    const catName = catNameInput.value.trim();
    if (!catName) {
        setError("Please enter your cat's name.");
        catNameInput.focus();
        return;
    }

    const filesError = validateFiles(selectedFiles);
    if (filesError) {
        setError(filesError);
        return;
    }

    submitBtn.disabled = true;
    showLoader();

    try {
        const images = await Promise.all(selectedFiles.map(fileToBase64));
        const payload = {
            telegram_user_id: getTelegramUserId(),
            telegram_init_data: tg?.initData || null,
            cat_name: catName,
            images
        };

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook returned HTTP ${response.status}`);
        }

        if (tg) {
            setTimeout(() => tg.close(), 1800);
        }
    } catch (error) {
        console.error('PawColor submission failed:', error);
        resetAfterError();
        setError('Something went wrong while sending your photos. Please try again.');
    }
});

initTelegram();
