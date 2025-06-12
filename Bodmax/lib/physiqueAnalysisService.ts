import Anthropic from '@anthropic-ai/sdk';
import { config } from './config';

// Types for the service
export interface UserMetadata {
  height: number; // in inches
  weight: number; // in pounds
  gender: 'male' | 'female';
  desiredPhysique: string; // e.g., "bodybuilder"
  previousScores: Record<string, number>;
}

export interface PhysiqueAnalysisRequest {
  imageUri: string;
  userMetadata: UserMetadata;
}

export interface PhysiqueAnalysisResponse {
  identifiedParts: string[];
  scores: Record<string, number>;
  advice: string;
}

export interface PhysiqueAnalysisError {
  error: string;
  details?: string;
}

class PhysiqueAnalysisService {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    // Initialize Anthropic client
    this.anthropic = new Anthropic({
      apiKey: apiKey || config.ANTHROPIC_API_KEY || '',
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * Converts image URI to base64 for Claude Vision API
   */
  private async imageUriToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error}`);
    }
  }

  /**
   * Detects the media type of an image from its URI or blob type
   */
  private async getImageMediaType(uri: string): Promise<'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Get the MIME type from the blob
      let mimeType = blob.type;
      
      // If blob type is not available, try to determine from URI extension
      if (!mimeType || mimeType === 'application/octet-stream') {
        const extension = uri.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'webp':
            mimeType = 'image/webp';
            break;
          case 'gif':
            mimeType = 'image/gif';
            break;
          default:
            mimeType = 'image/jpeg'; // Default to JPEG
        }
      }
      
      // For Claude Vision API, ensure we use supported formats
      // Claude supports: image/jpeg, image/png, image/gif, image/webp
      const supportedTypes: ('image/jpeg' | 'image/png' | 'image/gif' | 'image/webp')[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (supportedTypes.includes(mimeType as any)) {
        return mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      } else {
        // Default to JPEG if unsupported type
        console.warn(`Unsupported image type ${mimeType}, defaulting to image/jpeg`);
        return 'image/jpeg';
      }
    } catch (error) {
      console.warn(`Failed to detect image media type: ${error}, defaulting to image/jpeg`);
      return 'image/jpeg';
    }
  }

  /**
   * Generates the prompt for Claude Vision API based on user metadata
   */
  private generatePrompt(userMetadata: UserMetadata): string {
    const { height, weight, gender, desiredPhysique, previousScores } = userMetadata;
    
    return `You are an expert fitness evaluator. Based on the provided image and the following user data:

Height: ${height} inches
Weight: ${weight} pounds
Gender: ${gender}
Desired Physique: ${desiredPhysique}
Previous Scores: ${JSON.stringify(previousScores)}

Please analyze the image and assess the user's current physique relative to a casual natural lifter standard. Be VERY GENEROUS in your scoring - this is compared to average gym-goers, not professional competitors. A score of 70+ should be given to anyone with visible muscle development, and 80+ for good development.

CRITICAL RULES - BE VERY CONSERVATIVE:

1. **POSE RECOGNITION**: First identify what pose the person is doing, then score the muscle groups that pose is meant to showcase. You can also include secondary muscles that are visible but not the main focus of the pose.
   - Side tricep pose (arm behind back) → ALWAYS rate "Triceps" + "Deltoids" if visible
   - Front bicep pose (arm flexed forward showing bicep) → ALWAYS rate "Biceps" + "Deltoids" if visible
   - Front double bicep pose (both arms flexed up) → ALWAYS rate "Biceps" + "Deltoids" if visible  
   - Front lat spread pose (arms wide, hands on waist) → Rate "Chest" + "Upper back" + "Deltoids" + "Abs" if visible
   - Side chest pose (one arm across body) → Rate "Chest" + "Deltoids" if visible
   - Abdominal pose (hands behind head/on hips) → ALWAYS rate "Abs" if visible
   - Any arm flexing pose → Include "Biceps" if the arm is flexed and bicep is visible

2. **PRIMARY TARGET RULE**: Be VERY GENEROUS with the main target muscle of the pose:
   - If someone is doing a tricep pose → ALWAYS identify "Triceps" even if small/not super prominent
   - If someone is doing a bicep pose or flexing their arm → ALWAYS identify "Biceps" even if small/not super prominent
   - If someone is doing an ab pose → ALWAYS identify "Abs" even if not super defined
   - Any visible muscle flexing should be identified and scored generously
   - The pose intention matters more than perfect visibility for the target muscle

3. **CHEST IDENTIFICATION RULES**: Only identify "Chest" if:
   - Person is wearing NO SHIRT at all, OR
   - Person is wearing a skin-tight compression shirt that clearly shows chest definition
   - Do NOT identify chest if wearing loose clothing, regular t-shirts, or tank tops

4. **SECONDARY MUSCLE RULES**:
   - For very muscular/developed individuals: Be generous and include multiple visible muscle groups
   - For average individuals: Be more conservative with secondary muscles
   - Include any muscle group that is clearly visible and assessable, even if not the main focus

Available muscle groups to identify:
["Trapezius", "Triceps", "Forearm", "Calves", "Deltoids", "Chest", "Biceps", "Abs", "Quadriceps", "Upper back", "Lower back", "Hamstring", "Gluteal"]

Return the results strictly in this JSON format:
{
  "identifiedParts": ["List muscle groups that are clearly visible and assessable - be generous for very muscular individuals"],
  "scores": {
    "Include scores for all muscles listed in identifiedParts"
  },
  "advice": "Custom advice based on the visible muscle groups and their development"
}

SCORING GUIDELINES:
- 60-69: Below average/beginner
- 70-79: Average gym-goer with visible muscle
- 80-89: Good development, regular lifter
- 90-95: Excellent natural development
- 96+: Elite natural physique

Examples:
- Side tricep pose: {"identifiedParts": ["Triceps", "Deltoids"], "scores": {"Triceps": 82, "Deltoids": 78}} (ALWAYS include triceps for tricep pose)
- Front bicep flex: {"identifiedParts": ["Biceps", "Deltoids"], "scores": {"Biceps": 85, "Deltoids": 80}} (ALWAYS include biceps when arm is flexed)
- Front double bicep: {"identifiedParts": ["Biceps", "Deltoids"], "scores": {"Biceps": 87, "Deltoids": 82}} (ALWAYS include biceps for bicep pose)
- Ab pose with shirt: {"identifiedParts": ["Abs"], "scores": {"Abs": 81}} (ALWAYS include abs for ab pose)
- Chest pose with shirt: {"identifiedParts": ["Deltoids"], "scores": {"Deltoids": 79}} (NO chest because of clothing)
- Chest pose shirtless: {"identifiedParts": ["Chest", "Deltoids"], "scores": {"Chest": 88, "Deltoids": 83}}
- Very muscular person front pose: {"identifiedParts": ["Chest", "Biceps", "Deltoids", "Abs", "Forearm"], "scores": {"Chest": 92, "Biceps": 90, "Deltoids": 88, "Abs": 94, "Forearm": 85}} (Be generous for highly developed physiques)

Do not include any extra explanation, comments, or formatting—only return the valid JSON object shown above.`;
  }

  /**
   * Analyzes physique from image using Claude Vision API
   */
  async analyzePhysique(request: PhysiqueAnalysisRequest): Promise<PhysiqueAnalysisResponse | PhysiqueAnalysisError> {
    try {
      console.log('🚀 Starting physique analysis...');
      console.log('📷 Image URI:', request.imageUri);
      console.log('👤 User metadata:', request.userMetadata);
      
      // Check if API key is available
      const apiKey = config.ANTHROPIC_API_KEY;
      console.log('🔑 API Key available:', apiKey ? 'Yes (' + apiKey.substring(0, 10) + '...)' : 'No');
      
      if (!apiKey) {
        throw new Error('Anthropic API key not found. Please check your config file.');
      }

      // Detect image media type
      console.log('🔍 Detecting image media type...');
      const mediaType = await this.getImageMediaType(request.imageUri);
      console.log('✅ Image media type detected:', mediaType);

      // Convert image to base64
      console.log('🔄 Converting image to base64...');
      const imageBase64 = await this.imageUriToBase64(request.imageUri);
      console.log('✅ Image converted to base64, length:', imageBase64.length);
      
      // Generate prompt with user metadata
      const prompt = this.generatePrompt(request.userMetadata);
      console.log('📝 Generated prompt length:', prompt.length);

      // Call Claude Vision API
      console.log('🌐 Calling Claude Vision API...');
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest', // Using latest Sonnet for better analysis
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      console.log('📡 Received response from Claude API');

      // Parse the response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude API');
      }

      // Parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(content.text);
        // Print the Claude response to console
        console.log('🤖 Claude Vision API Response:', JSON.stringify(parsedResponse, null, 2));
      } catch (parseError) {
        console.error('❌ Failed to parse Claude response:', content.text);
        throw new Error(`Failed to parse Claude response as JSON: ${content.text}`);
      }

      // Validate and transform response
      if (!parsedResponse.identifiedParts || !parsedResponse.scores) {
        console.error('❌ Invalid Claude response format:', parsedResponse);
        throw new Error('Invalid response format from Claude API');
      }

      console.log('✅ Successfully processed Claude response with scores:', parsedResponse.scores);

      return {
        identifiedParts: parsedResponse.identifiedParts,
        scores: parsedResponse.scores,
        advice: parsedResponse.advice || 'Keep up the great work on your fitness journey!',
      };

    } catch (error) {
      console.error('Physique analysis error:', error);
      return {
        error: 'Failed to analyze physique',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mock analysis for development/testing purposes
   */
  async mockAnalyzePhysique(request: PhysiqueAnalysisRequest): Promise<PhysiqueAnalysisResponse> {
    console.log('🎭 Using MOCK analysis mode');
    console.log('📷 Mock analyzing image:', request.imageUri);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock scores for only a realistic subset of muscle groups (simulate a focused photo)
    const allMuscleGroups = ['Trapezius', 'Triceps', 'Forearm', 'Calves', 'Deltoids', 'Chest', 'Biceps', 'Abs', 'Quadriceps', 'Upper back', 'Lower back', 'Hamstring', 'Gluteal'];
    
    // Randomly select 1-3 muscle groups to simulate what would be the main focus in a typical photo
    const numberOfGroups = Math.floor(Math.random() * 3) + 1; // 1-3 groups (more conservative)
    const shuffled = allMuscleGroups.sort(() => 0.5 - Math.random());
    const identifiedParts = shuffled.slice(0, numberOfGroups);

    const previousScores = request.userMetadata.previousScores;
    const scores: Record<string, number> = {};

    identifiedParts.forEach(part => {
      const previousScore = previousScores[part] || 0;
      // Generate realistic scores between 40-85 for mock analysis
      const baseScore = Math.floor(Math.random() * 46) + 40; // 40-85 range
      // Add small variation from previous score if it exists
      const variation = previousScore > 0 ? Math.floor(Math.random() * 9) - 4 : 0; // -4 to +4 variation
      scores[part] = Math.max(0, Math.min(100, previousScore > 0 ? previousScore + variation : baseScore));
    });

    const result = {
      identifiedParts,
      scores,
      advice: `Analysis of ${identifiedParts.length} visible muscle groups shows good development. Focus on consistency with your training routine for continued improvements.`,
    };

    console.log('🎭 Mock Analysis Result:', JSON.stringify(result, null, 2));
    return result;
  }
}

// Export singleton instance
export const physiqueAnalysisService = new PhysiqueAnalysisService();
export default PhysiqueAnalysisService; 