export interface Team {
  id: string;
  name: string;
  description: string | null;
  agentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TeamAgent {
  teamId: string;
  agentId: string;
  role: string | null;
}
