import { ClassificationResult, ProductItem } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in frontend/.env');
}

export interface HealthStatus {
  status: 'ready' | 'loading' | 'error';
  model?: string;
  device?: string;
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status === 'ready' ? 'ready' : 'loading',
        model: data.model,
        device: data.device,
      };
    }
    return { status: 'loading' };
  } catch {
    return { status: 'error' };
  }
}

export async function classifyProductApi(
  product: ProductItem,
  signal?: AbortSignal
): Promise<ClassificationResult> {
  const payload = {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
  };

  const res = await fetch(`${API_BASE}/api/classify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Inference error (${res.status}): ${errText}`);
  }

  const data: ClassificationResult = await res.json();
  return data;
}
