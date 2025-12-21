import json

try:
    with open('openapi.json', 'r') as f:
        data = json.load(f)

    paths = data.get('paths', {})
    
    # Signle Provenance
    sig_path = '/api/v1/companies/{domain}/signals/{signal_id}'
    if sig_path in paths:
        print("Signal Provenance Response:")
        print(json.dumps(paths[sig_path]['get']['responses']['200'], indent=2))
    
    # Fit Breakdown
    fit_path = '/api/v1/companies/{domain}/fits/{product_id}/breakdown'
    if fit_path in paths:
        print("\nFit Breakdown Response:")
        print(json.dumps(paths[fit_path]['get']['responses']['200'], indent=2))

except Exception as e:
    print(e)
