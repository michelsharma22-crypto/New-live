const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

export default function handler(req, res) {
    // CORS - ඕනෑම තැනකින් මේ API එකට කතා කරන්න දෙනවා
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { channelName, uid, role } = req.query;

    if (!channelName) {
        return res.status(400).json({ error: 'Channel name is required' });
    }

    // Vercel Environment Variables වලින් Keys ගන්නවා (ආරක්ෂිතයි)
    const appId = process.env.AGORA_APP_ID || 'd369ed90f2c04b599b9e680fbe3ca788'; 
    const appCertificate = process.env.AGORA_APP_CERT;

    if (!appCertificate) {
         return res.status(500).json({ error: 'Agora App Certificate is missing in Vercel' });
    }

    const uidInt = uid ? parseInt(uid, 10) : 0;
    const roleType = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    
    // Token එක පැය 24ක් වැඩ කරන විදියට හදමු
    const expirationTimeInSeconds = 3600 * 24;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId, 
            appCertificate, 
            channelName, 
            uidInt, 
            roleType, 
            privilegeExpiredTs
        );
        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
