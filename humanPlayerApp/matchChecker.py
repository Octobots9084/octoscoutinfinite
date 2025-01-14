import json

# Load JSON data from a file
file_path = 'output.json'  # Replace with your actual file path
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# List of required keys
required_keys = ["01metaData", "02startingLocation", "03auto", "04teleop", "05endgame", "06extra"]

# Dictionary to track match counts by matchNumber
match_number_count = {}

# Check each match for missing data points and track match counts
matches_with_missing_data = []
for match in data:
    # Check if all required keys are present
    missing_keys = [key for key in required_keys if key not in match]
    if missing_keys:
        matches_with_missing_data.append({
            "match": match,
            "missing_keys": missing_keys
        })
    
    # Extract matchNumber from 01metaData
    match_metadata = json.loads(match.get("01metaData", "{}"))
    match_number = match_metadata.get("matchNumber")
    
    # Count occurrences of each matchNumber
    if match_number:
        if match_number not in match_number_count:
            match_number_count[match_number] = 0
        match_number_count[match_number] += 1

# Output matches with missing data points
print("Matches missing required data points:")
for match_info in matches_with_missing_data:
    print(f"Match missing data points: {match_info['missing_keys']}")
    print(f"Match data: {match_info['match']}\n")

# Output matches that do not have exactly 6 data points
print("Matches with incorrect number of data points (should be 6):")
for match_number, count in match_number_count.items():
    if count != 6:
        print(f"Match number {match_number} has {count} data points instead of 6.")
