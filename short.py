# %%
import pandas as pd
import re
from difflib import get_close_matches

# --- Load & preprocess dataset ---
df = pd.read_csv("taylor.csv")

# Drop unnecessary columns
df = df.drop(columns=[
    "Unnamed: 0", "release_date", "acousticness", 
    "danceability", "energy", "instrumentalness", "liveness", 
    "loudness", "speechiness", "tempo", "valence", 
    "popularity", "duration_ms"
])

# --- Abbreviation logic ---
def make_abbreviation(title):
    stopwords = {"feat", "+"}
    result_parts = []
    parts = re.split(r"(\(.*?\))", str(title))

    for part in parts:
        if not part:
            continue
        if part.startswith("(") and part.endswith(")"):
            inner = part[1:-1].strip()
            if "Taylor" in inner and "Version" in inner:
                result_parts.append("(TV)")
            elif "From The Vault" in inner:
                result_parts.append("(FTV)")
            else:
                tokens =re.findall(r"[A-Za-z0-9]+'?[A-Za-z0-9]+", inner)
                abbr = "".join(word[0].upper() for word in tokens if word.lower() not in stopwords)
                result_parts.append(f"({abbr})")
        else:
            tokens = re.findall(r"[A-Za-z0-9]+'?[A-Za-z0-9]+", part)
            abbr = "".join(word[0].upper() for word in tokens if word.lower() not in stopwords)
            result_parts.append(abbr)
    
    return "".join(result_parts)


df["Short Form"] = df["name"].apply(make_abbreviation)

def search_long_to_short(user_input, similarity_threshold=0.6):
    """Search for shortforms based on longform input (partial matching allowed)"""
    user_input_lower = user_input.lower().strip()
    matches = []
    
    # Use global df
    global df

    # First try exact substring matches
    for i, row in df.iterrows():
        name_lower = str(row["name"]).lower()
        if user_input_lower in name_lower:
            play_url = f"https://open.spotify.com/track/{row['id']}"
            matches.append((row["name"], row["Short Form"], 'exact', play_url))
    
    # If no exact matches, try fuzzy matching
    if not matches:
        name_list = [str(name).lower() for name in df["name"]]
        close_names = get_close_matches(user_input_lower, name_list, n=5, cutoff=similarity_threshold)
        
        for close_name in close_names:
            matching_row = df[df["name"].str.lower() == close_name].iloc[0]
            play_url = f"https://open.spotify.com/track/{matching_row['id']}"
            matches.append((matching_row["name"], matching_row["Short Form"], 'fuzzy', play_url))
    
    return matches


def search_short_to_long(user_input, similarity_threshold=0.6):
    """Search for longforms based on shortform input (partial matching allowed)"""
    user_input_lower = user_input.lower().strip()
    matches = []

    global df
    
    # First try exact substring matches
    for i, row in df.iterrows():
        short_form_lower = str(row["Short Form"]).lower()
        if user_input_lower in short_form_lower:
            play_url = f"https://open.spotify.com/track/{row['id']}"
            matches.append((row["Short Form"], row["name"], 'exact', play_url))
    
    # If no exact matches, try fuzzy matching
    if not matches:
        shortform_list = [str(sf).lower() for sf in df["Short Form"]]
        close_shortforms = get_close_matches(user_input_lower, shortform_list, n=5, cutoff=similarity_threshold)
        
        for close_sf in close_shortforms:
            matching_row = df[df["Short Form"].str.lower() == close_sf].iloc[0]
            play_url = f"https://open.spotify.com/track/{matching_row['id']}"
            matches.append((matching_row["Short Form"], matching_row["name"], 'fuzzy', play_url))
    
    return matches





