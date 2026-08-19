// Initialisation de la Mini App Telegram
window.Telegram.WebApp.ready();
const tg = window.Telegram.WebApp;
tg.expand(); // Ouvre la Mini App en plein écran

const form = document.getElementById('bookForm');
const loader = document.getElementById('loader');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Afficher le loader et cacher le bouton
    form.classList.add('hidden');
    loader.classList.remove('hidden');

    const catName = document.getElementById('catName').value;
    const photo1 = document.getElementById('photo1').files[0];
    const photo2 = document.getElementById('photo2').files[0];
    const photo3 = document.getElementById('photo3').files[0];

    // Récupérer l'ID Telegram de l'utilisateur (très utile pour lui renvoyer le livre après)
    const telegramUserId = tg.initDataUnsafe?.user?.id || "unknown_user";

    try {
        // Option simple pour le MVP : Convertir les images en Base64 pour les envoyer directement à n8n
        const [base64_1, base64_2, base64_3] = await Promise.all([
            toBase64(photo1),
            toBase64(photo2),
            toBase64(photo3)
        ]);

        const payload = {
            telegram_user_id: telegramUserId,
            cat_name: catName,
            images: [base64_1, base64_2, base64_3]
        };

        // REMPLACEZ CETTE URL PAR VOTRE URL DE WEBHOOK N8N
        const n8nWebhookUrl = 'VOTRE_URL_WEBHOOK_N8N_ICI';

        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Génération lancée ! Vous recevrez votre livre directement dans le chat d'ici quelques minutes.");
            tg.close(); // Ferme la Mini App
        } else {
            throw new Error("Erreur lors de la transmission à l'automate.");
        }

    } catch (error) {
        console.error(error);
        alert("Une erreur est survenue. Veuillez réessayer.");
        form.classList.remove('hidden');
        loader.classList.add('hidden');
    }
});

// Fonction utilitaire pour convertir un fichier image en Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}