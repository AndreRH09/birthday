document.addEventListener("DOMContentLoaded", function () {
  // prompt user for first name

  var user = prompt("Escribe tu nombre (no soy adivino):");

  if (user === null || user === "") {
    user = prompt("No estoy hablando chino, escribe tu nombre especial:");
    while (user === null || user === "") {
      user = prompt("TMR no se puede ser tan bruto:");
    }
  }

  if (user.length < 2) {
    user = prompt("Tampoco seas vivo p:");
    while (user.length < 2) {
      user = prompt("como te vas a llamar " + user + "?, escribe bien :");
    }
  }
  if (user !== null) {
    document.title = "Feliz Cumpleaños " + user + "!";
    document.querySelector("h1").textContent = "Feliz Cumple " + user + "!";
  }

  if (user !== null) {
    document.title = "Happy Birthday " + user + "!";
    document.querySelector("h1").textContent = "Happy Birthday " + user + "!";
  }

  // constant variables
  const mic = document.getElementById("mic");
  const cursor = document.getElementById("cursor");
  const flame = document.getElementById("flame");
  const cursorInstructions = document.getElementById("cursorInstructions");
  const micInstructions = document.getElementById("micInstructions");
  micInstructions.style.display = "none";
  cursorInstructions.style.display = "none";
  const instructionsContainer = document.querySelector(
    ".instructions-container"
  );

  // blow detection variables
  let audioContext;
  let micStream;
  let analyser;
  let blowThreshold = 110;
  let flameOpacity = 1;

  // function to start blow detection
  function startBlowDetection() {
    // initialize the microphone, accept or reject microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        // Create audio context
        audioContext = new AudioContext();
        micStream = stream;
        const microphone = audioContext.createMediaStreamSource(stream);

        // initialize analyser mode
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        microphone.connect(analyser);

        // execute listenForBlow() function
        listenForBlow();
      })
      .catch(function (err) {
        console.error("Error accessing microphone:", err);
      });
  }

  // listen for blow function
  function listenForBlow() {
    const buffer = analyser.frequencyBinCount;
    const data = new Uint8Array(buffer);

    function detectBlow() {
      analyser.getByteFrequencyData(data);

      // calculate the average amplitude
      let s = 0; // sum
      for (let i = 0; i < buffer; i++) {
        s += data[i];
      }
      const averageAmplitude = s / buffer;

      // check if averageAmplitude is greater than blowThreshold
      if (averageAmplitude > blowThreshold) {
        // decrease flame opacity
        flameOpacity -= 0.05;
        if (flameOpacity < 0) {
          flameOpacity = 0;
        }
        flame.style.opacity = flameOpacity;
      }

      // schedule next detection loop
      requestAnimationFrame(detectBlow);
    }

    // detection loop
    detectBlow();
  }

  // listen for the mic button when clicked, initialize the function to handle blow detection
  mic.addEventListener("click", function () {
    micInstructions.style.display = "block";
    cursorInstructions.style.display = "none";
    instructionsContainer.style.display = "none";

    startBlowDetection();

    const micAudio = new Audio("./happy.mp3");
    micAudio.play(); // Reproducir el audio
  });

  // listen for the cursor button when clicked, initialize the function to handle cursor movement
  cursor.addEventListener("click", function () {
    cursorInstructions.style.display = "block";
    micInstructions.style.display = "none";
    instructionsContainer.style.display = "none";

    // variables for cursor movement
    let prevX = null;
    let prevY = null;
    let prevTime = null;

    const flameRadius = 500;

    // track cursor movement
    document.addEventListener("mousemove", function (event) {
      const x = event.clientX;
      const y = event.clientY;

      // check if the cursor is inside the flame radius
      const inFlameRadius =
        x >= flame.offsetLeft - flameRadius &&
        x <= flame.offsetLeft + flame.offsetWidth + flameRadius &&
        y >= flame.offsetTop - flameRadius &&
        y <= flame.offsetTop + flame.offsetHeight + flameRadius;

      console.log("inFlameRadius: " + inFlameRadius);

      // check if the cursor is inside the flame radius
      if (inFlameRadius) {
        let speed = 0;
        if (prevX !== null && prevY !== null && prevTime !== null) {
          const time = performance.now() - prevTime;
          speed =
            Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2)) / time;
        }

        // decrease flame opacity based on cursor speeds
        flameOpacity -= speed * 0.01;
        if (flameOpacity < 0) {
          flameOpacity = 0;
        }
        flame.style.opacity = flameOpacity;
      }

      // update previous cursor position & time
      prevX = x;
      prevY = y;
      prevTime = performance.now();
    });
  });

  // function to handle unload of the page and close the audio context
  window.addEventListener("beforeunload", function () {
    if (audioContext) {
      audioContext.close();
      micStream.getTracks().forEach((track) => track.stop());
    }
  });
});
