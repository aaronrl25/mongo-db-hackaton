type Pose = 'idle' | 'talking' | 'walking' | 'front' | 'front-talk' | 'front-wave';
export function Mascot({ pose = 'idle', size = 28 }: { pose?: Pose; size?: number }) {
  return <img className="mascot" src={`/sprites/${pose}.png`} alt="" style={{ height: size, width: 'auto', imageRendering: 'pixelated' }} />;
}
