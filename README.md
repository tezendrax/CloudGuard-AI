# <p align="center">🛡️ CloudGuard AI</p>

<p align="center">
  <strong>Next-Generation AI-Powered Cloud Management & Autonomous Operations Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TensorFlow-2.0-orange?style=for-the-badge&logo=tensorflow" alt="TensorFlow" />
  <img src="https://img.shields.io/badge/FastAPI-0.100-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
</p>

---

## 🚀 Project Overview

CloudGuard AI is a revolutionary, enterprise-grade cloud management platform that transcends traditional monitoring. By merging **Digital Twin technology** with **Deep Learning**, CloudGuard AI provides an autonomous ecosystem for multi-cloud orchestration. It doesn't just watch your infrastructure—it understands it, predicts its future, and optimizes it in real-time.

Built for the scale of modern DevOps, CloudGuard AI offers a unified "Single Pane of Glass" for **AWS, Azure, and GCP**, enabling teams to manage complex multi-cloud environments with unprecedented clarity and AI-driven precision.

---

## 🧠 Architecture Diagram

The system follows a high-performance microservices architecture designed for real-time data ingestion and predictive processing.

```mermaid
graph TD
    subgraph Client_Layer ["Client Layer (Edge)"]
        NextJS["Next.js 14 App Router"]
        Framer["Framer Motion / Radix UI"]
        SocketIO_C["Socket.io Client (Live Feed)"]
    end

    subgraph API_Layer ["API & Intelligence Layer"]
        TRPC["tRPC / Node.js Backend"]
        FastAPI["FastAPI (AI Microservice)"]
        TF["TensorFlow Analytics Engine"]
    end

    subgraph Data_Layer ["Persistence & Cache"]
        Postgres[(PostgreSQL / Prisma)]
        Redis[(Redis Pub/Sub & Cache)]
        InfluxDB[(InfluxDB Time-Series)]
        Pinecone[(Pinecone Vector DB)]
    end

    subgraph Infrastructure ["Multi-Cloud Adapters"]
        AWS["AWS CloudWatch/EC2"]
        Azure["Azure Monitor/Compute"]
        GCP["GCP Stackdriver"]
    end

    NextJS --> TRPC
    NextJS --> SocketIO_C
    TRPC --> Postgres
    TRPC --> Redis
    SocketIO_C <--> Redis
    FastAPI --> TF
    FastAPI --> InfluxDB
    FastAPI --> Pinecone
    TRPC <--> FastAPI
    FastAPI --> Infrastructure
```

### 🔄 Data Flow Detail
1. **Cloud Adapters**: Collect metrics (CPU, Memory, Cost, Security) via native SDKs.
2. **AI Microservice**: Ingests metrics into InfluxDB and performs TensorFlow-based forecasting.
3. **Real-time Pipeline**: Broadcasts anomalies and predictive states via Socket.io.
4. **Unified Portal**: Displays the "Digital Twin" and real-time dashboards to the user.

---

## ⚙️ Tech Stack

### 🖥️ Frontend (Product Experience)
- **Next.js 14 (App Router)**: Hybrid SSR/Client-side rendering.
- **Tailwind CSS + Radix UI**: Sleek, accessible design system.
- **Framer Motion**: Micro-interactions and fluid transitions.
- **Zustand + TanStack Query**: State and data management.

### 🧠 Backend & Intelligence
- **tRPC / REST / GraphQL**: Type-safe API layer.
- **Python FastAPI**: Heavy-duty AI/ML processing service.
- **TensorFlow**: Metric forecasting and anomaly detection engine.
- **Socket.io**: Low-latency bidirectional broadcasting.

### 💾 Persistence & Cache
- **PostgreSQL (Prisma)**: Primary relational data store.
- **Redis**: Caching and real-time state synchronization.
- **InfluxDB**: High-ingestion time-series metrics.
- **Pinecone**: Vector database for AI search and anomaly profiling.

---

## 🎯 Features

### 💎 Unified Multi-Cloud Dashboard
Manage AWS, Azure, and GCP resources from a single interface.
![Dashboard](public/assets/dashboard.png)

