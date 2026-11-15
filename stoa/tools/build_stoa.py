import subprocess,os,sys,random
N=int(sys.argv[1]); AUD=sys.argv[2]; OUT=f'ZD_STOA{N:02d}.mp4'
S='/home/claude/zdgen/stock'; D=os.getcwd()+f'/s{N:02d}'; os.makedirs(D+'/c',exist_ok=True)
MUS='/tmp/claude-0/-home-claude/5868866e-fe00-5eb4-94e6-9298be2d3f2f/scratchpad/sp/muzik_pad.wav'
FPS=24;TEMPO=0.93;INTRO=4.0;TAIL=18.0;SEG=12.0;F=1.0
THEMES={n:'antik sutun ege zeytin heykel akropol tiyatro mum kitap_mum roma deniz_gunbatimi yildiz samanyolu liman bulut nehir gundogumu' for n in range(1,21)}
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]).decode())
if not os.path.exists(D+'/mix.m4a'):
  subprocess.run(['ffmpeg','-v','error','-y','-i',AUD,'-af',f'aresample=44100,atempo={TEMPO},adelay={int(INTRO*1000)}:all=1,apad=pad_dur={TAIL},loudnorm=I=-19:TP=-2:LRA=11','-ar','44100','-ac','2',D+'/voice.wav'],check=True)
  t=dur(D+'/voice.wav')
  subprocess.run(['ffmpeg','-v','error','-y','-i',D+'/voice.wav','-stream_loop','-1','-i',MUS,'-filter_complex',f'[1:a]volume=0.05,afade=t=in:d=3,afade=t=out:st={t-8}:d=8[m];[0:a][m]amix=inputs=2:duration=first:normalize=0[o]','-map','[o]','-t',str(t),'-c:a','aac','-b:a','128k',D+'/mix.m4a'],check=True)
total=dur(D+'/voice.wav')
avail=set(os.listdir(S))
pool=[]
for tg in THEMES[N].split():
  pool+= [f for f in sorted(avail) if f.rstrip('.mp4').rstrip('0123456789')==tg]
pool=[f for f in pool if dur(f'{S}/{f}')>=6]
random.seed(N); random.shuffle(pool)
nseg=int(total//SEG)+1
if total-(nseg-1)*SEG<2.5: nseg-=1
order=[]
while len(order)<nseg: order+=pool
order=order[:nseg]
fr=[];acc=0;done=0
for i in range(nseg):
  d=SEG if i<nseg-1 else total-i*SEG
  acc+=d; f=round(acc*FPS)-done; done+=f; fr.append(f)
ENC=f"-r {FPS} -c:v libx264 -profile:v high -pix_fmt yuv420p -preset veryfast -crf 24 -g 48 -video_track_timescale 12288 -an"
cmds=[]
for k,(clip,f) in enumerate(zip(order,fr)):
  out=f'{D}/c/{k:03d}.mp4'
  if os.path.exists(out+'.ok'): continue
  cd=dur(f'{S}/{clip}'); dd=f/FPS; slow=max(1.0,dd/(cd-0.1))
  fade=f"fade=t=in:d={F},fade=t=out:st={dd-F:.3f}:d={F}"
  cmds.append(f"ffmpeg -v error -y -stream_loop 3 -i {S}/{clip} -vf \"setpts={slow:.4f}*PTS,{fade},format=yuv420p\" -frames:v {f} {ENC} {out} && touch {out}.ok")
open(D+'/cmds.txt','w').write('\n'.join(cmds)+'\n')
if cmds: subprocess.run(f'cat {D}/cmds.txt | xargs -P 2 -I{{}} sh -c "{{}}"',shell=True,check=True)
open(D+'/list.txt','w').write(''.join(f"file '{D}/c/{k:03d}.mp4'\n" for k in range(nseg)))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',D+'/list.txt','-i',D+'/mix.m4a','-map','0:v','-map','1:a','-c','copy','-shortest','-movflags','+faststart',os.getcwd()+'/'+OUT],check=True)
print('OK',OUT,round(total),nseg,flush=True)
