// Looping, muted background video with a still poster image.
// The poster shows instantly while the video loads, and stays as the
// background for people who've turned on "reduce motion".
function BackgroundVideo({ src, poster }) {
  return (
    <div
      className="video-background"
      aria-hidden="true"
      style={{ backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <video autoPlay muted loop playsInline preload="metadata" poster={poster}>
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

export default BackgroundVideo;
