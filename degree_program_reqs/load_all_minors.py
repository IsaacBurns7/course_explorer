import os
import requests

url = "https://howdy.tamu.edu/main/api/degree-evaluation/what-if-minors"

payload = {"rule":1770,"catalogTerm":"202611"}

cookies = {
    "Cookie": os.getenv("HOWDY_COOKIE")
}

with open("testing/minors.json", "w") as f:
    response = requests.post(url, cookies=cookies, json=payload)
    f.write(response.text)