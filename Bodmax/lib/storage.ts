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

      // Convert image URI to blob for upload
      const response = await fetch(imageUri)
      const blob = await response.blob()

      // Upload to Supabase Storage
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