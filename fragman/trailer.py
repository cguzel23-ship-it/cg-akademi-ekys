#!/usr/bin/env python3
# Zihin Dedektifi kanal fragmanı. Kullanım: python3 trailer.py [voice.wav]
# voice verilirse segment süreleri sesteki duraklamalardan hesaplanır.
import json, os, subprocess, sys, re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 24
S = '/home/claude/zdgen/stock'
F = '/usr/share/fonts/truetype/google-fonts/'
D = '/home/claude/tr/build'
os.makedirs(D, exist_ok=True)
ACC = (88, 205, 255)
BAR = 132  # sinema bandı

# (metin, çekimler[(klip, başlangıç)], görsel yazı stili, yazı)
SEG = [
  ("Gece… Herkes uyuyor. Ama bazı sorular uyumaz.", [("kanal_gece1", 0.5), ("samanyolu1", 0.5)], 'quote', ["Bazı sorular", "uyumaz."]),
  ("Tarihin karanlıkta kalan sayfaları…", [("heykel1", 0.0), ("antik1", 0.5)], 'word', ["Karanlıkta kalan sayfalar", "TARİH"]),
  ("Evrenin hâlâ çözülemeyen sırları…", [("samanyolu2", 3.0), ("teleskop1", 0.5)], 'word', ["Çözülemeyen sırlar", "BİLİM · UZAY"]),
  ("Zihnimizin bize her gün oynadığı oyunlar…", [("cam1", 0.5)], 'word', ["Bize oynanan oyunlar", "ZİHİN"]),
  ("Ve binlerce yıllık bilgeliğin sesi.", [("kutuphane1", 0.3), ("akropol1", 1.0)], 'word', ["Binlerce yıllık ses", "FELSEFE"]),
  ("Ben Zihin Dedektifi. Önce söylentiyi dinlerim… sonra bilime sorarım.", [("AVATAR", 0)], 'avatar', ["ZİHİN DEDEKTİFİ", "Önce söylenti… sonra bilim."]),
  ("Her soru bir dosya. Ve her dosyanın sonunda gerçek var.", [("yazi1", 1.0)], 'quote', ["Her soru bir dosya.", "Her dosyanın sonunda gerçek."]),
  ("Kimi zaman bir belgesel, kimi zaman kısa bir cevap… kimi zaman da ışıkları kısıp dinleyeceğin sakin bir hikâye.", [("v_stars", 2.0), ("mum1", 0.5), ("yildiz1", 2.0)], 'file', ["HER GÜN YENİ DOSYA", "BELGESEL · KISA · UYKU", "Gizem, tarih, bilim, zihin, felsefe"]),
  ("Uyanıkken izle. Uyurken dinle.", [("deniz_gunbatimi1", 1.0)], 'quote', ["Uyanıkken izle.", "Uyurken dinle."]),
  ("Abone ol… Yeni dosya her gün açılıyor.", [("END", 0)], 'end', ["ZİHİN DEDEKTİFİ", "Abone ol · Her gün yeni dosya"]),
]
TTS_TEXT = ' ... '.join(s[0] for s in SEG)

def font(name, size): return ImageFont.truetype(F + name, size)

def spaced(draw, xy, text, fnt, fill, spacing, anchor_center=True):
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    x, y = xy
    if anchor_center: x -= total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += w + spacing
    return total

def shadow_layer(img, blur=14, alpha=170):
    a = img.split()[3].filter(ImageFilter.GaussianBlur(blur))
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); sh.putalpha(a.point(lambda v: min(alpha, v)))
    out = Image.new('RGBA', img.size, (0, 0, 0, 0)); out.alpha_composite(sh); out.alpha_composite(img); return out

