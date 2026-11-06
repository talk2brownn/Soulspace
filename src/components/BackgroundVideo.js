import { useEffect, useRef } from 'react';
import './BackgroundVideo.css';

// Looping, muted background video.
// - `poster` shows instantly while the video loads, and replaces the video
//   entirely for people who've turned on "reduce motion".
// - `focused` dims, blurs and slows the video (it never stops), so writing
//   on top of it stays comfortable.
function BackgroundVideo({ src, poster, focused = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = focused ? 0.5 : 1;
  }, [focused]);

  return (
    <div className={`video-background ${focused ? 'is-focused' : ''}`} aria-hidden="true">
      <img className="video-poster" src={poster} alt="" />
      <video ref={videoRef} autoPlay muted loop playsInline preload="metadata" poster={poster}>
        <source src={src} type="video/mp4" />
      </video>
      <div className="video-scrim" />
    </div>
  );
}

export default BackgroundVideo;
