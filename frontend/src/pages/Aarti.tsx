import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, VolumeX, Pause, Play, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AartiThali from "@/components/AartiThali";
import MandalaBackdrop from "@/components/MandalaBackdrop";
import SevaTeaser from "@/components/SevaTeaser";
import PetalShower from "@/components/PetalShower";
import { templeAudio } from "@/lib/temple-audio";
import { AARTI_IMAGE } from "@/lib/darshan-images";

const LYRICS = [
  "जय गणेश जय गणेश जय गणेश देवा ।",
  "माता जाकी पार्वती, पिता महादेवा ॥",
  "एक दंत दयावंत, चार भुजाधारी ।",
  "माथे सिंदूर सोहे, मूषक की सवारी ॥",
  "पान चढ़े, फल चढ़े, फूल चढ़े मेवा ।",
  "मनुवन का भोग लगे, संत करे सेवा ॥",
  "अंधे को आँख देय, कोढ़ी को काया ।",
  "बांझन को पुत्र देय, निर्धन को माया ॥",
  "सूर श्याम शरण आये, सफल की जे सेवा ।",
  "जय देव जय देव, जय मंगल मूर्ति ॥",
];

const AARTI_SONG_SRC = "/audio/aarti.mp3";
const DEFAULT_LINE_MS = 6000;
// The supplied copyright-free recording has a musical intro before the singing
// and a short instrumental tail. The lyric windows are derived from the audio
// duration so the highlight follows the actual playback clock instead of a
// timer drifting away from the song.
const SONG_INTRO_S = 14;
const SONG_OUTRO_S = 9;

type Phase = "idle" | "running" | "paused" | "done";

export default function Aarti() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [line, setLine] = useState(-1);
  const [muted, setMuted] = useState(false);
  const [petals, setPetals] = useState(true);
  const [hasSong, setHasSong] = useState(false);
  const [lineMs, setLineMs] = useState(DEFAULT_LINE_MS);
  const [songDuration, setSongDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onMeta = () => {
      const duration = audio.duration;
      if (Number.isFinite(duration) && duration > 0) {
        setHasSong(true);
        setSongDuration(duration);
        const singingWindow = Math.max(1, duration - SONG_INTRO_S - SONG_OUTRO_S);
        setLineMs((singingWindow * 1000) / LYRICS.length);
      }
    };

    const onError = () => setHasSong(false);
    const onEnded = () => {
      setPhase((current) => (current === "running" ? "done" : current));
      setLine(LYRICS.length - 1);
    };

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Drive the lyric highlight directly from the real audio clock. This keeps
  // the text synced even if the browser throttles React timers.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasSong) return;

    const onTimeUpdate = () => {
      const current = audio.currentTime;
      if (current < SONG_INTRO_S) {
        setLine(-1);
        return;
      }

      const duration = songDuration || audio.duration;
      const singingWindow = Math.max(1, duration - SONG_INTRO_S - SONG_OUTRO_S);
      const index = Math.min(
        LYRICS.length - 1,
        Math.floor(((current - SONG_INTRO_S) / singingWindow) * LYRICS.length)
      );
      setLine(Math.max(0, index));
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    onTimeUpdate();
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [hasSong, songDuration]);

  // Fallback mode: synthesized temple sound when the supplied recording is
  // unavailable or cannot be decoded by the browser.
  useEffect(() => {
    if (hasSong || phase !== "running") return;
    if (line === -1) {
      setLine(0);
      return;
    }

    templeAudio.bell();
    const finish = () => {
      setPhase("done");
      templeAudio.stop();
      templeAudio.bell(1.2);
    };

    if (line >= LYRICS.length - 1) {
      const timer = window.setTimeout(finish, lineMs);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => setLine((current) => current + 1), lineMs);
    return () => window.clearTimeout(timer);
  }, [phase, line, hasSong, lineMs]);

  function startOrResume() {
    const audio = audioRef.current;

    if (phase !== "paused") {
      setLine(-1);

      if (hasSong && audio) {
        audio.currentTime = 0;
        audio.muted = muted;
        void audio.play().catch(() => {
          setHasSong(false);
          templeAudio.start();
        });
      } else {
        templeAudio.start();
      }
    } else if (hasSong && audio) {
      audio.muted = muted;
      void audio.play().catch(() => templeAudio.start());
    } else {
      templeAudio.resume();
    }

    setPhase("running");
  }

  function pause() {
    if (hasSong && audioRef.current) audioRef.current.pause();
    else templeAudio.pause();
    setPhase("paused");
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    templeAudio.setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MandalaBackdrop />
      <audio
        ref={audioRef}
        src={AARTI_SONG_SRC}
        preload="metadata"
        data-testid="aarti-song"
        className="hidden"
      />

      <div className="container py-10">
        <div className="text-center">
          <p className="text-sm tracking-widest text-amber-300">🪔 आरती</p>
          <h1 className="font-heading text-4xl text-amber-100">जय गणेश जय गणेश</h1>
          <p className="mt-2 text-orange-100/60">बप्पा के चरणों में कुछ पल</p>
        </div>

        <div className="glass mx-auto mt-8 max-w-3xl rounded-[2rem] p-6 text-center md:p-10">
          <img
            src={AARTI_IMAGE}
            alt="गणपति बप्पा"
            className="mx-auto h-44 w-44 rounded-full object-cover ring-4 ring-amber-500/20"
          />
          <AartiThali active={phase === "running"} />

          <div className="min-h-24">
            <p className="font-mantra text-xl leading-9 text-amber-50 md:text-2xl">
              {phase === "running" && line === -1
                ? "🪔 आरती की तैयारी…"
                : line >= 0
                  ? LYRICS[line]
                  : "आरती शुरू करने के लिए बटन दबाएँ"}
            </p>
            {phase === "done" && (
              <p className="mt-3 text-amber-300">
                🙏 बप्पा आपकी मनोकामना पूर्ण करें। गणपति बाप्पा मोरया!
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button className="btn-primary" onClick={phase === "running" ? pause : startOrResume}>
              {phase === "running" ? <Pause /> : <Play />}
              {phase === "paused" ? "आरती जारी रखें" : phase === "done" || phase === "idle" ? "आरती शुरू करें" : "रोकें"}
            </Button>

            <Button className="btn-outline" onClick={toggleMute}>
              {muted ? <VolumeX /> : <Volume2 />}
              {muted ? "आवाज़ चालू" : "म्यूट"}
            </Button>

            <Button
              className="btn-outline"
              onClick={() => setPetals((current) => !current)}
              aria-pressed={petals}
              data-testid="aarti-flower-shower-btn"
            >
              <Flower2 />
              {petals ? "पुष्प वर्षा बंद" : "पुष्प वर्षा"}
            </Button>
          </div>

          <p data-testid="aarti-audio-source" className="mt-3 text-center text-xs text-orange-200/60">
            {hasSong
              ? "🎵 जय गणेश देवा — copyright-free audio"
              : "🔔 मंदिर घंटी व तानपुरा — संश्लेषित ध्वनि"}
          </p>
        </div>
      </div>

      {petals && phase === "running" && <PetalShower count={14} />}
      <SevaTeaser source="aarti" />

      {phase === "done" && (
        <div className="container pb-12 text-center">
          <Link to="/seva" className="btn btn-primary inline-block">
            🙏 इच्छा हो तो सेवा अर्पित करें
          </Link>
        </div>
      )}
    </div>
  );
}