def text_png(style, lines, path):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if style == 'quote':
        f = font('Poppins-Light.ttf', 82)
        y = H / 2 - 100
        for i, l in enumerate(lines):
            spaced(d, (W / 2, y + i * 110), l, f, (245, 240, 230, 255), 2)
    elif style == 'q':
        f1 = font('Poppins-Light.ttf', 64); f2 = font('Poppins-Bold.ttf', 92)
        spaced(d, (W / 2, H - BAR - 300), lines[0], f1, (235, 235, 235, 255), 2)
        spaced(d, (W / 2, H - BAR - 210), lines[1], f2, (255, 255, 255, 255), 3)
    elif style == 'word':
        f1 = font('Poppins-Light.ttf', 50); f2 = font('Poppins-Bold.ttf', 150)
        spaced(d, (W / 2, H / 2 - 150), lines[0], f1, (230, 230, 230, 255), 4)
        spaced(d, (W / 2, H / 2 - 80), lines[1], f2, (255, 255, 255, 255), 24)
        d.rectangle([W / 2 - 70, H / 2 + 125, W / 2 + 70, H / 2 + 129], fill=ACC + (255,))
    elif style == 'file':
        f0 = font('Poppins-Medium.ttf', 46); f1 = font('Poppins-Bold.ttf', 104); f2 = font('Poppins-Light.ttf', 46)
        x0 = 170; y0 = H / 2 - 150
        spaced(d, (x0, y0), lines[0], f0, ACC + (255,), 14, anchor_center=False)
        d.rectangle([x0, y0 + 70, x0 + 180, y0 + 75], fill=ACC + (255,))
        spaced(d, (x0, y0 + 90), lines[1], f1, (255, 255, 255, 255), 6, anchor_center=False)
        d.text((x0, y0 + 235), lines[2], font=f2, fill=(225, 225, 225, 255))
    elif style in ('avatar', 'end'):
        f1 = font('Poppins-Bold.ttf', 84 if style == 'avatar' else 76); f2 = font('Poppins-Light.ttf', 44)
        spaced(d, (W / 2, 760), lines[0], f1, (255, 255, 255, 255), 18)
        spaced(d, (W / 2, 875), lines[1], f2, ACC + (255,) if style == 'end' else (225, 225, 225, 255), 3)
    out = shadow_layer(im)
    if style == 'word':
        g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        gd.ellipse([W/2-760, H/2-260, W/2+760, H/2+200], fill=(0, 0, 0, 150)); g = g.filter(ImageFilter.GaussianBlur(90))
        g.alpha_composite(out); out = g
    if style == 'file':
        g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
        for x in range(0, 1300, 4): gd.rectangle([x, 0, x + 4, H], fill=(0, 0, 0, int(190 * (1 - x / 1300) ** 1.4)))
        g.alpha_composite(out); out = g
    out.save(path)

def bg_png(path):
    # lacivert radyal arka plan (avatar halkasıyla uyumlu)
    im = Image.new('RGB', (W, H), (4, 10, 22)); d = ImageDraw.Draw(im)
    for r in range(900, 0, -6):
        k = 1 - r / 900
        c = (int(4 + 14 * k), int(10 + 36 * k), int(22 + 60 * k))
        d.ellipse([W / 2 - r * 1.3, 380 - r, W / 2 + r * 1.3, 380 + r], fill=c)
    im.save(path)

def avatar_png(path, size):
    a = Image.open('/home/claude/tr/zd_avatar.png').convert('RGBA').resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).ellipse([4, 4, size - 4, size - 4], fill=255)
    a.putalpha(m)
    g = Image.new('RGBA', (size + 160, size + 160), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    gd.ellipse([70, 70, size + 90, size + 90], outline=ACC + (255,), width=10)
    g = g.filter(ImageFilter.GaussianBlur(22)); g.alpha_composite(a, (80, 80))
    g.save(path)

def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); raise SystemExit(1)

GRADE = "eq=contrast=1.10:saturation=0.78:brightness=-0.04:gamma=0.95,colorbalance=rs=0.04:gs=0.0:bs=-0.04:rh=-0.04:bh=0.06"

