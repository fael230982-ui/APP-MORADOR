import { cameraService } from './cameraService';
import type { Camera } from '../types/camera';

export async function getCameras(): Promise<Camera[]> {
  return cameraService.getUnitCameras();
}

export async function getCameraById(id: string): Promise<Camera | null> {
  const cameras = await cameraService.getUnitCameras();
  return cameras.find((camera) => camera.id === id) || null;
}
