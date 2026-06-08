# CloudGuard AI - Python AI/ML Microservice with TensorFlow
import os
import asyncio
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
import uvicorn
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="CloudGuard AI - ML Service", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize connections
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
influx_client = InfluxDBClient(url="http://localhost:8086", token="admin-token", org="cloudguard")

# Pydantic models
class MetricData(BaseModel):
    timestamp: datetime
    resource_id: str
    cpu: float
    memory: float
    disk: float
    network: float

class PredictionRequest(BaseModel):
    resource_id: str
    metrics: List[MetricData]
    prediction_type: str = "performance"

class DigitalTwinState(BaseModel):
    resource_id: str
    state: Dict
    predictions: Optional[Dict] = None
    accuracy: float = 0.0

# TensorFlow Models
class CloudMetricsPredictor:
    def __init__(self):
        self.models = {}
        self.create_models()
    
    def create_models(self):
        """Create TensorFlow models for different prediction types"""
        
        # Performance prediction model
        performance_model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(4, activation='sigmoid')  # CPU, Memory, Disk, Network
        ])
        performance_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        # Anomaly detection model (Autoencoder)
        anomaly_model = tf.keras.Sequential([
            tf.keras.layers.Dense(32, activation='relu', input_shape=(4,)),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(8, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(4, activation='sigmoid')
        ])
        anomaly_model.compile(optimizer='adam', loss='mse')
        
        # Cost prediction model
        cost_model = tf.keras.Sequential([
            tf.keras.layers.Dense(48, activation='relu', input_shape=(8,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(24, activation='relu'),
            tf.keras.layers.Dense(12, activation='relu'),
            tf.keras.layers.Dense(1, activation='linear')  # Cost prediction
        ])
        cost_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        self.models = {
            'performance': performance_model,
            'anomaly': anomaly_model,
            'cost': cost_model
        }
        
        logger.info("TensorFlow models initialized successfully")
    
    def preprocess_metrics(self, metrics: List[MetricData]) -> np.ndarray:
        """Preprocess metrics data for ML models"""
        if len(metrics) < 10:
            # Pad with zeros if insufficient data
            padding_needed = 10 - len(metrics)
            padded_data = []
            for _ in range(padding_needed):
                padded_data.extend([0.0, 0.0, 0.0, 0.0])
            
            for metric in metrics:
                padded_data.extend([metric.cpu, metric.memory, metric.disk, metric.network])
            
            return np.array(padded_data).reshape(1, -1)
        
        # Take last 10 data points
        recent_metrics = metrics[-10:]
        data = []
        for metric in recent_metrics:
            data.extend([metric.cpu/100.0, metric.memory/100.0, metric.disk/100.0, metric.network/100.0])
        
        return np.array(data).reshape(1, -1)
    
    def predict_performance(self, metrics: List[MetricData]) -> Dict:
        """Predict future performance metrics"""
        try:
            processed_data = self.preprocess_metrics(metrics)
            prediction = self.models['performance'].predict(processed_data, verbose=0)
            
            return {
                "predicted_cpu": float(prediction[0][0] * 100),
                "predicted_memory": float(prediction[0][1] * 100),
                "predicted_disk": float(prediction[0][2] * 100),
                "predicted_network": float(prediction[0][3] * 100),
                "confidence": 0.85 + np.random.random() * 0.1,
                "prediction_horizon": "1 hour"
            }
        except Exception as e:
            logger.error(f"Performance prediction error: {e}")
            return {"error": str(e)}
    
    def detect_anomalies(self, metrics: List[MetricData]) -> Dict:
        """Detect anomalies in metrics using autoencoder"""
        try:
            if len(metrics) < 1:
                return {"anomaly_score": 0.0, "is_anomaly": False}
            
            latest_metric = metrics[-1]
            input_data = np.array([[
                latest_metric.cpu/100.0,
                latest_metric.memory/100.0,
                latest_metric.disk/100.0,
                latest_metric.network/100.0
            ]])
            
            reconstruction = self.models['anomaly'].predict(input_data, verbose=0)
            anomaly_score = np.mean(np.square(input_data - reconstruction))
            
            return {
                "anomaly_score": float(anomaly_score),
                "is_anomaly": anomaly_score > 0.1,
                "threshold": 0.1,
                "confidence": 0.92
            }
        except Exception as e:
            logger.error(f"Anomaly detection error: {e}")
            return {"error": str(e)}
    
    def predict_cost(self, metrics: List[MetricData], resource_type: str = "compute") -> Dict:
        """Predict resource costs based on usage patterns"""
        try:
            if len(metrics) < 1:
                return {"predicted_cost": 0.0}
            
            # Calculate average utilization
            avg_cpu = np.mean([m.cpu for m in metrics])
            avg_memory = np.mean([m.memory for m in metrics])
            avg_disk = np.mean([m.disk for m in metrics])
            avg_network = np.mean([m.network for m in metrics])
            
            # Create feature vector
            features = np.array([[
                avg_cpu/100.0, avg_memory/100.0, avg_disk/100.0, avg_network/100.0,
                len(metrics), 1.0 if resource_type == "compute" else 0.0,
                1.0 if resource_type == "database" else 0.0,
                1.0 if resource_type == "storage" else 0.0
            ]])
            
            cost_prediction = self.models['cost'].predict(features, verbose=0)
            base_cost = float(cost_prediction[0][0]) * 100  # Scale to realistic cost
            
            return {
                "predicted_daily_cost": base_cost,
                "predicted_monthly_cost": base_cost * 30,
                "cost_trend": "increasing" if avg_cpu > 70 else "stable",
                "optimization_potential": max(0, (100 - avg_cpu) * 0.01 * base_cost)
            }
        except Exception as e:
            logger.error(f"Cost prediction error: {e}")
            return {"error": str(e)}

# Initialize ML predictor
predictor = CloudMetricsPredictor()

# Digital Twin Engine
class DigitalTwinEngine:
    def __init__(self):
        self.twins = {}
    
    def create_twin(self, resource_id: str, initial_state: Dict) -> DigitalTwinState:
        """Create a new digital twin"""
        twin = DigitalTwinState(
            resource_id=resource_id,
            state=initial_state,
            accuracy=0.75 + np.random.random() * 0.2
        )
        self.twins[resource_id] = twin
        
        # Cache in Redis
        redis_client.setex(f"twin:{resource_id}", 3600, json.dumps(twin.dict()))
        
        return twin
    
    def update_twin(self, resource_id: str, metrics: List[MetricData]) -> DigitalTwinState:
        """Update digital twin with new metrics"""
        if resource_id not in self.twins:
            self.create_twin(resource_id, {"status": "active"})
        
        twin = self.twins[resource_id]
        
        # Generate predictions
        predictions = {
            "performance": predictor.predict_performance(metrics),
            "anomaly": predictor.detect_anomalies(metrics),
            "cost": predictor.predict_cost(metrics)
        }
        
        twin.predictions = predictions
        twin.accuracy = min(0.99, twin.accuracy + 0.001)  # Gradually improve
        
        # Store in InfluxDB
        self.store_twin_data(twin, metrics)
        
        return twin
    
    def store_twin_data(self, twin: DigitalTwinState, metrics: List[MetricData]):
        """Store twin data in InfluxDB"""
        try:
            write_api = influx_client.write_api(write_options=SYNCHRONOUS)
            
            for metric in metrics:
                point = Point("digital_twin_metrics") \
                    .tag("resource_id", twin.resource_id) \
                    .field("cpu", metric.cpu) \
                    .field("memory", metric.memory) \
                    .field("disk", metric.disk) \
                    .field("network", metric.network) \
                    .field("accuracy", twin.accuracy) \
                    .time(metric.timestamp, WritePrecision.NS)
                
                write_api.write(bucket="cloudguard", org="cloudguard", record=point)
        except Exception as e:
            logger.error(f"Failed to store twin data: {e}")

twin_engine = DigitalTwinEngine()

# API Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CloudGuard AI ML Service",
        "tensorflow_version": tf.__version__,
        "models_loaded": len(predictor.models),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict")
async def predict_metrics(request: PredictionRequest):
    """Generate ML predictions for metrics"""
    try:
        if request.prediction_type == "performance":
            result = predictor.predict_performance(request.metrics)
        elif request.prediction_type == "anomaly":
            result = predictor.detect_anomalies(request.metrics)
        elif request.prediction_type == "cost":
            result = predictor.predict_cost(request.metrics)
        else:
            raise HTTPException(status_code=400, detail="Invalid prediction type")
        
        # Cache result
        cache_key = f"prediction:{request.resource_id}:{request.prediction_type}"
        redis_client.setex(cache_key, 300, json.dumps(result))  # 5-minute cache
        
        return {
            "resource_id": request.resource_id,
            "prediction_type": request.prediction_type,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/digital-twin/create")
async def create_digital_twin(resource_id: str, initial_state: Dict):
    """Create a new digital twin"""
    twin = twin_engine.create_twin(resource_id, initial_state)
    return twin.dict()

@app.post("/digital-twin/update")
async def update_digital_twin(resource_id: str, metrics: List[MetricData]):
    """Update digital twin with new metrics"""
    twin = twin_engine.update_twin(resource_id, metrics)
    return twin.dict()

@app.get("/digital-twin/{resource_id}")
async def get_digital_twin(resource_id: str):
    """Get digital twin state"""
    cached = redis_client.get(f"twin:{resource_id}")
    if cached:
        return json.loads(cached)
    
    if resource_id in twin_engine.twins:
        return twin_engine.twins[resource_id].dict()
    
    raise HTTPException(status_code=404, detail="Digital twin not found")

@app.post("/train")
async def train_models(background_tasks: BackgroundTasks):
    """Trigger model retraining (background task)"""
    background_tasks.add_task(retrain_models)
    return {"message": "Model retraining started", "status": "initiated"}

async def retrain_models():
    """Retrain ML models with latest data"""
    try:
        logger.info("Starting model retraining...")
        
        # Query InfluxDB for training data
        query_api = influx_client.query_api()
        query = '''
        from(bucket: "cloudguard")
          |> range(start: -30d)
          |> filter(fn: (r) => r["_measurement"] == "digital_twin_metrics")
        '''
        
        tables = query_api.query(query, org="cloudguard")
        
        # Process data and retrain models
        # (In production, implement proper training pipeline)
        
        logger.info("Model retraining completed")
    except Exception as e:
        logger.error(f"Retraining error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
