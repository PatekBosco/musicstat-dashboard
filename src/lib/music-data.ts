export type Track = { id: number; name: string; genre: string; duration: string; listens: number; downloads: number; rating: number; conversion: number; is_locked: boolean };
export const tracks: Track[] = [
 {id:1,name:'Love me',genre:'Trance',duration:'03:42',listens:160,downloads:40,rating:4.1,conversion:25,is_locked:false},
 {id:2,name:'Afterglow',genre:'Ambient',duration:'04:18',listens:4,downloads:12,rating:4.8,conversion:75,is_locked:true},
 {id:3,name:'Ocean drive',genre:'House',duration:'03:56',listens:3,downloads:8,rating:4.5,conversion:50,is_locked:false},
 {id:4,name:'Stay with me',genre:'Trance',duration:'05:24',listens:2,downloads:5,rating:4.3,conversion:35,is_locked:true},
 {id:5,name:'New horizon',genre:'Electronic',duration:'04:07',listens:1,downloads:3,rating:4.6,conversion:60,is_locked:false},
];
// Sample analytics are illustrative, not live tracking.
export const summary = { listens:170, downloads:68, conversion:40 };
export function downloadDemo(track: Track) {
 if (track.is_locked) return false;
 const rate=22050, count=rate*3, buffer=new ArrayBuffer(44+count*2), view=new DataView(buffer);
 const text=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
 text(0,'RIFF');view.setUint32(4,36+count*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){const t=i/rate;const envelope=Math.min(t*5,1)*Math.max(0,1-t/3);view.setInt16(44+i*2,Math.sin(2*Math.PI*(220+track.id*22)*t)*envelope*6000,true);}
 const url=URL.createObjectURL(new Blob([buffer],{type:'audio/wav'}));const a=document.createElement('a');a.href=url;a.download=`${track.name}-demo.wav`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
}
