#!/bin/bash
cd "$(dirname "$0")"; S=$PWD
for n in "$@"; do
  nn=$(printf %02d $n)
  python3 build_stoa.py $n riko/stoa$nn.wav > bs$nn.log 2>&1 || { echo "FAIL $n"; rm -rf s$nn ZD_STOA$nn.mp4; continue; }
  rm -rf s$nn
  python3 - <<P
import json,subprocess
m=json.load(open('meta_stoa.json'))['$n']
d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','ZD_STOA$nn.mp4']))
subprocess.run(['python3','kapak_stoa.py','$n',m['clip'],m['k1'],m['k2'],f'{round(d/60)} dk'],check=True)
P
  cd /home/claude/zdvid && split -b 70m -d $S/ZD_STOA$nn.mp4 ZD_ST${nn}R_part && cp $S/ZD_STOA${nn}_kapak.jpg . && git add --sparse ZD_ST${nn}R_part* ZD_STOA${nn}_kapak.jpg && git -c user.email=b@x -c user.name=bot commit -qm "stoa $n" && git push -q origin HEAD:zd-videolar 2>/dev/null && echo "PUSHED $n $(ls ZD_ST${nn}R_part* | tr '\n' ' ')" || echo "PUSHFAIL $n"
  rm -f ZD_ST${nn}R_part* ; find .git/objects -type f -size +1M -not -path "*/pack/*" -delete; git sparse-checkout reapply; cd $S; rm -f ZD_STOA$nn.mp4
done
