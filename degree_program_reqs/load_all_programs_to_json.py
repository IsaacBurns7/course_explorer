import requests
import os

url = "https://howdy.tamu.edu/main/api/degree-evaluation/what-if-programs?catalogTerm=202611"
cookies = {
    "Cookie": os.getenv("HOWDY_COOKIE")
}

with open("testing/programs.json", "w") as f:
    response = requests.get(url, cookies=cookies)
    f.write(response.text)