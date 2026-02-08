import * as THREE from "https://cdn.skypack.dev/three@0.132.2";

const canvas = document.querySelector('canvas.webgl');
const button = document.getElementById('explodeBtn');
const scene = new THREE.Scene();

/* =======================
   TEXTO → PUNTOS
======================= */
function getTextPoints() {
    const vw = Math.min(window.innerWidth, 1200);

    const c = document.createElement('canvas');
    c.width = vw * 2;
    c.height = 420;

    const ctx = c.getContext('2d');

    const fontSize = vw < 600 ? 70 : 110;
    const lineHeight = fontSize * 1.2;

    ctx.fillStyle = 'white';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = [
        'Feliz Día',
        'Del',
        'Amor y la Amistad'
    ];

    lines.forEach((line, i) => {
        ctx.fillText(
            line,
            c.width / 2,
            c.height / 2 + (i - 1) * lineHeight
        );
    });

    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    const points = [];

    for (let y = 0; y < c.height; y += 4) {
        for (let x = 0; x < c.width; x += 4) {
            const i = (y * c.width + x) * 4;
            if (data[i + 3] > 128) {
                points.push({
                    x: (x - c.width / 2) * 0.01,
                    y: (c.height / 2 - y) * 0.01,
                    z: 0
                });
            }
        }
    }

    return points;
}

/* =======================
   CORAZÓN
======================= */
function getHeartPoints(count) {
    const pts = [];
    const scale = 0.099; // ❤️ tamaño del corazón (sube/baja aquí)

    for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()); // 🔑 relleno uniforme

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y =
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t);

        pts.push({
            x: x * scale * r,
            y: y * scale * r,
            z: (Math.random() - 0.5) * 1.2 // volumen 3D
        });
    }

    return pts;
}


function createStars() {
    const starCount = 2000;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = -Math.random() * 30;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    return stars;
}


/* =======================
   DATOS
======================= */
const textPoints = getTextPoints("Feliz Día del Amor y la Amistad");
const heartPoints = getHeartPoints(textPoints.length);

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(textPoints.length * 3);
const target = new Float32Array(textPoints.length * 3);

/* Posición inicial = TEXTO */
for (let i = 0; i < textPoints.length; i++) {
    positions[i * 3] = textPoints[i].x;
    positions[i * 3 + 1] = textPoints[i].y;
    positions[i * 3 + 2] = 0;

    target[i * 3] = textPoints[i].x;
    target[i * 3 + 1] = textPoints[i].y;
    target[i * 3 + 2] = 0;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    size: 0.045,
    color: '#ff2d55',
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);

/* =======================
   CÁMARA
======================= */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
 camera.position.z = window.innerWidth < 600 ? 14 : 10;
const stars = createStars();
stars.rotation.y += 0.0005;
stars.rotation.x += 0.0002;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);


/* =======================
   ESTADOS
======================= */
let phase = "text";

/* =======================
   BOTÓN
======================= */
button.addEventListener('click', () => {
    if (phase !== "text") return;

    phase = "explode";

    for (let i = 0; i < positions.length; i++) {
        target[i] = (Math.random() - 0.5) * 20;
    }

    setTimeout(() => {
        phase = "heart";
        for (let i = 0; i < heartPoints.length; i++) {
            target[i * 3] = heartPoints[i].x;
            target[i * 3 + 1] = heartPoints[i].y;
            target[i * 3 + 2] = heartPoints[i].z;
        }
    }, 800);
});

/* =======================
   ANIMACIÓN
======================= */
function animate() {
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < pos.length; i++) {
        pos[i] += (target[i] - pos[i]) * 0.06;
    }

    if (phase === "heart") {
        points.rotation.y += 0.003;
    }

    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

/* =======================
   RESIZE
======================= */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
