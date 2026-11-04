import pandas as pd, numpy as np, json, sys, os
OPT=sys.argv[1] if len(sys.argv)>1 else 'base'
from scipy.stats import norm, spearmanr, pearsonr
from datetime import date, timedelta
h=pd.read_csv('house_panel.csv',dtype={'county_fips':str})
E=pd.read_csv('environment.csv',index_col=0).E.to_dict()
# --- Generic-ballot polls (specification pre-committed in POLL_DESIGN.md) ---
def election_day(t):
    d=date(t,11,1); fm=d+timedelta(days=(7-d.weekday())%7); return fm+timedelta(days=1)
POLL={}
if os.path.exists('generic_ballot.csv'):
    gb=pd.read_csv('generic_ballot.csv',parse_dates=['as_of_date'])
    for r in gb.itertuples():
        assert r.as_of_date.date()<=election_day(int(r.year)), f'lookahead: poll for {r.year} dated {r.as_of_date.date()}'
        POLL[int(r.year)]=float(r.dem_two_party)
PRES=set(range(1992,2025,4))
def pp(t):  # party of sitting president at election t: +1 D, -1 R
    return -1 if t<=1992 else 1 if t<=2000 else -1 if t<=2008 else 1 if t<=2016 else -1 if t<=2020 else 1 if t<=2024 else -1
kind=lambda t:'P' if t in PRES else 'M'
W=h.pivot_table(index='county_fips',columns='year',values='dem_two_party_share')
TV=h.pivot_table(index='county_fips',columns='year',values='total_votes')
C=h.pivot_table(index='county_fips',columns='year',values='contested',aggfunc='first').fillna(False).astype(bool)
tg=[]
for t in range(1994,2025,2):
    ok=C[t]&C[t-2]&C[t-4]&W[[t,t-2,t-4]].notna().all(axis=1)
    df=pd.DataFrame({'y':W.loc[ok,t],'l1':W.loc[ok,t-2],'l2':W.loc[ok,t-4],'w':TV.loc[ok,t]})
    tg.append(dict(t=t,cls=kind(t),df=df,Et=E[t],E1=E[t-2],E2=E[t-4],
        swing=E[t]-E[t-2],signed=(E[t]-E[t-2])*pp(t)))
# --- Poll environment points, computed forward in time (POLL_DESIGN.md) ---
CERT={x['t']:len([z for z in tg if z['t']<x['t'] and z['cls']==x['cls']])>=2 for x in tg}
if OPT=='noredist':
    for t in (2002,2012,2022): CERT[t]=False
signed_mean={}; signed_err={}
for x in tg:
    same=[z for z in tg if z['t']<x['t'] and z['cls']==x['cls']]
    if same:
        signed_mean[x['t']]=x['E1']+float(np.mean([z['signed'] for z in same]))*pp(x['t'])
        signed_err[x['t']]=signed_mean[x['t']]-x['Et']
poll_cal={}; poll_cal_err={}; poll_cal_fb={}
for x in tg:
    t=x['t']
    if t not in POLL: continue
    hist=[s for s in sorted(POLL) if s<t and s in E]
    if len(hist)>=2: poll_cal[t]=POLL[t]+float(np.mean([E[s]-POLL[s] for s in hist])); poll_cal_fb[t]=False
    else: poll_cal[t]=POLL[t]; poll_cal_fb[t]=True
    poll_cal_err[t]=poll_cal[t]-x['Et']
poll_w={}; poll_sgn_pt={}; poll_sgn_fb={}
for x in tg:
    t=x['t']
    if t not in poll_cal: continue
    hist=[s for s in sorted(poll_cal_err) if s<t and CERT.get(s,False) and s in signed_err]
    if len(hist)>=3:
        msep=float(np.mean([poll_cal_err[s]**2 for s in hist])); mses=float(np.mean([signed_err[s]**2 for s in hist]))
        poll_w[t]=float(np.clip((1/msep)/((1/msep)+(1/mses)),0,1)); poll_sgn_fb[t]=False
    else:
        poll_w[t]=0.5; poll_sgn_fb[t]=True
    poll_sgn_pt[t]=poll_w[t]*poll_cal[t]+(1-poll_w[t])*signed_mean[t]
