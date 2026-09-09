<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
const canvas = ref<HTMLCanvasElement>();
let frame = 0;
let observer: IntersectionObserver | undefined;
let resizeObserver: ResizeObserver | undefined;
let dispose: (() => void) | undefined;
onMounted(() => {
  const surface = canvas.value;
  const gl = surface?.getContext("webgl", { alpha: false, antialias: false });
  if (!surface || !gl) return;
  const shaders: WebGLShader[] = [];
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    shaders.push(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(
    program,
    compile(
      gl.VERTEX_SHADER,
      "attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}",
    ),
  );
  // The original footer uses thresholded simplex noise with a slow domain warp.
  gl.attachShader(
    program,
    compile(
      gl.FRAGMENT_SHADER,
      `precision highp float;
    uniform vec2 resolution; uniform float time;
    vec2 hash(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453123);}
    float noise(vec2 p){
      const float k1=.366025404;const float k2=.211324865;
      vec2 i=floor(p+(p.x+p.y)*k1);vec2 a=p-i+(i.x+i.y)*k2;
      vec2 o=a.x>a.y?vec2(1.,0.):vec2(0.,1.);vec2 b=a-o+k2;vec2 c=a-1.+2.*k2;
      vec3 h=max(.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.);
      return 70.*dot(h*h*h*h,vec3(dot(hash(i),a),dot(hash(i+o),b),dot(hash(i+1.),c)));
    }
    void main(){vec2 uv=gl_FragCoord.xy/resolution*2.1;
      uv+=time*vec2(-.53,.44)*.027;
      float warp=noise(uv*.5+time*vec2(.44,.46)*.06);
      uv+=.104*vec2(warp);float edge=step(.58,noise(uv*33.5));
      gl_FragColor=vec4(mix(vec3(54.,26.,91.)/255.,vec3(0.),edge),1.);
    }`,
    ),
  );
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    shaders.forEach((s) => gl.deleteShader(s));
    gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "resolution"),
    time = gl.getUniformLocation(program, "time");
  let visible = false,
    lastFrame = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function render(timestamp: number) {
    if (timestamp - lastFrame > 40 || !timestamp) {
      const ratio = Math.min(devicePixelRatio, 2) * 0.5;
      surface!.width = Math.max(1, Math.round(surface!.clientWidth * ratio));
      surface!.height = Math.max(1, Math.round(surface!.clientHeight * ratio));
      gl!.viewport(0, 0, surface!.width, surface!.height);
      gl!.uniform2f(resolution, surface!.width, surface!.height);
      gl!.uniform1f(time, reduced ? 0 : timestamp / 1000);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      lastFrame = timestamp;
    }
    if (visible && !reduced) frame = requestAnimationFrame(render);
  }
  observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    cancelAnimationFrame(frame);
    if (visible) render(0);
  });
  observer.observe(surface);
  resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    render(0);
  });
  resizeObserver.observe(surface);
  render(0);
  dispose = () => {
    gl.deleteBuffer(buffer);
    shaders.forEach((s) => gl.deleteShader(s));
    gl.deleteProgram(program);
  };
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  resizeObserver?.disconnect();
  dispose?.();
});
</script>
<template>
  <canvas ref="canvas" class="noise-backdrop" aria-hidden="true"></canvas>
</template>
