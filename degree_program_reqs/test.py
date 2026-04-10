import requests
import os

url = "https://howdy.tamu.edu/main/api/degree-evaluation/degree-eval-program-info"
headers = {
    # "Accept": "application/json, text/plain, */*",
    # "Accept-Encoding": "gzip, deflate, br, zstd",
    # "Accept-Language": "en-US,en;q=0.9",
    # "Content-Length": "44",   
    # "Content-Type": "application/json; charset=UTF-8",
    "Cookie": os.getenv("HOWDY_COOKIE"),
    # "Host": "howdy.tamu.edu",
    # "Origin": "https://howdy.tamu.edu",
    # "Referer": "https://howdy.tamu.edu/main/home/degree-evaluation-one-ui",
}
payload = {
    "catalogTerm": "202611",
    "program": "BA=SEAL"
}

with open("testing/test.json", "w") as f:
    response = requests.post(url, headers=headers, json=payload)
    f.write(response.text)
