import { isValidUUID } from "./helpers";

export function initializeParams(request, env) {
    const proxyIPs = env.PROXYIP?.split(',').map(proxyIP => proxyIP.trim());
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    globalThis.panelVersion = '3';
    globalThis.defaultHttpPorts = ['80', '8080', '2052', '2082', '2086', '2095', '8880'];
    globalThis.defaultHttpsPorts = ['443', '8443', '2053', '2083', '2087', '2096'];
    globalThis.userID = env.编号;
    globalThis.trojanPassword = env.密码;
    globalThis.proxyIP = proxyIPs ? proxyIPs[Math.floor(Math.random() * proxyIPs.length)] : atob('YnBiLnlvdXNlZi5pc2VnYXJvLmNvbQ==');
    globalThis.hostName = request.headers.get('Host');
    globalThis.pathName = url.pathname;
    globalThis.client = searchParams.get('app');
    globalThis.urlOrigin = url.origin;
    globalThis.dohURL = env.DOH_URL || 'https://cloudflare-dns.com/dns-query';
    if (pathName !== `/${globalThis.userID}/secrets`) {
        if (!userID || !trojanPassword) throw new Error(`Please set 编号 and 密码 first. Please visit <a href="https://${hostName}/${globalThis.userID}/secrets" target="_blank">here</a> to generate them.`, { cause: "init"});
        if (userID && !isValidUUID(userID)) throw new Error(`Invalid UUID: ${globalThis.userID}`, { cause: "init"});
        if (typeof env.库 !== 'object') throw new Error('KV Dataset is not properly set! Please refer to tutorials.', { cause: "init"});
    }
}