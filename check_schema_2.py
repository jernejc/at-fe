import json

try:
    with open('openapi.json', 'r') as f:
        data = json.load(f)

    schemas = data.get('components', {}).get('schemas', {})
    
    if 'FitBreakdownResponse' in schemas:
        print("FitBreakdownResponse Schema:")
        print(json.dumps(schemas['FitBreakdownResponse'], indent=2))
    else:
        print("FitBreakdownResponse not found in schemas")

except Exception as e:
    print(e)
