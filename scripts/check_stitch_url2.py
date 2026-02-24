import urllib.request
import urllib.error
import concurrent.futures

project_id = "16763316819467624605"
screen_id = "0a73768aa6b14d4e90b1de1c7dce16d9"

buckets = [
    "adash-export-prod", "adash-exports", "adash-export", 
    "stitch-artifacts", "stitch-artifacts-prod", 
    "stitch-exports", "stitch-exports-prod", 
    "stitch-export", "stitch-export-prod",
    "idx-stitch-artifacts", "idx-stitch-exports",
    "stitch-prod-artifacts", "stitch-prod-exports",
    "stitch", "adash", "stitch-app", "stitch-code",
    "makani-artifacts", "makani-exports" # makani is another codename
]

formats = [
    f"/{project_id}/{screen_id}",
    f"/{project_id}/{screen_id}/index.html",
    f"/{project_id}/{screen_id}.zip",
    f"/{project_id}/screens/{screen_id}",
    f"/{project_id}/screens/{screen_id}/index.html",
    f"/{project_id}/screens/{screen_id}.zip",
]

urls = []
for bucket in buckets:
    for fmt in formats:
        urls.append(f"https://storage.googleapis.com/{bucket}{fmt}")

def check_url(url):
    try:
        req = urllib.request.Request(url, method='HEAD')
        response = urllib.request.urlopen(req, timeout=5)
        if response.status == 200:
            return url
    except Exception:
        pass
    return None

print(f"Checking {len(urls)} URLs...")
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = executor.map(check_url, urls)
    for res in results:
        if res:
            print(f"FOUND: {res}")
            break
else:
    print("Done checking.")
