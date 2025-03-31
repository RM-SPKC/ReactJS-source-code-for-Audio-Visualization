import React, { useState, useEffect, useRef } from "react";

function Visualizer() {
  const [freqs, setFreqs] = useState(new Array(42).fill(0)); // Frequency data
  const audioRef = useRef(null); // Audio element reference
  const analyserRef = useRef(null); // AnalyserNode reference

  useEffect(() => {
    // Initialize AudioContext and AnalyserNode
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContext.createAnalyser();
    analyserRef.current.fftSize = 64; // Frequency size
    const data = new Uint8Array(analyserRef.current.frequencyBinCount); // Create data array to store frequency values

    // Set up the audio element
    audioRef.current = new Audio("music.mp3");
    audioRef.current.loop = true; // Loop the audio

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContext.destination);

    // Function to update the frequency data for visualization
    const update = () => {
      analyserRef.current.getByteFrequencyData(data); // Get the frequency data
      setFreqs([...data.slice(0, 42)]); // Only display the first 42 frequency values
      requestAnimationFrame(update); // Keep updating the frequency data
    };
    update();

    // Ensure AudioContext is resumed on user interaction (for browsers like Chrome)
    const handleUserInteraction = () => {
      if (audioContext.state === "suspended") audioContext.resume();
    };
    window.addEventListener("click", handleUserInteraction);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      audioRef.current.pause();
      audioContext.close();
    };
  }, []);

  // Toggle play/pause of the audio
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio.paused) {
      audio.play(); // Play the audio
    } else {
      audio.pause(); // Pause the audio
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Audio Visualization</h2>
      <button onClick={togglePlayPause} style={styles.button}>
        {audioRef.current?.paused ? "Play" : "Pause"} Audio
      </button>
      <div style={styles.visualization}>
        {freqs.map((v, i) => (
          <div key={i} style={{ ...styles.bar, height: `${v}px` }} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" },
  heading: { color: "maroon" },
  button: { padding: "10px 20px", background: "maroon", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  visualization: { display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "5px", width: "600px", height: "400px", background: "#ddd", padding: "10px", borderRadius: "20px" },
  bar: { width: "6px", background: "maroon", borderRadius: "5px", transition: "height 0.1s" }
};

export default Visualizer;
