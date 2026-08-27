export const getScreenToWorld = (
  screenX: number,
  screenY: number,
  cameraOffset: { x: number; y: number },
  cameraZoom: number
) => {
  return {
    x: (screenX - cameraOffset.x) / cameraZoom,
    y: (screenY - cameraOffset.y) / cameraZoom,
  };
};