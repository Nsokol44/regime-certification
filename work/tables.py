import pandas as pd, json, numpy as np
E=pd.read_csv('environment.csv',index_col=0)
def pp(t): return -1 if t<=1992 else 1 if t<=2000 else -1 if t<=2008 else 1 if t<=2016 else -1 if t<=2020 else 1 if t<=2024 else -1
R=pd.read_csv('results2_base.csv')
n=R.groupby('t').n.first().to_dict(); n[1994]=2212
cert=R.groupby('t').certified.first().to_dict(); cert[1994]=False
t1=[]
for t in range(1994,2025,2):
    t1.append([str(t),'Presidential' if t%4==0 else 'Midterm','D' if pp(t)==1 else 'R',f"{n[t]:,}",f"{100*E.E[t]:.1f}",f"{100*(E.E[t]-E.E[t-2]):+.2f}",f"{100*(E.E[t]-E.E[t-2])*pp(t):+.2f}",'Yes' if cert[t] else 'No'])
names={'pooled_all':'PC-all','pooled_other':'PC-other','pooled_same':'PC-same','struct_persist':'ST-persist','struct_pooled_swing':'ST-pooled-swing','struct_unsigned_same':'ST-unsigned','struct_v2_signed':'ST-signed','struct_poll_raw':'ST-poll-raw','struct_poll_cal':'ST-poll-cal','struct_poll_signed':'ST-poll+signed','struct_oracle':'ST-oracle'}
ev=R[R.certified]; t2=[]
for m,l in names.items():
    s=ev[ev.model==m]
    if not len(s): continue
    g=lambda c,v: s[s.cls==c][v].mean(); gb=lambda c: s[s.cls==c].bias.abs().mean()
    t2.append([l,f"{g('M','mae'):.2f}",f"{g('P','mae'):.2f}",f"{gb('M'):.2f}",f"{gb('P'):.2f}",f"{100*g('M','common'):.1f}",f"{100*g('P','common'):.1f}",f"{g('M','brier'):.4f}",f"{g('P','brier'):.4f}"])
P=pd.read_csv('paired.csv'); t3=[]
for r in P.itertuples():
    t3.append([names[r.a]+' minus '+names[r.b],'Midterm' if r.cls=='M' else 'Presidential','MAE (pp)' if r.v=='mae' else 'Brier',
      (f"{r.mean:+.2f}" if r.v=='mae' else f"{r.mean:+.4f}"),(f"[{r.lo:+.2f}, {r.hi:+.2f}]" if r.v=='mae' else f"[{r.lo:+.4f}, {r.hi:+.4f}]"),f"{r.wins} of {r.n}"])
def cell(q,m,c):
    s=q[(q.model==m)&(q.cls==c)]
    return f"{s.mae.mean():.2f}" if len(s) else 'n/a'
t4=[]
for o,lab in [('base','Baseline'),('weighted','Vote-weighted scoring'),('noredist','Excluding first post-redistricting elections'),('onelag','One-lag structure')]:
    q=pd.read_csv(f'results2_{o}.csv'); q=q[q.certified]; row=[lab]
    for m in ['pooled_all','struct_persist','struct_v2_signed','struct_poll_raw','struct_poll_cal','struct_poll_signed','struct_oracle']: row.append(cell(q,m,'M'))
    for m in ['pooled_all','struct_v2_signed','struct_poll_cal','struct_poll_signed']: row.append(cell(q,m,'P'))
    t4.append(row)
t6=[]
for m in ['struct_persist','struct_v2_signed','struct_poll_cal','struct_poll_signed','struct_oracle']:
    s=ev[ev.model==m]
    if not len(s): continue
    t6.append([names[m],f"{s[s.cls=='M'].env_err.abs().mean():.2f}",f"{s[s.cls=='P'].env_err.abs().mean():.2f}"])
t5=[]
for t in (1996,1998,2000):
    s=R[R.t==t].set_index('model'); row=[str(t),'Presidential' if t%4==0 else 'Midterm',str(int(s.n_same.iloc[0]))]
    for m in ['pooled_all','struct_persist','struct_v2_signed','struct_oracle']: row.append(f"{s.loc[m,'mae']:.2f}" if m in s.index else 'n/a')
    t5.append(row)
json.dump(dict(t1=t1,t2=t2,t3=t3,t4=t4,t5=t5,t6=t6),open('tables.json','w'),indent=1)
for k,v in dict(t1=t1,t2=t2,t4=t4,t5=t5).items(): print(k); [print(r) for r in v]
