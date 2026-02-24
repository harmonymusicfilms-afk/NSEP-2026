import urllib.request
import urllib.error

project_id = "16763316819467624605"
screen_id = "0a73768aa6b14d4e90b1de1c7dce16d9"

bases = [
    "https://storage.googleapis.com/adash-export-prod",
    "https://storage.googleapis.com/stitch-artifacts",
    "https://storage.googleapis.com/stitch-exports",
    "https://storage.googleapis.com/stitch-export",
    "https://stitch.google.com/api/export",
    "https://storage.googleapis.com/adash-export",
    "https://storage.googleapis.com/adash-exports",
    "https://adash-export-prod.storage.googleapis.com"
]

suffixes = [
    f"/{project_id}/{screen_id}/index.html",
    f"/{project_id}/{screen_id}.zip",
    f"/{project_id}/{screen_id}",
    f"/project_{project_id}/screen_{screen_id}.zip"
]

for base in bases:
    for suffix in suffixes:
        url = base + suffix
        try:
            req = urllib.request.Request(url, method='HEAD')
            response = urllib.request.urlopen(req, timeout=3)
            if response.status == 200:
                print(f"FOUND: {url}")
        except urllib.error.URLError as e:
            pass
        except Exception as e:
            pass

print("Done checking.")
