import { getConfigAddresses, generateRemark, randomUpperCase, getRandomPath } from './helpers';
import { getDataset } from '../kv/handlers';

export async function getNormalConfigs(request, env) {
    const { proxySettings } = await getDataset(request, env);
    const { 
        cleanIPs, 
        proxyIP, 
        ports, 
        VLConfigs, 
        TRConfigs ,
        lengthMin,
        lengthMax,
        intervalMin,
        intervalMax, 
        outProxy, 
        customCdnAddrs, 
        customCdnHost, 
        customCdnSni, 
        enableIPv6
    } = proxySettings;
    
    let VLConfs = '', TRConfs = '', chainProxy = '';
    let proxyIndex = 1;
    const Addresses = await getConfigAddresses(cleanIPs, enableIPv6);
    const customCdnAddresses = customCdnAddrs ? customCdnAddrs.split(',') : [];
    const totalAddresses = [...Addresses, ...customCdnAddresses];
    const alpn = globalThis.client === 'singbox' ? 'http/1.1' : 'h2,http/1.1';
    const TRPass = encodeURIComponent(globalThis.TRPassword);
    const earlyData = globalThis.client === 'singbox' 
        ? '&eh=Sec-WebSocket-Protocol&ed=2560' 
        : encodeURIComponent('?ed=2560');
    
    ports.forEach(port => {
        totalAddresses.forEach((addr, index) => {
            const { hostName, defaultHttpsPorts, client, userID } = globalThis;
            const isCustomAddr = index > Addresses.length - 1;
            const configType = isCustomAddr ? 'C' : '';
            const sni = isCustomAddr ? customCdnSni : randomUpperCase(hostName);
            const host = isCustomAddr ? customCdnHost : hostName;
            const path = `${getRandomPath(16)}${proxyIP ? `/${encodeURIComponent(btoa(proxyIP))}` : ''}${earlyData}`;
            const VLRemark = encodeURIComponent(generateRemark(proxyIndex, port, addr, cleanIPs, atob('VkxFU1M='), configType));
            const TRRemark = encodeURIComponent(generateRemark(proxyIndex, port, addr, cleanIPs, atob('VHJvamFu'), configType));
            const tlsFields = defaultHttpsPorts.includes(port) 
                ? `&security=tls&sni=${sni}&fp=randomized&alpn=${alpn}`
                : '&security=none';
            const hiddifyFragment = client === 'hiddify-frag' && defaultHttpsPorts.includes(port) ? `&fragment=${lengthMin}-${lengthMax},${intervalMin}-${intervalMax},hellotls` : '';

            if (VLConfigs) VLConfs += `${atob('dmxlc3M6Ly8=')}${userID}@${addr}:${port}?path=/${path}&encryption=none&host=${host}&type=ws${tlsFields}${hiddifyFragment}#${VLRemark}\n`; 
            if (TRConfigs) TRConfs += `${atob('dHJvamFuOi8v')}${TRPass}@${addr}:${port}?path=/tr${path}&host=${host}&type=ws${tlsFields}${hiddifyFragment}#${TRRemark}\n`;
            proxyIndex++;
        });
    });

    if (outProxy) {
        let chainRemark = `#${encodeURIComponent('💦 Chain proxy 🔗')}`;
        if (outProxy.startsWith('socks') || outProxy.startsWith('http')) {
            const regex = /^(?:socks|http):\/\/([^@]+)@/;
            const isUserPass = outProxy.match(regex);
            const userPass = isUserPass ? isUserPass[1] : false;
            chainProxy = userPass 
                ? outProxy.replace(userPass, btoa(userPass)) + chainRemark 
                : outProxy + chainRemark;
        } else {
            chainProxy = outProxy.split('#')[0] + chainRemark;
        }
    }

    const configs = btoa(VLConfs + TRConfs + chainProxy);
    return new Response(configs, { 
        status: 200,
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'CDN-Cache-Control': 'no-store'
        }
    });
}

export async function getHiddifyWarpConfigs (request, env, isPro) {
    const { proxySettings } = await getDataset(request, env);
    const {
        warpEndpoints,
        hiddifyNoiseMode, 
		noiseCountMin, 
		noiseCountMax, 
		noiseSizeMin, 
		noiseSizeMax, 
		noiseDelayMin, 
		noiseDelayMax
    } = proxySettings;

    let configs = '';
    warpEndpoints.split(',').forEach( (endpoint, index) => {
        configs += `warp://${endpoint}${ isPro ? `?ifp=${noiseCountMin}-${noiseCountMax}&ifps=${noiseSizeMin}-${noiseSizeMax}&ifpd=${noiseDelayMin}-${noiseDelayMax}&ifpm=${hiddifyNoiseMode}` : ''}#${encodeURIComponent(`💦 ${index + 1} - Warp 🇮🇷`)}&&detour=warp://162.159.192.1:2408#${encodeURIComponent(`💦 ${index + 1} - WoW 🌍`)}\n`;
    });

    return new Response(configs, { 
        status: 200,
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'CDN-Cache-Control': 'no-store'
        }
    });

}