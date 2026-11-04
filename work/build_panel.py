import pandas as pd, numpy as np, sys
src=sys.argv[1]
d=pd.read_csv(src,dtype={'county_fips':str,'state_fips':str})
h=d[d.office=='house'].copy()
qf=h.quality_flag.fillna('')
h['contested']=~qf.str.contains('one_party_race|excludes_unopposed_seat')
h=h[['year','state_po','county_fips','dem_votes','rep_votes','total_votes','dem_two_party_share','contested']]
h.to_csv('house_panel.csv',index=False)
# environment over contested counties, vote weighted two-party
c=h[h.contested]
E=c.groupby('year').apply(lambda g: g.dem_votes.sum()/(g.dem_votes.sum()+g.rep_votes.sum())).rename('E')
n=c.groupby('year').size().rename('n_contested')
out=pd.concat([E,n],axis=1); out.to_csv('environment.csv'); print(out)
