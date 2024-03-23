export const peerJSConnectionConfig = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'turn:0.peerjs.com:3478', username: 'peerjs', credential: 'peerjsp' },
	],
	sdpSemantics: 'unified-plan',
};
