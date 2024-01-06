export const vertex = `
    attribute vec2 uv;
    attribute vec2 position;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

export const fragment = `
    precision highp float;
    precision highp int;
    uniform sampler2D tWater;
    uniform sampler2D tFlow;
    uniform float uTime;
    varying vec2 vUv;
    uniform vec4 res;

    void main() {
        vec3 flow = texture2D(tFlow, vUv).rgb;
        vec2 uv = 0.5 * gl_FragCoord.xy / res.xy;
        vec2 myUV = (uv - vec2(0.5)) * res.zw + vec2(0.5);
        myUV -= flow.xy * (0.15 * 0.7);
        vec3 tex = texture2D(tWater, myUV).rgb;
        gl_FragColor = vec4(tex.r, tex.g, tex.b, 1.0);
    }
`;
