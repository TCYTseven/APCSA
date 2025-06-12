import * as FileSystem from 'expo-file-system'
import { authService } from './auth'
import { supabase } from './supabase'

export interface ImageUploadResult {
  url: string
  path: string
}

class StorageService {
  private bucketName = 'physique-images'

  // Upload image to Supabase Storage
  async uploadPhysiqueImage(imageUri: string): Promise<ImageUploadResult> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated to upload images')
      }

      // Create unique filename with timestamp
      const timestamp = Date.now()
      const fileName = `${timestamp}.jpg`
      const filePath = `${user.id}/${fileName}`

      console.log('📸 Uploading image to:', filePath)
      console.log('📷 Image URI:', imageUri)

      let blob: Blob

      // Handle different types of image URIs
      if (imageUri.startsWith('file://') || imageUri.startsWith('ph://') || imageUri.startsWith('assets-library://')) {
        // Local file URI (camera roll, camera capture) - use FileSystem
        console.log('🔄 Converting local image URI to blob using FileSystem...')
        
        try {
          // Read file as base64
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          })
          
          // Convert base64 to blob
          const byteCharacters = atob(base64)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          blob = new Blob([byteArray], { type: 'image/jpeg' })
          
          console.log('✅ Local image converted to blob, size:', blob.size, 'bytes')
        } catch (fileSystemError) {
          console.error('❌ FileSystem approach failed:', fileSystemError)
          // Fallback to fetch approach
          const response = await fetch(imageUri)
          blob = await response.blob()
          console.log('✅ Fallback fetch successful, blob size:', blob.size, 'bytes')
        }
      } else {
        // HTTP URL or other URI - use standard fetch
        console.log('🔄 Converting HTTP image URI to blob using fetch...')
        const response = await fetch(imageUri)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        }
        blob = await response.blob()
        console.log('✅ HTTP image converted to blob, size:', blob.size, 'bytes')
      }

      // Validate blob size
      if (blob.size === 0) {
        throw new Error('Image blob is empty. The image may be corrupted or inaccessible.')
      }

      // Upload to Supabase Storage
      console.log('☁️ Uploading blob to Supabase Storage...')
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (error) {
        console.error('❌ Storage upload error:', error)
        throw error
      }

      console.log('✅ Image uploaded successfully:', data.path)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('❌ Upload image error:', error)
      throw error
    }
  }

  // Get signed URL for private image access
  async getSignedUrl(path: string, expiresIn: number = 60): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('❌ Get signed URL error:', error)
        throw error
      }

      return data.signedUrl
    } catch (error) {
      console.error('❌ Get signed URL error:', error)
      throw error
    }
  }

  // Delete image from storage
  async deleteImage(path: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting image:', path)

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        console.error('❌ Delete image error:', error)
        throw error
      }

      console.log('✅ Image deleted successfully')
      return true
    } catch (error) {
      console.error('❌ Delete image error:', error)
      return false
    }
  }

  // List user's images
  async listUserImages(): Promise<string[]> {
    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('User must be authenticated')
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(user.id)

      if (error) {
        console.error('❌ List images error:', error)
        throw error
      }

      return data?.map(file => `${user.id}/${file.name}`) || []
    } catch (error) {
      console.error('❌ List images error:', error)
      return []
    }
  }

  // Get public URL for an image
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path)

    return data.publicUrl
  }

  // Extract path from URL
  extractPathFromUrl(url: string): string | null {
    try {
      // Extract path from Supabase Storage URL
      // Format: https://[project].supabase.co/storage/v1/object/public/physique-images/[path]
      const match = url.match(/\/physique-images\/(.+)$/)
      return match ? match[1] : null
    } catch (error) {
      console.error('❌ Extract path error:', error)
      return null
    }
  }
}

export const storageService = new StorageService() 