import sys,subprocess
from PIL import Image,ImageDraw,ImageFont
N=int(sys.argv[1]);clip=sys.argv[2];t1=sys.argv[3];t2=sys.argv[4];dk=sys.argv[5]
subprocess.run(['ffmpeg','-v','error','-y','-ss','2','-i',f'/home/claude/zdgen/stock/{clip}.mp4','-frames:v','1','-vf','scale=1280:720',f'/tmp/k{N}.jpg'],check=True)
FB='/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf';Y=(245,190,40)
im=Image.open(f'/tmp/k{N}.jpg').convert('RGB')
g=Image.new('L',(1,720));[g.putpixel((0,y),int(max(0,(y-260)/460)*225)) for y in range(720)]
im=Image.composite(Image.new('RGB',im.size,(0,0,0)),im,g.resize(im.size));d=ImageDraw.Draw(im)
f1=ImageFont.truetype(FB,30);s=f'Uyurken Dinle · Spinoza Serisi {N} · {dk}';tw=d.textlength(s,font=f1)
d.rounded_rectangle((62,48,62+tw+56,112),radius=32,fill=(20,20,20),outline=Y,width=3);d.text((90,58),s,font=f1,fill='white')
fs=104
while True:
  fT=ImageFont.truetype(FB,fs)
  if d.textlength(t1,font=fT)<1150: break
  fs-=6
d.text((70,600-fs),t1,font=fT,fill='white',stroke_width=6,stroke_fill='black')
d.text((78,605),t2,font=ImageFont.truetype(FB,52),fill=Y,stroke_width=4,stroke_fill='black')
im.save(f'ZD_SPINOZA{N:02d}_kapak.jpg',quality=92)
