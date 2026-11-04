import pandas as pd, numpy as np, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
plt.rcParams.update({'font.family':'serif','font.serif':['Times New Roman','Liberation Serif','DejaVu Serif'],'font.size':10,
 'axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#52514e','axes.labelcolor':'#0b0b0b','xtick.color':'#52514e','ytick.color':'#52514e'})
B,O,A,Y,G='#2a78d6','#eb6834','#1baf7a','#eda100','#8a8985'
E=pd.read_csv('environment.csv',index_col=0)
R=pd.read_csv('results2_base.csv')
PRES=set(range(1992,2025,4))
def pp(t): return -1 if t<=1992 else 1 if t<=2000 else -1 if t<=2008 else 1 if t<=2016 else -1 if t<=2020 else 1 if t<=2024 else -1
# Fig1 environment
fig,ax=plt.subplots(figsize=(6.5,2.8))
yrs=E.index.values; e=100*E.E.values
for a,b,p in [(1989,1993,-1),(1993,2001,1),(2001,2009,-1),(2009,2017,1),(2017,2021,-1),(2021,2025,1)]:
    ax.axvspan(a,b,color='#e8eef8' if p==1 else '#f6ebe5',lw=0,zorder=0)
ax.plot(yrs,e,color='#52514e',lw=1.5,zorder=2)
pm=[y in PRES for y in yrs]
ax.scatter(yrs[pm],e[pm],marker='o',s=40,color=B,zorder=3,label='Presidential year',edgecolor='white',lw=1)
ax.scatter(yrs[~np.array(pm)],e[~np.array(pm)],marker='s',s=40,color=O,zorder=3,label='Midterm year',edgecolor='white',lw=1)
ax.axhline(50,color='#bdbcb8',lw=0.8,zorder=1)
ax.set_ylabel('Democratic two-party\nHouse share (%)'); ax.set_xticks(range(1990,2025,4))
ax.legend(frameon=False,loc='upper left',ncol=2,fontsize=9)
fig.tight_layout(); fig.savefig('fig1_environment.png',dpi=300); plt.close()
# Fig2 common share
ev=R[R.certified]
models=[('pooled_all','Pooled, all classes'),('pooled_other','Pooled, other class'),('pooled_same','Pooled, same class'),('struct_persist','Persistence environment'),('struct_unsigned_same','Same-class, unsigned'),('struct_v2_signed','Same-class, signed (v2)'),('struct_oracle','Oracle environment')]
g=ev.groupby(['model','cls']).common.mean().unstack()
fig,ax=plt.subplots(figsize=(6.5,3.2))
x=np.arange(len(models)); w=0.38
ax.bar(x-w/2-0.01,[100*g.loc[m,'M'] for m,_ in models],w,color=O,label='Midterm targets')
ax.bar(x+w/2+0.01,[100*g.loc[m,'P'] for m,_ in models],w,color=B,label='Presidential targets')
for i,(m,_) in enumerate(models):
    ax.text(i-w/2,100*g.loc[m,'M']+0.6,f"{100*g.loc[m,'M']:.0f}",ha='center',fontsize=8)
    ax.text(i+w/2,100*g.loc[m,'P']+0.6,f"{100*g.loc[m,'P']:.0f}",ha='center',fontsize=8)
ax.set_xticks(x); ax.set_xticklabels([l for _,l in models],rotation=25,ha='right',fontsize=8.5)
ax.set_ylabel('Common error share\nof county MSE (%)'); ax.legend(frameon=False,fontsize=9)
fig.tight_layout(); fig.savefig('fig2_common_share.png',dpi=300); plt.close()
# Fig3 bias per year
fig,axs=plt.subplots(1,2,figsize=(6.5,3.0),sharey=True)
for ax,cls,ttl in [(axs[0],'M','Midterm targets'),(axs[1],'P','Presidential targets')]:
    s=ev[ev.cls==cls]
    for m,c,mk,l in [('pooled_all',O,'s','Pooled, all classes'),('struct_persist',A,'^','Persistence'),('struct_v2_signed',B,'o','Same-class, signed (v2)'),('struct_poll_cal',Y,'D','Polls, calibrated')]:
        d=s[s.model==m].sort_values('t')
        if not len(d): continue
        ax.plot(d.t,d.bias,color=c,marker=mk,ms=6,lw=1.2,label=l)
    ax.axhline(0,color='#bdbcb8',lw=0.8); ax.set_title(ttl,fontsize=10); ax.set_xticks(sorted(s.t.unique())); ax.tick_params(axis='x',rotation=60,labelsize=8)
