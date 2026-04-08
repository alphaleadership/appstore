import * as crypto from 'crypto';
import * as fs from 'fs';
import { FileMetadata, ValidationResult } from '../models/types.js';

export class IntegrityChecker {
  async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(`sha256:${hash.digest('hex')}`));
      stream.on('error', err => reject(err));
    });
  }

  async verifyChecksum(filePath: string, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.calculateChecksum(filePath);
    return actualChecksum === expectedChecksum;
  }

  async verifySignature(filePath: string, signature: string, publicKey: string): Promise<boolean> {
    // Basic signature verification logic using crypto
    try {
      const data = fs.readFileSync(filePath);
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      verify.end();
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  async validateFile(filePath: string, metadata: FileMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // Check checksum
    const checksumMatch = await this.verifyChecksum(filePath, metadata.checksum);
    if (!checksumMatch) {
      errors.push('Checksum mismatch');
    }
    
    // Check signature
    const signatureValid = await this.verifySignature(filePath, metadata.signature, metadata.publicKey);
    if (!signatureValid) {
      errors.push('Invalid signature');
    }
    
    return {
      isValid: errors.length === 0,
      checksumMatch,
      signatureValid,
      errors
    };
  }
}
