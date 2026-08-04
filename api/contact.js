export const config = {
  api: { bodyParser: false }
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formId = process.env.FORMSPREE_FORM_ID;
  if (!formId) {
    return res.status(500).json({ error: 'Form endpoint not configured' });
  }

  const body = await readRawBody(req);

  const formspreeRes = await fetch(`https://formspree.io/f/${formId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded'
    },
    body
  });

  const data = await formspreeRes.json().catch(() => ({}));
  res.status(formspreeRes.status).json(data);
}