### 🤖 AI-Powered Predictive Analytics
Advanced TensorFlow forecasting for resource usage and cost trends.
![Predictive Analytics](public/assets/analytics.png)

### 🔄 Digital Twin Ecosystem
Virtual replicas of your infrastructure for "What-If" simulations.
![Digital Twin Engine](public/assets/digital_twin.png)

### 🔐 Autonomous Security Ops
Real-time behavioral analysis and global threat detection mapping.
![Security Map](public/assets/security.png)

---

## 🔥 Unique Innovations

- **Metric-to-Vector Embedding**: Converting raw metrics into high-dimensional vectors for fast semantic search of infrastructure patterns.
- **Autonomous Scaling Guardrails**: Dynamic, AI-driven scaling boundaries that adapt to business cycles.
- **Real-time Cost Simulation**: Instant financial impact prediction for architectural changes.

---

## 🛠️ Configuration & Setup

### 📦 Prerequisites
- **Node.js**: 20+ LTS
- **Python**: 3.10+
- **Docker**: Desktop or Engine 24+
- **Databases**: PostgreSQL 15, Redis 7, InfluxDB 2.0

### ⚙️ Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Application
APP_NAME="CloudGuard AI"
NODE_ENV=development

# Database Connections
DATABASE_URL="postgresql://user:pass@localhost:5432/cloudguard"
REDIS_URL="redis://localhost:6379"
INFLUXDB_URL="http://localhost:8086"
INFLUXDB_TOKEN="your-token"

# Authentication
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"

# Cloud Adapters
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AZURE_CLIENT_ID="your-azure-id"
AZURE_CLIENT_SECRET="your-azure-secret"
GCP_PROJECT_ID="your-gcp-project"

# AI/ML
AI_SERVICE_URL="http://localhost:8001"
OPENAI_API_KEY="your-optional-openai-key"
```

### ☁️ Cloud Provider Setup

- **AWS**: Create an IAM user with `CloudWatchReadOnlyAccess` and `EC2ReadOnlyAccess`.
- **Azure**: Register an app in Microsoft Entra ID and grant `Monitoring Reader` role.
- **GCP**: Create a service account with `Monitoring Viewer` permission and download the JSON key.

---

## 🧪 Quality & Testing

### 🚀 Running Tests
```bash
# Unit & Component Testing
npm test

# E2E Testing (Playwright)
npm run test:e2e

# Integration Testing
npm run test:integration

# AI Service Testing
cd ai-service && pytest
```

### 🛠️ Diagnostic Utilities
We provide a suite of scripts for system health and validation in the `/scripts` folder:
- `test-all-connections.js`: Validates all DB and AI service connectivity.
- `test-ui-components.js`: Verifies the integrity of core Radix UI components.
- `validate-and-fix.js`: Automated fix script for common configuration issues.

---

## 🚀 Deployment

### 🐳 Docker Compose
```bash
# Production Ready Deployment
docker-compose -f docker-compose.full.yml up -d --build

# Scaling specific services
docker-compose up --scale frontend=3 --scale ai-service=2 -d
```

### ☸️ Kubernetes
Apply the orchestrator manifests from the `/kubernetes` directory:
```bash
kubectl apply -k kubernetes/production
```

---

## 🏗️ Performance Targets
- **API Response**: < 100ms average.
- **Real-time Latency**: < 50ms WebSocket broadcast.
- **AI Forecasting**: < 200ms inference time.
- **Metric Ingestion**: 100k+ points/sec capacity.

---

## 📄 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.

---

## 🌐 References & Support
- **Architecture Deep Dive**: [Architecture Methodology](docs/real-time-data-sources.md)
- **Cost Optimization Theory**: [Theory of Optimization](docs/cost-optimization-theory-and-tech.md)
- **Live Demo**: [demo.cloudguard-ai.com](https://demo.cloudguard-ai.com)
- **Contact**: support@cloudguard-ai.com

Built with ❤️ by the **CloudGuard AI Team**. *Revolutionizing cloud management through artificial intelligence.*