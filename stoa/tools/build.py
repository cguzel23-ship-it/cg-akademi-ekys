import subprocess,os,sys,random
N=int(sys.argv[1]); AUD=sys.argv[2]; OUT=f'ZD_SPINOZA{N:02d}.mp4'
S='/home/claude/zdgen/stock'; D=os.getcwd()+f'/e{N:02d}'; os.makedirs(D+'/c',exist_ok=True)
MUS='/tmp/claude-0/-home-claude/5868866e-fe00-5eb4-94e6-9298be2d3f2f/scratchpad/sp/muzik_pad.wav'
FPS=24;TEMPO=0.93;INTRO=4.0;TAIL=18.0;SEG=12.0;F=1.0
THEMES={1:'kanal_gece mum yildiz dalga cam teleskop kanal_sis kitap_mum deniz_gunbatimi samanyolu liman gol',
2:'liman deniz_gunbatimi kanal_sis hol_ev kanal_gece kilise mum yagmur_cam kitap_mum nehir sonbahar kar',
3:'cam mikroskop teleskop degirmen lale gundogumu mum yazi kitap_mum samanyolu yildiz hol_ev',
4:'kanal_gece yagmur_cam kitap_mum yazi bulut liman kilise mum kar somine hol_ev kanal_sis',
5:'kitap_mum yazi mum yildiz orman_sis nehir dalga gol samanyolu bulut yaprak gundogumu',
6:'dalga deniz_gunbatimi yildiz samanyolu bulut nehir selale gol orman_sis yaprak kar gundogumu',
7:'yaprak yagmur_cam bulut selale nehir orman_sis yildiz dalga sonbahar gol kar orumcek',
8:'nehir dalga orman_sis yaprak gol bulut selale yildiz samanyolu gundogumu sonbahar kar',
9:'gundogumu yildiz samanyolu teleskop cam mikroskop kitap_mum mum bulut gol nehir orman_sis',
10:'yagmur_cam dalga bulut orman_sis sonbahar nehir mum somine gol yaprak kar selale',
11:'sonbahar yaprak selale nehir dalga bulut yildiz orman_sis kar gol samanyolu yagmur_cam',
12:'mum kitap_mum somine yagmur_cam kar orman_sis nehir gundogumu bulut dalga gol yildiz',
13:'yagmur_cam mum somine gol nehir orman_sis kar sonbahar yaprak bulut dalga gundogumu',
14:'samanyolu yildiz gol dalga deniz_gunbatimi bulut gundogumu orman_sis selale nehir kar lale',
15:'kilise kitap_mum yazi kutuphane liman kanal_gece hol_ev mum degirmen yildiz bulut kanal_sis',
16:'kar kanal_gece mum kitap_mum yazi kanal_sis kilise yildiz samanyolu dalga deniz_gunbatimi liman'}
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
random.seed(N); 
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