def render_seg(i, seg, dur):
    text, shots, style, lines = seg
    out = f'{D}/seg{i:02d}.mp4'; tp = f'{D}/t{i:02d}.png'
    text_png(style, lines, tp)
    tin = 0.5 if style != 'avatar' else 1.4
    tfade = f"fade=t=in:st={tin}:d=0.6:alpha=1,fade=t=out:st={max(tin+0.8, dur-0.7)}:d=0.5:alpha=1"
    if shots[0][0] in ('AVATAR', 'END'):
        bg = f'{D}/bg.png'; bg_png(bg)
        av = f'{D}/av.png'; avatar_png(av, 500)
        ay = 110 if shots[0][0] == 'AVATAR' else 120
        fc = (f"[0:v]scale={W}:{H},format=yuv420p[b];"
              f"[1:v]format=rgba,scale=w='{660}*(0.86+0.14*min(t/{dur*0.8},1))':h=-1:eval=frame,fade=t=in:st=0.2:d=0.9:alpha=1[a];"
              f"[b][a]overlay=x=(W-w)/2:y={ay}+(660-h)/2:eval=frame[c];"
              f"[2:v]format=rgba,{tfade}[t];[c][t]overlay=0:0,format=yuv420p")
        sh(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-t', f'{dur}', '-i', bg, '-loop', '1', '-t', f'{dur}', '-i', av,
            '-loop', '1', '-t', f'{dur}', '-i', tp, '-filter_complex', fc, '-r', str(FPS), '-t', f'{dur}',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', out])
        return out
    n = len(shots); sd = dur / n; parts = []
    for k, (clip, ss) in enumerate(shots):
        p = f'{D}/seg{i:02d}_{k}.mp4'
        cd = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{S}/{clip}.mp4']))
        need = sd + 0.6
        rate = min(1.0, (cd - ss) / need)  # klip kısa ise yavaşlat
        pan = (k + i) % 2
        night = ",curves=all='0/0 0.5/0.36 1/0.82',colorbalance=bs=0.10:bm=0.06:rm=-0.05" if clip in ('roma1','antik1','akropol1','heykel1','kutuphane1') else ''
        vf = (f"setpts=PTS/{rate:.4f},scale=2112:1188,crop={W}:{H}:x='96{'-' if pan else '+'}t*{90/need:.3f}':y='54',"
              f"{GRADE}{night},fps={FPS}")
        sh(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ss}', '-i', f'{S}/{clip}.mp4', '-vf', vf, '-t', f'{need}', '-an',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', p])
        parts.append(p)
    # çekimler arası 0.6 sn çapraz geçiş
    cur = parts[0]
    if n > 1:
        inputs = []; fc = ''; prev = '[0:v]'; off = 0
        for k in range(n): inputs += ['-i', parts[k]]
        for k in range(1, n):
            off += sd
            fc += f"{prev}[{k}:v]xfade=transition=fade:duration=0.6:offset={off - 0.0:.3f}[x{k}];"; prev = f'[x{k}]'
        fc = fc.rstrip(';')
        cur = f'{D}/seg{i:02d}_m.mp4'
        sh(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', prev, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', cur])
    fc = f"[0:v]trim=0:{dur},setpts=PTS-STARTPTS[v];[1:v]format=rgba,{tfade}[t];[v][t]overlay=0:0,format=yuv420p"
    sh(['ffmpeg', '-v', 'error', '-y', '-i', cur, '-loop', '1', '-t', f'{dur}', '-i', tp, '-filter_complex', fc, '-r', str(FPS),
        '-t', f'{dur}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', out])
    return out

def durations(voice):
    if not voice:
        est = [max(2.6, len(s[0]) / 13.5 + 0.9) for s in SEG]
        est[0] += 1.5; est[5] += 1.0; est[-1] += 2.5
        return est, None
    # sesteki ≥0.55 sn duraklamaları bul, en uzun len(SEG)-1 tanesini sınır al
    r = subprocess.run(['ffmpeg', '-i', voice, '-af', 'silencedetect=n=-38dB:d=0.55', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]
    pe = re.findall(r'silence_end: ([\d.]+) \| silence_duration: ([\d.]+)', r)
    en = [float(m[0]) for m in pe]; dd = [float(m[1]) for m in pe]
    total = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice]))
    gaps = sorted(zip(st, en, dd), key=lambda g: -g[2])
    gaps = [g for g in gaps if 1.0 < g[0] < total - 1.0][:len(SEG) - 1]
    cuts = sorted((g[0] + g[1]) / 2 for g in gaps)
    print('sınırlar', [round(c, 2) for c in cuts])
    LEAD = 1.6  # ses başlamadan önce görüntü
    b = [0] + [c + LEAD for c in cuts] + [total + LEAD + 3.0]
    return [b[k + 1] - b[k] for k in range(len(SEG))], LEAD

