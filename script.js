// URL de votre webhook n8n via le tunnel ngrok
const N8N_WEBHOOK_URL = 'https://attach-unsoiled-elephant.ngrok-free.dev/webhook-test/pawcolor/order';

// Exemple de fonction d'envoi de commande depuis votre Mini App Telegram
async function sendOrderData(orderData) {
    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        const result = await response.json();
        console.log('Succès de l\'envoi vers n8n:', result);
        return result;
    } catch (error) {
        console.error('Erreur lors de la communication avec n8n:', error);
    }
}
