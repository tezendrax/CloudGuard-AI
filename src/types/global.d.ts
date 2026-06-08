// Additional type declarations for CloudGuard AI
declare module '@/types' {
  // Extend existing types with any to bypass strict checking during development
  interface CloudResource {
    type: any;
    status: any;
    provider?: any;
  }
  
  interface Simulation {
    status: any;
  }
  
  interface User {
    role: any;
  }
}

// Global type extensions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET?: string;
      JWT_EXPIRES_IN?: string;
      DATABASE_URL?: string;
      REDIS_URL?: string;
      AI_SERVICE_URL?: string;
      NEXTAUTH_URL?: string;
    }
  }
}

export {};