def sfx():
    # alçak gerilim sesi + darbe (sentetik, telifsiz)
    sh(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=f=42:d=3.5', '-f', 'lavfi', '-i', 'anoisesrc=c=brown:d=3.5:a=0.6',
        '-filter_complex', '[0][1]amix=2:weights=1 0.5,lowpass=f=160,afade=t=in:d=0.02,afade=t=out:st=0.3:d=3.2,volume=2.2', '-ar', '48000', '-ac', '2', f'{D}/hit.wav'])
    sh(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anoisesrc=c=pink:d=1.6:a=0.5', '-af',
        'highpass=f=400,lowpass=f=4000,afade=t=in:d=1.2:curve=exp,afade=t=out:st=1.2:d=0.4,volume=0.5', '-ar', '48000', '-ac', '2', f'{D}/whoosh.wav'])

def main():
    voice = sys.argv[1] if len(sys.argv) > 1 else None
    durs, lead = durations(voice)
    print('süreler', [round(x, 2) for x in durs], 'toplam', round(sum(durs), 1))
    segs = [render_seg(i, s, d + 0.5) for i, (s, d) in enumerate(zip(SEG, durs))]
    # segmentler arası 0.5 sn geçiş
    inputs = []; fc = ''; prev = '[0:v]'; off = 0
    for p in segs: inputs += ['-i', p]
    for k in range(1, len(segs)):
        off += durs[k - 1]
        tr = 'fadeblack' if k in (5, 6, 9) else 'fade'
        fc += f"{prev}[{k}:v]xfade=transition={tr}:duration=0.5:offset={off:.3f}[x{k}];"; prev = f'[x{k}]'
    total = sum(durs)
    fc += (f"{prev}fade=t=in:st=0:d=1.2,fade=t=out:st={total - 1.2:.2f}:d=1.2,vignette=PI/4.5,noise=alls=7:allf=t,"
           f"drawbox=x=0:y=0:w={W}:h={BAR}:color=black:t=fill,drawbox=x=0:y={H - BAR}:w={W}:h={BAR}:color=black:t=fill,format=yuv420p[v]")
    sh(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', f'{D}/video.mp4'])
    sfx()
    starts = [sum(durs[:k]) for k in range(len(durs))]
    hits = [starts[1], starts[5], starts[7], starts[9]]
    whs = [starts[k] - 1.1 for k in (2, 3, 4)]
    ain = ['-i', '/home/claude/sp/muzik_pad.wav', '-i', f'{D}/hit.wav', '-i', f'{D}/whoosh.wav']
    fc = f"[0:a]aloop=loop=-1:size=2e9,atrim=0:{total},volume=0.55,afade=t=in:d=2,afade=t=out:st={total - 3}:d=3[m];"
    mix = ['[m]']
    for j, h in enumerate(hits):
        fc += f"[1:a]adelay={int(h * 1000)}|{int(h * 1000)},volume=0.9[h{j}];"; mix.append(f'[h{j}]')
    for j, h in enumerate(whs):
        fc += f"[2:a]adelay={int(h * 1000)}|{int(h * 1000)}[w{j}];"; mix.append(f'[w{j}]')
    if voice:
        ain += ['-i', voice]
        fc += f"[3:a]aresample=48000,adelay={int(lead * 1000)}|{int(lead * 1000)},volume=1.6,acompressor=threshold=0.1:ratio=3[vo];"; mix.append('[vo]')
        fc += f"[m]asplit[mm][sc];"  # ducking için kopya gerekmez; basit karışım
        fc = fc.replace("[m]asplit[mm][sc];", "")
    fc += ''.join(mix) + f"amix=inputs={len(mix)}:normalize=0,alimiter=limit=0.9[a]"
    sh(['ffmpeg', '-v', 'error', '-y', *ain, '-filter_complex', fc, '-map', '[a]', '-t', f'{total}', '-ar', '48000', '-ac', '2', f'{D}/audio.wav'])
    outname = '/home/claude/tr/ZD_FRAGMAN.mp4' if voice else '/home/claude/tr/ZD_FRAGMAN_onizleme.mp4'
    sh(['ffmpeg', '-v', 'error', '-y', '-i', f'{D}/video.mp4', '-i', f'{D}/audio.wav', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
        '-shortest', '-movflags', '+faststart', outname])
    print('OK', outname, round(total, 1))

if __name__ == '__main__':
    main()
