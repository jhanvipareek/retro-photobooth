const video = document.getElementById("video");
const strip = document.getElementById("strip");
const startBtn = document.getElementById("startBtn");
const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let stream = null;
let photos = [];
let currentFilter = "none";

startBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    alert("Camera access failed");
    console.error(err);
  }
};

document.querySelectorAll(".filters button").forEach(btn => {
  btn.onclick = () => {
    const type = btn.dataset.filter;

    switch (type) {
      case "vintage":
        currentFilter = "sepia(0.6) contrast(1.2)";
        break;
      case "bw":
        currentFilter = "grayscale(1) contrast(1.1)";
        break;
      case "warm":
        currentFilter = "sepia(0.3) saturate(1.4)";
        break;
      default:
        currentFilter = "none";
    }

    video.style.filter = currentFilter;
  };
});

captureBtn.onclick = () => {
  if (!stream) {
    alert("Start camera first");
    return;
  }

  if (photos.length >= 3) {
    alert("Strip complete 📸");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.filter = currentFilter;
  ctx.drawImage(video, 0, 0);

  const data = canvas.toDataURL("image/png");
  photos.push(data);

  const img = document.createElement("img");
  img.src = data;
  strip.appendChild(img);
};

downloadBtn.onclick = () => {
  if (photos.length === 0) {
    alert("No photos yet");
    return;
  }

  const img = new Image();
  img.src = photos[0];

  img.onload = () => {
    const w = img.width;
    const h = img.height * photos.length;

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;

    const octx = out.getContext("2d");
    octx.fillStyle = "white";
    octx.fillRect(0, 0, w, h);

    photos.forEach((p, i) => {
      const im = new Image();
      im.src = p;
      im.onload = () => {
        octx.drawImage(im, 0, i * img.height);

        if (i === photos.length - 1) {
          const a = document.createElement("a");
          a.href = out.toDataURL("image/png");
          a.download = "photobooth-strip.png";
          a.click();
        }
      };
    });
  };
};
