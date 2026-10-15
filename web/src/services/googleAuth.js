import jsrsasign from 'jsrsasign';
import { CONFIG } from '../config/sheetsConfig.js';

const { KJUR } = jsrsasign;

let accessToken = null;
let tokenExpiry = 0;

export async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiry - 300000) {
        return accessToken;
    }

    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: CONFIG.serviceAccountEmail,
        scope: "https://www.googleapis.com/auth/spreadsheets",
        aud: CONFIG.tokenUrl,
        exp: now + 3600,
        iat: now
    };

    const sJWT = KJUR.jws.JWS.sign(
        "RS256",
        JSON.stringify(header),
        JSON.stringify(payload),
        CONFIG.privateKey
    );

    const res = await fetch(CONFIG.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${sJWT}`
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google Auth Token Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return accessToken;
}

export function clearAccessToken() {
    accessToken = null;
    tokenExpiry = 0;
}
