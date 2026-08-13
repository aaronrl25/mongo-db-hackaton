const C={green:'#6dbd90',dark:'#3e8e63',orange:'#f0b25c',blue:'#9fd8ef',ink:'#17221c'};
type Pose='idle'|'talking'|'front';
export function Mascot({pose='idle',size=28}:{pose?:Pose;size?:number}){
 if(pose==='front')return <svg className="mascot" width={size} height={size*7/12} viewBox="0 0 12 7" shapeRendering="crispEdges" aria-hidden>
  <rect x={3} y={0} width={6} height={1} fill={C.green}/>
  <rect x={2} y={1} width={8} height={2} fill={C.green}/>
  <rect x={3} y={1} width={1} height={1} fill={C.ink}/>
  <rect x={7} y={1} width={1} height={1} fill={C.ink}/>
  <rect x={2} y={3} width={8} height={1} fill={C.orange}/>
  <rect x={1} y={4} width={10} height={2} fill={C.green}/>
  <rect x={10} y={5} width={2} height={1} fill={C.dark}/>
  <rect x={2} y={6} width={2} height={1} fill={C.orange}/>
  <rect x={6} y={6} width={2} height={1} fill={C.orange}/>
 </svg>;
 const talking=pose==='talking';
 return <svg className="mascot" width={size} height={size*7/15} viewBox="0 0 15 7" shapeRendering="crispEdges" aria-hidden>
  <rect x={5} y={0} width={6} height={1} fill={C.green}/>
  <rect x={4} y={1} width={8} height={2} fill={C.green}/>
  <rect x={3} y={3} width={10} height={3} fill={C.green}/>
  <rect x={6} y={1} width={1} height={1} fill={C.ink}/>
  <rect x={13} y={3} width={2} height={2} fill={C.dark}/>
  <rect x={5} y={6} width={2} height={1} fill={C.orange}/>
  <rect x={8} y={6} width={2} height={1} fill={C.orange}/>
  {talking?<>
   <rect x={2} y={2} width={2.4} height={0.8} fill={C.orange}/>
   <rect x={2} y={3.4} width={2.4} height={0.8} fill={C.orange}/>
   <rect className="spark" x={0.6} y={1.4} width={0.8} height={0.8} fill={C.blue}/>
   <rect className="spark" x={0.2} y={2.9} width={0.8} height={0.8} fill={C.blue}/>
   <rect className="spark" x={0.6} y={4.4} width={0.8} height={0.8} fill={C.blue}/>
  </>:<rect x={2} y={2.5} width={2.4} height={1} fill={C.orange}/>}
 </svg>;
}
