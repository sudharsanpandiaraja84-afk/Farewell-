import pandas as pd
import numpy as np
import random
from datetime import datetime

# Set seed for reproducibility
np.random.seed(42)

def generate_meme_data(num_samples=1000):
    topics = ['Politics', 'Animals', 'Relatable', 'Tech', 'Sports', 'Celebs']
    
    data = []
    
    for _ in range(num_samples):
        topic = np.random.choice(topics)
        
        # Simulate Caption Length (longer captions might be less viral generally, but depends)
        caption_length = int(np.random.normal(50, 20))
        caption_length = max(5, min(caption_length, 280)) # Clamp between 5 and 280 chars
        
        # Simulate Sentiment Score (-1.0 to 1.0)
        sentiment_score = np.round(np.random.uniform(-1.0, 1.0), 2)
        
        # Simulate Posting Time (0-23 hours)
        posting_time = np.random.randint(0, 24)
        
        # Logic for Virality (Probability)
        # Base probability
        prob_viral = 0.3 
        
        # Adjust based on Topic
        if topic in ['Relatable', 'Animals']:
            prob_viral += 0.2
        elif topic == 'Politics':
            prob_viral += 0.1
            
        # Adjust based on Time (Prime time 18:00 - 22:00)
        if 18 <= posting_time <= 22:
            prob_viral += 0.15
        elif 2 <= posting_time <= 6: # Middle of night
            prob_viral -= 0.1
            
        # Adjust based on Sentiment (High emotion - pos or neg - often goes viral)
        if abs(sentiment_score) > 0.7:
            prob_viral += 0.1
            
        # Adjust based on Caption Length (Short is often better)
        if caption_length < 30:
            prob_viral += 0.1
        elif caption_length > 100:
            prob_viral -= 0.05
            
        # Clamp probability
        prob_viral = max(0.0, min(prob_viral, 1.0))
        
        # Determine Outcome
        is_viral = np.random.choice([0, 1], p=[1-prob_viral, prob_viral])
        
        data.append([topic, sentiment_score, caption_length, posting_time, is_viral])
        
    df = pd.DataFrame(data, columns=['topic_category', 'sentiment_score', 'caption_length', 'posting_time', 'is_viral'])
    
    return df

if __name__ == "__main__":
    print("Generating synthetic meme data...")
    df = generate_meme_data(1000)
    output_file = 'meme_data.csv'
    df.to_csv(output_file, index=False)
    print(f"Data saved to {output_file}")
    print(df.head())
    print("\nClass distribution:")
    print(df['is_viral'].value_counts(normalize=True))
