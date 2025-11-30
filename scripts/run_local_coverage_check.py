import json, os, sys

def main():
    threshold = int(os.environ.get('COVERAGE_THRESHOLD', '70'))
    base = 'coverage-artifacts'
    if not os.path.exists(base):
        print('No coverage-artifacts directory, nothing to check')
        return 0
    failures = []
    for svc in os.listdir(base):
        p = os.path.join(base, svc, 'coverage-summary.json')
        if not os.path.exists(p):
            print(f'No coverage summary for {svc}, skipping')
            continue
        with open(p, 'r', encoding='utf-8') as f:
            j = json.load(f)
        pct = j.get('total', {}).get('lines', {}).get('pct', 0)
        print(f'{svc}: lines coverage {pct}%')
        # Check for per-service override env var e.g. REST_THRESHOLD or NOTIFICATION_THRESHOLD
        env_var = svc.upper().replace('-', '_') + '_THRESHOLD'
        svc_threshold = os.environ.get(env_var)
        if svc_threshold:
            thr = int(svc_threshold)
        else:
            thr = threshold
        print(f' -> threshold for {svc}: {thr}%')
        if pct < thr:
            failures.append((svc, pct, thr))
    if failures:
        print('Coverage threshold not met:')
        for f in failures:
            print(f' - {f[0]}: {f[1]}% < {f[2]}%')
        return 2
    print('All services meet coverage thresholds')
    return 0

if __name__ == '__main__':
    sys.exit(main())
