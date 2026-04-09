import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface BubbleState {
  text: string;
  displayed: string;
  opacity: number;
}

interface SpeechBubbleProps {
  objectRef: React.RefObject<THREE.Object3D | null>;
  objectId: string;
}

const MAX_CHARS = 80;

export function SpeechBubble({ objectRef }: SpeechBubbleProps) {
  const [bubble, setBubble] = useState<BubbleState | null>(null);
  const { gl } = useThree();
  const prevOpacityRef = useRef<number>(-1);
  const prevDisplayedRef = useRef<string>('');

  useFrame(() => {
    const data = objectRef.current?.userData.speechBubble;

    if (!data) {
      if (prevOpacityRef.current !== -1) {
        setBubble(null);
        prevOpacityRef.current = -1;
        prevDisplayedRef.current = '';
      }
      return;
    }

    if (
      data.displayed === prevDisplayedRef.current &&
      data.opacity === prevOpacityRef.current
    )
      return;

    prevDisplayedRef.current = data.displayed ?? '';
    prevOpacityRef.current = data.opacity ?? 1;

    setBubble({
      text: data.text,
      displayed: data.displayed ?? '',
      opacity: data.opacity ?? 1,
    });
  });

  if (!bubble) return null;

  const isTruncated = bubble.text.length > MAX_CHARS;
  const displayedTruncated =
    isTruncated && bubble.displayed.length >= MAX_CHARS
      ? bubble.displayed.slice(0, MAX_CHARS) + '…'
      : bubble.displayed;
  const isTyping = bubble.displayed.length < bubble.text.length;

  const forwardToCanvas = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    const canvas = gl.domElement;
    canvas.dispatchEvent(
      new (e.nativeEvent.constructor as typeof Event)(e.type, e.nativeEvent)
    );
  };

  return (
    <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bubblePop {
          0%   { transform: translateY(-130px) scale(0.85); opacity: 0; }
          60%  { transform: translateY(-130px) scale(1.04); opacity: 1; }
          100% { transform: translateY(-130px) scale(1);    opacity: 1; }
        }
        .speech-bubble-wrap {
          animation: bubblePop 0.25s cubic-bezier(.34,1.56,.64,1) both;
          transform: translateY(-130px);
          position: relative;
          user-select: none;
          filter: drop-shadow(0px 6px 18px rgba(0,0,0,0.22));
        }
        .speech-bubble-body {
          background: linear-gradient(145deg, #ffffff 0%, #f4f4f8 100%);
          border: 2px solid rgba(60,60,80,0.13);
          border-radius: 18px;
          padding: 10px 16px;
          min-width: 60px;
          max-width: 220px;
          width: max-content;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #1a1a2e;
          white-space: pre-wrap;
          word-break: break-word;
          text-align: left;
          line-height: 1.55;
          letter-spacing: 0.01em;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.9),
            0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          cursor: pointer;
        }
        .speech-tail-wrap {
          display: flex;
          justify-content: center;
          margin-top: -1px;
        }
        .speech-tail-outer {
          width: 0; height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 12px solid rgba(60,60,80,0.13);
        }
        .speech-tail-inner {
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid #f4f4f8;
          position: absolute;
          top: -1px; left: 50%;
          transform: translateX(-50%);
        }
        .speech-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #6c63ff;
          border-radius: 1px;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 0.7s step-end infinite;
        }
      `}</style>

      <div
        className="speech-bubble-wrap"
        style={{ opacity: bubble.opacity }}
        onPointerMove={forwardToCanvas}
        onPointerDown={forwardToCanvas}
        onPointerUp={forwardToCanvas}
        onClick={forwardToCanvas}
        onPointerOut={e => e.stopPropagation()}
        onPointerLeave={e => e.stopPropagation()}
      >
        <div className="speech-bubble-body">
          {displayedTruncated}
          {isTyping && !isTruncated && <span className="speech-cursor" />}
        </div>
        <div className="speech-tail-wrap">
          <div style={{ position: 'relative' }}>
            <div className="speech-tail-outer" />
            <div className="speech-tail-inner" />
          </div>
        </div>
      </div>
    </Html>
  );
}
