// Configuration
function getWebhookConfig() {
    // Try to get from localStorage (admin panel config)
    const adminConfig = localStorage.getItem('presupuestoya_webhook_config');
    if (adminConfig) {
        try {
            const config = JSON.parse(adminConfig);
            return config.webhookUrl;
        } catch (e) {
            console.warn('Invalid admin config in localStorage');
        }
    }

    // Fallback to environment variable or default
    return process.env.WEBHOOK_URL || 'https://your-webhook-url.com/leads';
}

const CONFIG = {
    get WEBHOOK_URL() {
        return getWebhookConfig();
    },
    TIMEOUT: 30000, // 30 seconds
};

// Form elements
const form = document.getElementById('leadForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const confirmEmail = document.getElementById('confirmEmail');
const newFormBtn = document.getElementById('newFormBtn');

// Field elements
const fields = {
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    postalCode: document.getElementById('postalCode'),
    closureType: document.getElementById('closureType'),
    message: document.getElementById('message'),
    consent: document.getElementById('consent'),
};

// Spanish postal codes validation (basic validation - can be extended)
const VALID_POSTAL_CODES = {
    '28': 'Madrid',
    '08': 'Barcelona',
    '41': 'Sevilla',
    '46': 'Valencia',
    '29': 'Málaga',
    '39': 'Cantabria',
    '48': 'Vizcaya',
    '20': 'Guipúzcoa',
    '01': 'Álava',
    '06': 'Badajoz',
    '10': 'Cáceres',
    '14': 'Córdoba',
    '18': 'Granada',
    '23': 'Jaén',
    '04': 'Almería',
    '11': 'Cádiz',
    '12': 'Castellón',
    '03': 'Alicante',
    '07': 'Islas Baleares',
    '30': 'Murcia',
    '37': 'Salamanca',
    '40': 'Segovia',
    '42': 'Soria',
    '45': 'Toledo',
    '47': 'Valladolid',
    '49': 'Zamora',
    '34': 'Palencia',
    '32': 'Pontevedra',
    '36': 'Ourense',
    '15': 'A Coruña',
    '27': 'Lugo',
    '31': 'Navarra',
    '22': 'Huesca',
    '44': 'Teruel',
    '50': 'Zaragoza',
    '16': 'Cuenca',
    '19': 'Guadalajara',
    '02': 'Albacete',
    '05': 'Ávila',
    '24': 'León',
    '09': 'Burgos',
    '17': 'Girona',
    '43': 'Tarragona',
    '25': 'Lleida',
    '38': 'Santa Cruz de Tenerife',
    '35': 'Las Palmas',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show form on load with slight delay for better UX
    setTimeout(() => {
        form.classList.add('active');
    }, 200);

    form.addEventListener('submit', handleSubmit);
    newFormBtn.addEventListener('click', resetForm);

    // Real-time validation
    fields.email.addEventListener('blur', validateEmail);
    fields.phone.addEventListener('blur', validatePhone);
    fields.postalCode.addEventListener('blur', validatePostalCode);
    fields.name.addEventListener('blur', validateName);
    fields.closureType.addEventListener('change', validateClosureType);
});

/**
 * Validation Functions
 */

