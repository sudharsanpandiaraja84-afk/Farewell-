import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

def train_meme_model():
    # 1. Load Data
    try:
        df = pd.read_csv('meme_data.csv')
    except FileNotFoundError:
        print("Error: meme_data.csv not found. Please run generate_data.py first.")
        return

    print("Data loaded. Shape:", df.shape)

    # 2. Preprocessing
    # Define features and target
    X = df.drop('is_viral', axis=1)
    y = df['is_viral']

    # Define categorical and numerical features
    categorical_features = ['topic_category']
    numerical_features = ['sentiment_score', 'caption_length', 'posting_time']

    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    # 3. Create Pipeline
    # Using Random Forest Classifier
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))])

    # 4. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 5. Train Model
    print("Training model...")
    clf.fit(X_train, y_train)

    # 6. Evaluate
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # 7. Feature Importance (Extracting from Pipeline)
    # Get feature names from one-hot encoder
    ohe = clf.named_steps['preprocessor'].named_transformers_['cat']
    feature_names = numerical_features + list(ohe.get_feature_names_out(categorical_features))
    
    importances = clf.named_steps['classifier'].feature_importances_
    
    # Create DataFrame for visualization
    feature_imp_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
    feature_imp_df = feature_imp_df.sort_values(by='Importance', ascending=False)
    
    print("\nFeature Importances:")
    print(feature_imp_df)

    # Plot
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=feature_imp_df)
    plt.title('Feature Importance for Meme Virality')
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    print("Feature importance plot saved to feature_importance.png")

if __name__ == "__main__":
    train_meme_model()
