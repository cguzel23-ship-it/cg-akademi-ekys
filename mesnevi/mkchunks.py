import json,re,sys,os
P=os.path.dirname(os.path.abspath(__file__))
def chunks(n,MAXC=5600,MAXP=2200):
    t=open(f'{P}/uyku_mesnevi{n:02d}.md').read()
    lines=[l.strip() for l in t.split('\n') if l.strip() and not l.startswith('#') and not l.startswith('*Bu bölüm')]
    sents=[]
    for l in lines: sents.append(l)
    parts=[];cur=''
    for s in sents:
        if len(cur)+len(s)+1>MAXP and cur: parts.append(cur.strip()); cur=''
        cur+=s+' '
    if cur.strip(): parts.append(cur.strip())
    out=[];c=[];cl=0
    for p in parts:
        if cl+len(p)>MAXC and c: out.append(c); c=[];cl=0
        c.append(p); cl+=len(p)
    if c: out.append(c)
    return out
if __name__=='__main__':
    f=f'{P}/chunks.json'; d=json.load(open(f)) if os.path.exists(f) else {}
    for a in sys.argv[1:]:
        n=int(a); cs=chunks(n)
        for k in [x for x in d if x.startswith(f'{n}-')]: del d[k]
        for i,c in enumerate(cs,1): d[f'{n}-{i}']=c
        print(n,len(cs),[sum(map(len,c)) for c in cs])
    json.dump(d,open(f,'w'),ensure_ascii=False,indent=0)
