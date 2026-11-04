import pandas as pd, numpy as np
R=pd.read_csv('results2_base.csv'); ev=R[R.certified]
rng=np.random.default_rng(20261104)
def paired(a,b,cls,v='mae'):
    A=ev[(ev.model==a)&(ev.cls==cls)].set_index('t')[v]; B=ev[(ev.model==b)&(ev.cls==cls)].set_index('t')[v]
    d=(A-B).dropna(); bs=[rng.choice(d.values,len(d)).mean() for _ in range(10000)]
    return dict(a=a,b=b,cls=cls,v=v,n=len(d),mean=d.mean(),lo=np.percentile(bs,2.5),hi=np.percentile(bs,97.5),wins=int((d<0).sum()))
out=[]
for cls in 'MP':
  for v in ['mae','brier']:
    for b in ['pooled_all','pooled_other','pooled_same','struct_persist','struct_unsigned_same']:
        out.append(paired('struct_v2_signed',b,cls,v))
    out.append(paired('struct_oracle','struct_v2_signed',cls,v))
# Poll comparisons (POLL_DESIGN.md), appended after the originals so their bootstrap draws are unchanged
if 'struct_poll_cal' in set(ev.model):
  for cls in 'MP':
    for v in ['mae','brier']:
      out.append(paired('struct_poll_cal','struct_v2_signed',cls,v))
      out.append(paired('struct_poll_signed','struct_poll_cal',cls,v))
    out.append(paired('struct_oracle','struct_poll_cal',cls,'mae'))
O=pd.DataFrame(out); O.to_csv('paired.csv',index=False); print(O.round(4).to_string())
# National environment error by rule and class (Table 6 source), |Ehat - E| in pp
for m in ['struct_persist','struct_v2_signed','struct_poll_cal','struct_poll_signed','struct_oracle']:
    s=ev[ev.model==m]
    if len(s): print(m,'env|err| M',round(s[s.cls=='M'].env_err.abs().mean(),3),'P',round(s[s.cls=='P'].env_err.abs().mean(),3),'nM',len(s[s.cls=='M']),'nP',len(s[s.cls=='P']))
# gap closed
for cls in 'MP':
    g=ev[ev.cls==cls].groupby('model').mae.mean()
    print(cls,'gap closed vs pooled_all', (g.pooled_all-g.struct_v2_signed)/(g.pooled_all-g.struct_oracle))
