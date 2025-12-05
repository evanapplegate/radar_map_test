// Custom layer for rendering radar on elevated sphere
class RadarSphereLayer {
    constructor(options = {}) {
        this.type = 'custom';
        this.renderingMode = '3d';
        this.offset = options.offset || 50000; // meters above Earth surface
        this.opacity = options.opacity || 0.75;
        this.earthRadius = 6371000; // Earth radius in meters
        this.sphereRadius = this.earthRadius + this.offset;
    }

    onAdd(map, gl) {
        this.map = map;
        this.gl = gl;
        
        // Create shader program
        const vertexSource = `
            attribute vec3 a_pos;
            uniform mat4 u_matrix;
            uniform float u_radius;
            
            void main() {
                vec4 pos = vec4(a_pos * u_radius, 1.0);
                gl_Position = u_matrix * pos;
            }
        `;
        
        const fragmentSource = `
            precision highp float;
            uniform float u_opacity;
            uniform sampler2D u_texture;
            varying vec2 v_texcoord;
            
            void main() {
                vec4 color = texture2D(u_texture, v_texcoord);
                gl_FragColor = vec4(color.rgb, color.a * u_opacity);
            }
        `;
        
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        // Create sphere geometry
        this.createSphereGeometry(32, 32);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    createSphereGeometry(latSegments, lonSegments) {
        const positions = [];
        const texCoords = [];
        const indices = [];
        
        for (let lat = 0; lat <= latSegments; lat++) {
            const theta = lat * Math.PI / latSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= lonSegments; lon++) {
                const phi = lon * 2 * Math.PI / lonSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                
                positions.push(x, y, z);
                texCoords.push(lon / lonSegments, lat / latSegments);
            }
        }
        
        for (let lat = 0; lat < latSegments; lat++) {
            for (let lon = 0; lon < lonSegments; lon++) {
                const first = lat * (lonSegments + 1) + lon;
                const second = first + lonSegments + 1;
                
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        
        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
        
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        
        this.indexCount = indices.length;
    }

    render(gl, matrix) {
        // This requires accessing Mapbox's tile system to get radar textures
        // Full implementation would need to:
        // 1. Get visible tiles from radar source
        // 2. Load tile textures
        // 3. Map them to sphere geometry
        // 4. Render with proper transformations
        
        // For now, this is a placeholder structure
        // The actual radar rendering happens via the raster layer
    }
}