function validateName(field = fields.name) {
    const value = field.value.trim();
    const error = document.getElementById('nameError');

    if (!value) {
        showError(field, error, 'El nombre es obligatorio');
        return false;
    }

    if (value.length < 3) {
        showError(field, error, 'El nombre debe tener al menos 3 caracteres');
        return false;
    }

    if (!/^[a-záéíóúñ\s'-]+$/i.test(value)) {
        showError(field, error, 'El nombre contiene caracteres inválidos');
        return false;
    }

    clearError(field, error);
    return true;
}

function validatePhone(field = fields.phone) {
    const value = field.value.trim();
    const error = document.getElementById('phoneError');

    if (!value) {
        showError(field, error, 'El teléfono es obligatorio');
        return false;
    }

    // Spanish phone validation: +34, 034, 34, or 9 followed by 8-9 digits
    const phoneRegex = /^(\+34|0034|34|0)?[689]\d{8,9}$/;
    if (!phoneRegex.test(value.replace(/[\s\-()]/g, ''))) {
        showError(field, error, 'Teléfono no válido');
        return false;
    }

    clearError(field, error);
    return true;
}

function validateEmail(field = fields.email) {
    const value = field.value.trim();
    const error = document.getElementById('emailError');

    if (!value) {
        showError(field, error, 'El email es obligatorio');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showError(field, error, 'Email no válido');
        return false;
    }

    clearError(field, error);
    return true;
}

function validatePostalCode(field = fields.postalCode) {
    const value = field.value.trim();
    const error = document.getElementById('postalCodeError');

    if (!value) {
        showError(field, error, 'El código postal es obligatorio');
        return false;
    }

    if (!/^\d{5}$/.test(value)) {
        showError(field, error, 'Código postal debe tener 5 dígitos');
        return false;
    }

    const prefix = value.substring(0, 2);
    if (!VALID_POSTAL_CODES[prefix]) {
        showError(field, error, 'Código postal no válido para España');
        return false;
    }

    clearError(field, error);
    return true;
}

function validateClosureType(field = fields.closureType) {
    const error = document.getElementById('closureTypeError');

    if (!field.value) {
        showError(field, error, 'Selecciona un tipo de cerramiento');
        return false;
    }

    clearError(field, error);
    return true;
}

function validateConsent(field = fields.consent) {
    const error = document.getElementById('consentError');

    if (!field.checked) {
        showError(field, error, 'Debes aceptar para continuar');
        return false;
    }

    clearError(field, error);
    return true;
}

function showError(field, errorElement, message) {
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearError(field, errorElement) {
    field.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

/**
 * Form Submission
 */

async function handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid =
        validateName() &&
        validatePhone() &&
        validateEmail() &&
        validatePostalCode() &&
        validateClosureType() &&
        validateConsent();

    if (!isValid) {
        scrollToFirstError();
        return;
    }

    // Prepare data
    const leadData = {
        timestamp: new Date().toISOString(),
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim().replace(/[\s\-()]/g, ''),
        email: fields.email.value.trim(),
        postalCode: fields.postalCode.value.trim(),
        region: VALID_POSTAL_CODES[fields.postalCode.value.substring(0, 2)],
        closureType: fields.closureType.value,
        message: fields.message.value.trim(),
        source: 'presupuestoya-web',
        userAgent: navigator.userAgent,
    };

    // Send to webhook
    await sendToWebhook(leadData);
}

async function sendToWebhook(data) {
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Success - show success message
        showSuccessMessage(data.email);

    } catch (error) {
        console.error('Error sending lead:', error);

        // Show error message (still show success locally but log the error)
        // This is a fallback - in production you'd want proper error handling
        if (error.name === 'AbortError') {
            alert('La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.');
        } else {
            // Even if webhook fails, we can still show success to the user
            // and queue the data locally for retry
            console.warn('Webhook failed, but form submitted locally');
            showSuccessMessage(data.email);
            localStorage.setItem(`lead_${Date.now()}`, JSON.stringify(data));
        }

    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
}

function showSuccessMessage(email) {
    confirmEmail.textContent = email;
    form.classList.remove('active');
    successMessage.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    form.reset();
    form.classList.add('active');
    successMessage.classList.add('hidden');

    // Clear all errors
    Object.values(fields).forEach((field) => {
        const errorId = field.id + 'Error';
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            clearError(field, errorElement);
        }
    });

    submitBtn.disabled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToFirstError() {
    const firstError = document.querySelector('.error');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
    }
}

/**
 * Retry logic for failed webhook calls (optional enhancement)
 */

function retryFailedLeads() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('lead_'));

    if (keys.length === 0) return;

    keys.forEach((key) => {
        const data = JSON.parse(localStorage.getItem(key));
        sendToWebhook(data).then(() => {
            localStorage.removeItem(key);
        });
    });
}

// Retry failed leads on page load
window.addEventListener('load', () => {
    setTimeout(retryFailedLeads, 2000);
});