def X_raw(x): return np.c_[np.ones(len(x['df'])),x['df'].l1] if OPT=='onelag' else np.c_[np.ones(len(x['df'])),x['df'].l1,x['df'].l2]
def X_dev(x): return np.c_[np.ones(len(x['df'])),x['df'].l1-x['E1']] if OPT=='onelag' else np.c_[np.ones(len(x['df'])),x['df'].l1-x['E1'],x['df'].l2-x['E2']]
def fit(train,Xf,yf):
    X=np.vstack([Xf(x) for x in train]); Y=np.concatenate([yf(x) for x in train])
    b,*_=np.linalg.lstsq(X,Y,rcond=None); return b,(Y-X@b).std()
yraw=lambda x:x['df'].y.values; ydev=lambda x:x['df'].y.values-x['Et']
WT=[None]
def met(p,y,pw):
    w=WT[0] if OPT=='weighted' else np.ones(len(y)); w=w/w.sum()
    e=p-y; mse=np.sum(w*e**2)
    b=np.sum(w*e)
    return dict(mae=100*np.sum(w*np.abs(e)),rmse=100*np.sqrt(mse),bias=100*b,
        common=b**2/mse,rho=spearmanr(p,y)[0],winacc=np.sum(w*((p>.5)==(y>.5))),brier=np.sum(w*(pw-(y>.5))**2))
rows=[]
for x in tg:
    WT[0]=x['df'].w.values.astype(float)
    t=x['t']; y=yraw(x); prior=[z for z in tg if z['t']<t]
    same=[z for z in prior if z['cls']==x['cls']]; other=[z for z in prior if z['cls']!=x['cls']]
    base=dict(t=t,cls=x['cls'],n=len(y),swing=100*x['swing'],signed=100*x['signed'],n_same=len(same),certified=len(same)>=2)
    for name,tr in (('same',same),('other',other),('all',prior)):
        if not tr: continue
        b,sd=fit(tr,X_raw,yraw); p=X_raw(x)@b
        rows.append(dict(base,model='pooled_'+name,**met(p,y,norm.cdf((p-.5)/sd))))
    if not same: continue
    b,sd=fit(same,X_dev,ydev); dev=X_dev(x)@b
    envs={'persist':np.array([x['E1']]),'oracle':np.array([x['Et']]),
          'v2_signed':x['E1']+np.array([z['signed'] for z in same])*pp(t),
          'unsigned_same':x['E1']+np.array([z['swing'] for z in same]),
          'pooled_swing':x['E1']+np.array([z['swing'] for z in prior])}
    if t in POLL: envs['poll_raw']=np.array([POLL[t]])
    if t in poll_cal: envs['poll_cal']=np.array([poll_cal[t]])
    if t in poll_sgn_pt:
        sc=x['E1']+np.array([z['signed'] for z in same])*pp(t)
        envs['poll_signed']=sc+(poll_sgn_pt[t]-sc.mean())
    for k,Ek in envs.items():
        preds=Ek[:,None]+dev[None,:]; p=preds.mean(0); pw=norm.cdf((preds-.5)/sd).mean(0)
        r=dict(base,model='struct_'+k,env_err=100*(Ek.mean()-x['Et']),**met(p,y,pw))
        if k=='poll_cal': r.update(poll_cal_fallback=bool(poll_cal_fb[t]))
        if k=='poll_signed': r.update(poll_w=poll_w[t],poll_w_fallback=bool(poll_sgn_fb[t]))
        if len(Ek)>1: r.update(scen_lo=100*(Ek.min()-x['E1']),scen_hi=100*(Ek.max()-x['E1']),bracket=bool(Ek.min()<=x['Et']<=Ek.max()))
        rows.append(r)
R=pd.DataFrame(rows)
if OPT=='noredist': R.loc[R.t.isin([2002,2012,2022]),'certified']=False
R.to_csv(f'results2_{OPT}.csv',index=False)

ev=R[R.certified]
print(OPT,sorted(ev.t.unique()))
print(ev.groupby(['model','cls'])[['mae','brier','common']].mean().unstack().round(3).to_string())
