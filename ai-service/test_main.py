import os
import sys

# Ensure pytest can import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app, predictor

def test_health_endpoint():
    # Verify the FastAPI application properties
    assert app.title == "CloudGuard AI - ML Service"
    assert app.version == "2.0.0"

def test_models_loaded():
    # Verify Keras/TensorFlow models are created and configured
    assert len(predictor.models) == 3
    assert 'performance' in predictor.models
    assert 'anomaly' in predictor.models
    assert 'cost' in predictor.models
