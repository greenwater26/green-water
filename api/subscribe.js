export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, guide } = req.body;
  if (!email || !guide) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'api-key': apiKey,
  };

  // 1. Aggiungi contatto alla lista Brevo (lista 4 = "Guide sito")
  const contactRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      listIds: [4],
      attributes: { GUIDA: guide, FONTE: 'sito_homepage' },
      updateEnabled: true,
    }),
  });

  if (!contactRes.ok && contactRes.status !== 204) {
    const err = await contactRes.json().catch(() => ({}));
    // "Contact already exist" non è un errore bloccante
    if (!err.code || err.code !== 'duplicate_parameter') {
      return res.status(500).json({ error: err.message || 'Errore aggiunta contatto' });
    }
  }

  // 2. Invia email transazionale con il template giusto
  //    Template 1 = Guida Casa, Template 2 = Guida HoReCa
  const templateId = guide === 'casa' ? 1 : 2;
  const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      to: [{ email }],
      templateId,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.json().catch(() => ({}));
    return res.status(500).json({ error: err.message || 'Errore invio email' });
  }

  return res.status(200).json({ success: true });
}
