/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChromeP2PSdpBuilder } from './ChromeP2PSdpBuilder';
import { FirefoxP2PSdpBuilder } from './FirefoxP2PSdpBuilder';
import { SafariP2PSdpBuilder } from './SafariP2PSdpBuilder';

export function p2pParseSdp(sdp) {
    const lines = sdp.split('\r\n');
    const lookup = (prefix, force = true, lineFrom = 0, lineTo = Number.MAX_VALUE) => {
        if (lineTo === -1) {
            lineTo = Number.MAX_VALUE;
        }
        for (let i = lineFrom; i < lines.length && i < lineTo; i++) {
            const line = lines[i];
            if (line.startsWith(prefix)) {
                return line.substr(prefix.length);
            }
        }

        if (force) {
            console.error("Can't find prefix", prefix);
        }

        return null;
    };
    const findIndex = (prefix, lineFrom = 0, lineTo = Number.MAX_VALUE) => {
        if (lineTo === -1) {
            lineTo = Number.MAX_VALUE;
        }
        for (let i = lineFrom; i < lines.length && i < lineTo; i++) {
            const line = lines[i];
            if (line.startsWith(prefix)) {
                return i;
            }
        }

        return -1;
    };
    const findDirection = (lineFrom = 0, lineTo = Number.MAX_VALUE) => {
        if (lineTo === -1) {
            lineTo = Number.MAX_VALUE;
        }
        for (let i = lineFrom; i < lines.length && i < lineTo; i++) {
            const line = lines[i];
            if (line.startsWith('a=sendonly')) {
                return 'sendonly';
            } else if (line.startsWith('a=recvonly')) {
                return 'recvonly';
            } else if (line.startsWith('a=sendrecv')) {
                return 'sendrecv';
            } else if (line.startsWith('a=inactive')) {
                return 'inactive';
            }
        }

        return '';
    }

    const pwdIndex = findIndex('a=ice-pwd:');
    const ufragIndex = findIndex('a=ice-ufrag:');
    if (pwdIndex === -1 && ufragIndex === -1) {
        return {
            sessionId: lookup('o=').split(' ')[1],
            hash: null,
            fingerprint: null,
            media: []
        };
    }

    const info = {
        sessionId: lookup('o=').split(' ')[1],
        hash: null,
        fingerprint: null,
        media: []
    };

    let mediaIndex = findIndex('m=');
    let fingerprint = lookup('a=fingerprint:', false, 0, mediaIndex);
    if (fingerprint) {
        info.hash = fingerprint.split(' ')[0];
        info.fingerprint = fingerprint.split(' ')[1];
    }

    while (mediaIndex !== -1) {
        let nextMediaIndex = findIndex('m=', mediaIndex + 1);

        const extmap = [];
        const types = [];
        const media = {
            type: lookup('m=', true, mediaIndex, nextMediaIndex).split(' ')[0],
            mid: lookup('a=mid:', true, mediaIndex, nextMediaIndex),
            setup: lookup('a=setup:', true, mediaIndex, nextMediaIndex),
            dir: findDirection(mediaIndex, nextMediaIndex),
            pwd: lookup('a=ice-pwd:', true, mediaIndex, nextMediaIndex),
            ufrag: lookup('a=ice-ufrag:', true, mediaIndex, nextMediaIndex),
            extmap,
            types
        }
        let fingerprint = lookup('a=fingerprint:', false, mediaIndex, nextMediaIndex);
        if (fingerprint) {
            media.hash = fingerprint.split(' ')[0];
            media.fingerprint = fingerprint.split(' ')[1];
            // media.fingerprints = [{
            //     hash: fingerprint.split(' ')[0],
            //     fingerprint: fingerprint.split(' ')[1],
            //     setup: lookup('a=setup:', true, mediaIndex, nextMediaIndex)
            // }];
        }

        const lineTo = nextMediaIndex === -1 ? lines.length : nextMediaIndex;
        const fmtp = new Map();
        const rtcpFb = new Map();
        for (let i = mediaIndex; i < lineTo; i++) {
            const line = lines[i];
            if (line.startsWith('a=extmap:')) {
                const [ id, value ] = line.substr('a=extmap:'.length).split(' ');
                extmap.push({ [id]: value });
            } else if (line.startsWith('a=fmtp:')) {
                const [ id, str ] = line.substr('a=fmtp:'.length).split(' ');
                const arr =  str.split(';').map(x => {
                    const [ key, value ] = x.split('=');
                    return { [key]: value };
                });
                fmtp.set(parseInt(id), arr);
            } else if (line.startsWith('a=rtcp-fb:')) {
                const [ id, type = '', subtype = '' ] = line.substr('a=rtcp-fb:'.length).split(' ');
                if (rtcpFb.has(parseInt(id))) {
                    rtcpFb.get(parseInt(id)).push({ type, subtype });
                } else {
                    rtcpFb.set(parseInt(id), [{ type, subtype }])
                }
            } else if (line.startsWith('a=rtpmap')) {
                const [ id, str ] = line.substr('a=rtpmap:'.length).split(' ');
                const [ name, clockrate, channels = '0' ] = str.split('/');
                const obj = { id: parseInt(id), name, clockrate: parseInt(clockrate), channels: parseInt(channels) };

                types.push(obj);
            }
        }

        for (let i = 0; i < types.length; i++) {
            const { id } = types[i];
            if (rtcpFb.has(id)) {
                types[i].feedback = rtcpFb.get(id);
            }
            if (fmtp.has(id)) {
                types[i].parameters = fmtp.get(id);
            }
        }

        const ssrc = lookup('a=ssrc:', false, mediaIndex, nextMediaIndex);
        if (ssrc) {
            media.ssrc = parseInt(ssrc.split(' ')[0]);
        }

        const ssrcGroup = lookup('a=ssrc-group:', false, mediaIndex, nextMediaIndex);
        if (ssrcGroup) {
            const [ semantics, ...ssrcs ] = ssrcGroup.split(' ');
            media.ssrcGroup = {
                semantics,
                ssrcs: ssrcs.map(x => parseInt(x))
            }
        }

        info.media.push(media);

        mediaIndex = nextMediaIndex;
    }

    // console.log('[p2pParseSdp]', sdp, info);
    return info;
}

function isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

function isSafari() {
    return navigator.userAgent.toLowerCase().indexOf('safari') > -1 && navigator.userAgent.toLowerCase().indexOf('chrome') === -1;
}

export function addExtmap(extmap) {
    let sdp = '';

    for (let j = 0; j < extmap.length; j++) {
        const ext = extmap[j];
        Object.getOwnPropertyNames(ext).forEach(x => {
            sdp += `
a=extmap:${x} ${ext[x]}`;
        });
    }

    return sdp;
}

export function addPayloadTypes(types) {
    let sdp = '';

    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        const { id, name, clockrate, channels, feedback, parameters } = type;
        sdp += `
a=rtpmap:${id} ${name}/${clockrate}${channels ? '/' + channels : ''}`;
        if (feedback) {
            feedback.forEach(x => {
                const { type, subtype } = x;
                sdp += `
a=rtcp-fb:${id} ${[type, subtype].join(' ')}`;
            });
        }
        if (parameters) {
            const fmtp = parameters.reduce((arr, x) => {
                Object.getOwnPropertyNames(x).forEach(pName => {
                    arr.push(`${pName}=${x[pName]}`);
                });
                return arr;
            }, []);

            sdp += `
a=fmtp:${id} ${fmtp.join(';')}`;
        }
    }

    return sdp;
}

export function addSsrc(type, ssrc, ssrcGroup, streamName) {
    let sdp = '';

    if (ssrcGroup && ssrcGroup.ssrcs.length > 0) {
        sdp += `
a=ssrc-group:${ssrcGroup.semantics} ${ssrcGroup.ssrcs.join(' ')}`;
        ssrcGroup.ssrcs.forEach(ssrc => {
            sdp += `
a=ssrc:${ssrc} cname:stream${ssrc}
a=ssrc:${ssrc} msid:${streamName} ${type}${ssrc}
a=ssrc:${ssrc} mslabel:${type}${ssrc}
a=ssrc:${ssrc} label:${type}${ssrc}`;
        });

    } else if (ssrc) {
        sdp += `
a=ssrc:${ssrc} cname:stream${ssrc}
a=ssrc:${ssrc} msid:${streamName} ${type}${ssrc}
a=ssrc:${ssrc} mslabel:${type}${ssrc}
a=ssrc:${ssrc} label:${type}${ssrc}`;
    }

    return sdp;
}

export class P2PSdpBuilder {
    static generateOffer(info) {
        if (isFirefox()) {
            return FirefoxP2PSdpBuilder.generateOffer(info);
        } else if (isSafari()) {
            return SafariP2PSdpBuilder.generateOffer(info);
        }

        return ChromeP2PSdpBuilder.generateOffer(info);
    }

    static generateAnswer(info) {
        if (isFirefox()) {
            return FirefoxP2PSdpBuilder.generateAnswer(info);
        } else if (isSafari()) {
            return SafariP2PSdpBuilder.generateAnswer(info);
        }

        return ChromeP2PSdpBuilder.generateAnswer(info);
    }
}