axs[0].set_ylabel('Mean county error (pp)\n(positive = Democratic overstatement)')
axs[1].legend(frameon=False,fontsize=8,loc='upper right')
fig.tight_layout(); fig.savefig('fig3_bias.png',dpi=300); plt.close()
# Fig4 scenarios
v=R[(R.model=='struct_v2_signed')&R.certified].sort_values('t')
fig,ax=plt.subplots(figsize=(6.5,3.3))
for i,r in enumerate(v.itertuples()):
    c=O if r.cls=='M' else B
    ax.plot([i,i],[r.scen_lo,r.scen_hi],color=c,lw=6,alpha=0.35,solid_capstyle='butt')
    ax.scatter(i,r.swing,color='#0b0b0b',marker='D' if r.bracket else 'x',s=30,zorder=3)
# 2026 scenarios from pre-2026 midterms
mid=R[(R.model=='struct_v2_signed')&(R.cls=='M')].drop_duplicates('t')
sig=mid.signed.values  # signed swings of 1994..2022 midterm targets
s26=np.array([-100*(E.E[t]-E.E[t-2])*pp(t) for t in range(1994,2023,4)])
i=len(v); ax.plot([i,i],[s26.min(),s26.max()],color=O,lw=6,alpha=0.35,solid_capstyle='butt')
ax.set_xticks(range(len(v)+1)); ax.set_xticklabels([str(t) for t in v.t]+['2026'],rotation=60,fontsize=8)
ax.axhline(0,color='#bdbcb8',lw=0.8); ax.set_ylabel('National swing toward\nDemocrats (pp)')
from matplotlib.lines import Line2D
ax.legend(handles=[Line2D([],[],color=O,lw=6,alpha=.35,label='Scenario range, midterm'),Line2D([],[],color=B,lw=6,alpha=.35,label='Scenario range, presidential'),
  Line2D([],[],color='#0b0b0b',marker='D',ls='',label='Realized, inside range'),Line2D([],[],color='#0b0b0b',marker='x',ls='',label='Realized, outside range')],frameon=False,fontsize=7.5,loc='lower center',bbox_to_anchor=(0.5,1.0),ncol=4,handlelength=1.5)
fig.tight_layout(); fig.savefig('fig4_scenarios.png',dpi=300); plt.close()
print('2026 scenario swings toward D:',np.round(np.sort(s26),2), 'mean',s26.mean().round(2))
# Fig5 national environment error by year (certified targets)
if 'struct_poll_cal' in set(ev.model):
    fig,ax=plt.subplots(figsize=(6.5,3.0))
    for m,c,mk,l in [('struct_persist',A,'^','Persistence'),('struct_v2_signed',B,'o','Same-class, signed (v2)'),('struct_poll_cal',Y,'D','Polls, calibrated'),('struct_poll_signed',O,'s','Polls + signed')]:
        d=ev[ev.model==m].sort_values('t'); ax.plot(d.t,d.env_err.abs(),color=c,marker=mk,ms=6,lw=1.2,label=l)
    ax.set_ylabel('National environment error\n|Ê − E| (pp)'); ax.set_xticks(sorted(ev.t.unique())); ax.tick_params(axis='x',rotation=60,labelsize=8)
    ax.legend(frameon=False,fontsize=8,loc='upper right')
    fig.tight_layout(); fig.savefig('fig5_env_error.png',dpi=300); plt.close()
