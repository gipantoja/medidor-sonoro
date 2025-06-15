document.getElementById('iniciar').addEventListener('click', () => {
  iniciarMedição();
});

async function iniciarMedição() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const timeData = new Float32Array(bufferLength);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);

    function medirSom() {
      analyser.getFloatTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      const frequencia = calcularFrequencia(timeData, audioContext.sampleRate);
      const decibeis = calcularDecibeis(freqData);

      if (frequencia) {
        const hz = frequencia.toFixed(2);
        document.getElementById('frequencia').innerText = `Frequência: ${hz} Hz`;
        mudarCorPorFrequencia(frequencia);
      }

      if (decibeis !== null) {
        document.getElementById('decibeis').innerText = `Volume: ${decibeis.toFixed(1)} dB`;
      
const barraLinear = document.getElementById('barra-linear');
const barraLog = document.getElementById('barra-log');

if (barraLinear && barraLog) {
  // Normaliza o volume médio
  const volumeNormalizado = Math.min(decibeis / 100, 1); // valor entre 0 e 1

  // Barra linear (cresce proporcional ao volume)
  barraLinear.style.width = `${volumeNormalizado * 100}%`;

  // Barra logarítmica (cresce suavemente)
  const volumeLog = Math.log10(1 + volumeNormalizado * 9); // transforma de 0–1 em 0–1 log
  barraLog.style.width = `${volumeLog * 100}%`;
}

}

      requestAnimationFrame(medirSom);
    }

    medirSom();
  } catch (erro) {
    alert("Erro ao acessar o microfone: " + erro.message);
  }
}

function calcularFrequencia(buffer, sampleRate) {
  let maxCorr = 0;
  let melhorDeslocamento = -1;
  const tamanho = buffer.length;

  for (let desloc = 1; desloc < tamanho; desloc++) {
    let corr = 0;

    for (let i = 0; i < tamanho - desloc; i++) {
      corr += buffer[i] * buffer[i + desloc];
    }

    if (corr > maxCorr) {
      maxCorr = corr;
      melhorDeslocamento = desloc;
    }
  }

  if (melhorDeslocamento === -1) return null;

  return sampleRate / melhorDeslocamento;
}

function calcularDecibeis(freqData) {
  let soma = 0;
  for (let i = 0; i < freqData.length; i++) {
    soma += freqData[i];
  }
  const media = soma / freqData.length;

  // Converte valor médio para escala dB (simplificada)
  const decibeis = 20 * Math.log10(media / 255);
  return isFinite(decibeis) ? decibeis + 60 : null; // +60 para evitar valores negativos
}

function mudarCorPorFrequencia(freq) {
  const elemento = document.getElementById('frequencia');
  let cor = '#00ccff';

  if (freq < 200) {
    cor = '#ff4d4d'; // grave
  } else if (freq < 600) {
    cor = '#ff9900'; // médio
  } else if (freq < 1000) {
    cor = '#33cc33'; // agudo
  } else {
    cor = '#9966ff'; // muito agudo
  }

  elemento.style.color = cor;
}
