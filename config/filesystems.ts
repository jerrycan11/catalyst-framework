/**
 * Catalyst Filesystem Configuration
 * 
 * File storage settings following Laravel's config/filesystems.php pattern.
 * Supports local, public, and S3-compatible storage backends.
 */

export interface DiskConfig {
  driver: 'local' | 's3' | 'memory';
  root?: string;
  url?: string;
  visibility?: 'public' | 'private';
  throw?: boolean;
  
  // S3-specific options
  key?: string;
  secret?: string;
  region?: string;
  bucket?: string;
  endpoint?: string;
  use_path_style_endpoint?: boolean;
}

export interface FilesystemsConfig {
  /** Default filesystem disk */
  default: string;
  /** Available filesystem disks */
  disks: Record<string, DiskConfig>;
  /** Symbolic links to be created */
  links: Record<string, string>;
}

const config: FilesystemsConfig = {
  default: process.env.FILESYSTEM_DISK || 'local',

  disks: {
    local: {
      driver: 'local',
      root: './storage/app',
      throw: false,
    },

    public: {
      driver: 'local',
      root: './storage/app/public',
      url: `${process.env.APP_URL || 'http://localhost:3000'}/storage`,
      visibility: 'public',
      throw: false,
    },

    s3: {
      driver: 's3',
      key: process.env.AWS_ACCESS_KEY_ID || '',
      secret: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
      bucket: process.env.AWS_BUCKET || '',
      url: process.env.AWS_URL,
      endpoint: process.env.AWS_ENDPOINT,
      use_path_style_endpoint: process.env.AWS_USE_PATH_STYLE_ENDPOINT === 'true',
      visibility: 'private',
      throw: false,
    },

    // Testing disk - in-memory storage
    memory: {
      driver: 'memory',
      visibility: 'private',
      throw: false,
    },
  },

  links: {
    'public/storage': 'storage/app/public',
  },
};

export default config;
