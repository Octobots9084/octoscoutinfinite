import json
import csv
from collections import Counter

# Load the JSON file
with open('output.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Parse JSON strings
def parse_json_string(s):
    return json.loads(s)

# Extract metrics from auto or teleop
def extract_metrics(stage_data, results):
    counts = Counter()
    for entry in json.loads(stage_data):
        result = entry.get("result")
        if result in results:
            counts[result] += 1
    return counts

# Initialize CSV file with UTF-8 encoding
with open('output.csv', mode='w', newline='', encoding='utf-8-sig') as file:
    writer = csv.writer(file)
    
    # Write header
    writer.writerow(['scoutName', 'matchNumber', 'teamNumberBlueInput', 'teamNumberRedInput', 'redAlgae', 'blueAlgae', 
                     'Algae Left in Red Processor', 'Algae Left in Blue Processor', 'Algae in Net', 'comments', 'timestamp'])
    
    # Process each entry
    for entry in data:
        # Parse metadata
        metadata = parse_json_string(entry['01metaData'])
        scout_name = metadata['scoutName']
        match_number = metadata['matchNumber']
        team_number_blue = metadata['teamNumberBlueInput']
        team_number_red = metadata['teamNumberRedInput']
        
        # Parse starting location
        starting_location = parse_json_string(entry['02startingLocation'])['name']
        
        # Extract auto metrics
        auto_metrics = extract_metrics(entry['03auto'], ["Speaker", "Amp", "Intentional Drop"])
        auto_speaker = auto_metrics.get('Speaker', 0)
        auto_amp = auto_metrics.get('Amp', 0)
        auto_intentional_drop = auto_metrics.get('Intentional Drop', 0)
        
        # Extract teleop metrics
        teleop_metrics = extract_metrics(entry['04teleop'], ["Speaker", "Amp", "Trap", "Ferry", "redAlgae", "blueAlgae"])
        teleop_speaker = teleop_metrics.get('Speaker', 0)
        teleop_amp = teleop_metrics.get('Amp', 0)
        teleop_trap = teleop_metrics.get('Trap', 0)
        teleop_ferry = teleop_metrics.get('Ferry', 0)

        red_algae = teleop_metrics.get('redAlgae', 0)
        blue_algae = teleop_metrics.get('blueAlgae', 0)

        # Parse endgame metrics
        endgame = parse_json_string(entry['05endgame'])
        endgame_park = 1 if endgame['Park'] == 'Successful' else 0
        endgame_onstage = 1 if endgame['Onstage'] == 'Successful' else 0
        endgame_spotlit = 1 if endgame['Spotlit'] == 'Successful' else 0
        endgame_harmony = 1 if endgame['Harmony'] == 'Successful' else 0
        
        # Parse extra data
        extra = parse_json_string(entry['06extra'])
        algae_left_blue = extra['Algae Left in Blue Processor']
        algae_left_red = extra['Algae Left in red Processor']
        algae_in_net = extra['Algae in Net']
        comments = extra['Comments']
        
        # Timestamp
        timestamp = entry['timestamp']
        
        # Write row to CSV
        writer.writerow([scout_name, match_number, team_number_blue, team_number_red, red_algae, blue_algae,
                         algae_left_blue, algae_left_red, algae_in_net, comments])

print("CSV file has been successfully generated!")
