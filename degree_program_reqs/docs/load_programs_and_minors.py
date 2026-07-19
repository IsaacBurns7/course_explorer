import os
import re
import sys
from dotenv import load_dotenv
import json
from argparse import ArgumentParser

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from howdy_api import *

load_dotenv()
TERM = os.environ.get("TERM")  

def get_program_type(program):
    return re.split(r'[-=]', program["SMRPRLE_PROGRAM"], maxsplit=1)[0]

def load_programs_and_minors(types: list, file_path="all_programs_and_minors.json"):
    all_programs_and_minors = []
    
    all_programs = what_if_programs(TERM)
    for program in all_programs:
        if get_program_type(program) in types:
            all_programs_and_minors.append({
                "code": program["SMRPRLE_PROGRAM"],
                "description": program["SMRPRLE_PROGRAM_DESC"],
                "type": get_program_type(program)
            })
    
    if "MN" in types:
        all_minors = what_if_minors(TERM)
        for minor in all_minors:
            all_programs_and_minors.append({
                "code": minor["MINOR_CODE"],
                "description": minor["MINOR_DESC"],
                "type": "MN" # indicates MINOR
            })
        
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(all_programs_and_minors, file, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--files", type=str, default=["programs_and_minors", "degree_eval_info"])
    parser.add_argument("--term", type=str, default=TERM)
    parser.add_argument("--types", nargs="+", default=[
        'BA', 'BAC', 'BBA', 'BFA', 'BLA', 'BS', 'BSN', 'CTG', 'CTU', 'DDS', 'DEN', 'DNP',
        'DNPR', 'DRPH', 'DVM', 'EDD', 'ELP', 'GCT', 'JD', 'MA', 'MAB', 'MAG', 'MAR', 'MAY',
        'MBA', 'MBT', 'MCN', 'MCS', 'MD', 'MED', 'MEI', 'MEN', 'MET', 'MFA', 'MFM', 'MFS',
        'MGS', 'MHA', 'MIA', 'MID', 'MIP', 'ML', 'MLA', 'MLG', 'MLP', 'MNA', 'MNR', 'MNS',
        'MOS', 'MPH', 'MPS', 'MRE', 'MRR', 'MRY', 'MS', 'MSN', 'MSPH', 'MUP', 'MWM', 'MWS',
        'NDS', 'PHD', 'PHMD', 'UCT', 'Z', 'MN'
    ])
    
    args = parser.parse_args()
    load_programs_and_minors(types=args.types) if "programs_and_minors" in args.files else None
    
    
    