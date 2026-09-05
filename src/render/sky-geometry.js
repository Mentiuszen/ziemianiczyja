/** Complete sphere; duplicate the seam only for UVs, never add a flat cap.
 * North uses v=1 (image top after Babylon's default texture Y conversion).
 */
export function skyGeometry(longitudes = 64, latitudes = 32, radius = 240) {
  const positions = [], normals = [], uvs = [], indices = [];
  for (let row = 0; row <= latitudes; row++) {
    const latitude = row / latitudes * Math.PI;
    for (let col = 0; col <= longitudes; col++) {
      const longitude = col / longitudes * Math.PI * 2;
      const x = Math.sin(latitude) * Math.sin(longitude);
      const y = Math.cos(latitude);
      const z = Math.sin(latitude) * Math.cos(longitude);
      positions.push(x * radius, y * radius, z * radius);
      normals.push(-x, -y, -z);
      uvs.push(col / longitudes, 1 - row / latitudes);
    }
  }
  for (let row = 0; row < latitudes; row++) {
    for (let col = 0; col < longitudes; col++) {
      const a = row * (longitudes + 1) + col, b = a + 1;
      const c = a + longitudes + 1, d = c + 1;
      if (row !== 0) indices.push(a, c, b);
      if (row !== latitudes - 1) indices.push(b, c, d);
    }
  }
  return { positions, normals, uvs, indices };
}
