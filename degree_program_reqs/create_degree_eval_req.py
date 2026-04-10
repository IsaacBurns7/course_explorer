import requests
import os

url = "https://howdy.tamu.edu/main/api/degree-evaluation/what-if-submit"

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

payload = {"term_in":"202611","catlg_term_in":"202611","program_in":"BA=GLST","eval_term_in":"202631","levl_in":"UG","degc_in":"BA","coll_in":"AT","camp_in":"CS","sobcurr_rule_in":2185,"sorcmjr_rule_1_1_in":"","sorcmjr_rule_1_2_in":"","sorccon_rule_1_1_in":"","sorccon_rule_1_2_in":"","sorccon_rule_1_3_in":"","sorccon_rule_121_in":"","sorccon_rule_122_in":"","sorccon_rule_123_in":"","sorcmnr_rule_1_1_in":"","sorcmnr_rule_1_2_in":"","majr_code_1_1_in":"GLST","dept_code_1_1_in":"GLAC","majr_code_conc_1_1_in":"","majr_code_conc_1_2_in":"","majr_code_conc_1_3_in":"","majr_code_1_2_in":"","dept_code_1_2_in":"","majr_code_conc_121_in":"","majr_code_conc_122_in":"","majr_code_conc_123_in":"","majr_code_minr_1_1_in":"","majr_code_minr_1_2_in":"","dflt_ip_in":"Y"}
response = requests.post(url, headers=headers, json=payload)
print(response.json())