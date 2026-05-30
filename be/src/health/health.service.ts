import { Injectable } from "@nestjs/common";

export type HealthCheckResponse = {
  status: "ok";
  timestamp: string;
};

@Injectable()
export class HealthService {
  getHealth(): HealthCheckResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
