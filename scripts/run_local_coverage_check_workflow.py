import json,os,sys

def main():
    default_threshold = int(os.environ.get('COVERAGE_THRESHOLD','70'))
    overrides = {
        'notification-service': int(os.environ['NOTIFICATION_THRESHOLD']) if os.environ.get('NOTIFICATION_THRESHOLD') else None,
        'users-service': int(os.environ['USERS_THRESHOLD']) if os.environ.get('USERS_THRESHOLD') else None,
        'rest-service': int(os.environ['REST_THRESHOLD']) if os.environ.get('REST_THRESHOLD') else None,
        'alert-service': int(os.environ['ALERT_THRESHOLD']) if os.environ.get('ALERT_THRESHOLD') else None,
        'weather-service': int(os.environ['WEATHER_THRESHOLD']) if os.environ.get('WEATHER_THRESHOLD') else None,
        'ai-service': int(os.environ['AI_THRESHOLD']) if os.environ.get('AI_THRESHOLD') else None,
        'ingest-service': int(os.environ['INGEST_THRESHOLD']) if os.environ.get('INGEST_THRESHOLD') else None,
    }
    base='coverage-artifacts'
    if not os.path.exists(base):
        print('No coverage artifacts found, skipping threshold check')
        return 0
    failures=[]
    for svc in os.listdir(base):
        p=os.path.join(base,svc,'coverage-summary.json')
        if not os.path.exists(p):
            print(f'No coverage summary for {svc}, skipping')
            continue
        j=json.load(open(p,'r',encoding='utf-8'))
        lines=j.get('total',{}).get('lines',{})
        pct=lines.get('pct',0)
        threshold=overrides.get(svc) if overrides.get(svc) is not None else default_threshold
        print(f'{svc}: lines coverage {pct}% (threshold: {threshold}%)')
        if pct < threshold:
            failures.append((svc,pct,threshold))
    if failures:
        print('Coverage threshold not met for services:')
        for f in failures:
            print(f' - {f[0]}: {f[1]}% < {f[2]}%')
        return 2
    else:
        print('All services meet coverage threshold')
        return 0

if __name__ == '__main__':
    sys.exit(main())
