# Physique Analysis Backend System

This document explains the backend implementation for the physique evaluation feature using Claude Vision API.

## Overview

The system allows users to upload or take body photos, which are analyzed using Claude Vision API to score muscle group development based on natural bodybuilder standards.

## Architecture

### Core Components

1. **Physique Analysis Service** (`lib/physiqueAnalysisService.ts`)
   - Handles integration with Claude Vision API
   - Processes images and generates muscle group scores
   - Includes mock analysis for development/testing

2. **Data Store** (`lib/dataStore.ts`)
   - Manages local data storage using AsyncStorage
   - Handles user profiles, physique records, and score tracking
   - Provides progress calculation and data export features

3. **Integration Points**
   - `photo-insights.tsx`: Captures/selects images and triggers analysis
   - `progress.tsx`: Displays real-time scores and progress tracking
   - `onboarding.tsx`: Saves user profile data for analysis context

## Setup Instructions

### 1. Install Dependencies

The following packages are already installed:
```bash
npm install @anthropic-ai/sdk @react-native-async-storage/async-storage
```

### 2. Configure API Keys

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Anthropic API key from [https://console.anthropic.com/](https://console.anthropic.com/)

3. Update your `.env` file:
   ```env
   ANTHROPIC_API_KEY=your_actual_api_key_here
   USE_MOCK_ANALYSIS=false  # Set to true for development
   ```

### 3. Development vs Production

**Development Mode (Recommended for testing):**
- Set `USE_MOCK_ANALYSIS=true` in your `.env` file
- The system will use mock analysis with realistic score variations
- No API calls or costs incurred

**Production Mode:**
- Set `USE_MOCK_ANALYSIS=false` in your `.env` file
- Requires valid Anthropic API key
- Real Claude Vision analysis will be performed

## How It Works

### User Flow

1. **Onboarding**: User provides height, weight, gender, and desired physique
2. **Photo Capture**: User takes/selects a body photo
3. **Analysis**: Image + user metadata sent to Claude Vision API
4. **Results**: Scores returned for identified muscle groups
5. **Storage**: Results saved locally for progress tracking

### Data Flow

```
Photo Input → Analysis Service → Claude Vision API → Score Results → Data Store → UI Updates
```

### Analysis Prompt

The system uses a carefully crafted prompt that includes:
- User's physical metadata (height, weight, gender)
- Previous scores for comparison
- Target physique type (e.g., "bodybuilder")
- Instructions for generous, natural-standard scoring

### Response Format

Claude returns structured JSON:
```json
{
  "identified parts": ["Chest", "Deltoids", "Biceps", "Triceps", "Abs", "Quadriceps"],
  "scores": {
    "Chest": 84,
    "Deltoids": 78,
    "Biceps": 75,
    "Triceps": 71,
    "Abs": 69,
    "Quadriceps": 81
  },
  "advice": "Focus on building your biceps and triceps more..."
}
```

## Key Features

### 1. Dynamic Scoring
- Scores adjusted based on user's gender, body type, and goals
- Previous scores included for contextual analysis
- Generous scoring focused on motivation

### 2. Progress Tracking
- Historical score tracking with visual charts
- Calendar view of scan dates
- Improvement calculations and streak counting

### 3. Local Data Management
- All data stored locally using AsyncStorage
- No server dependency for data persistence
- Export capability for data backup

### 4. Error Handling
- Graceful fallbacks for API failures
- User-friendly error messages
- Mock data for development and testing

## API Usage and Costs

### Anthropic Claude API
- **Model**: `claude-3-haiku-20240307` (cost-effective for image analysis)
- **Typical Cost**: ~$0.02-0.05 per image analysis
- **Rate Limits**: Standard Anthropic limits apply

### Image Processing
- Images automatically converted to base64 for API submission
- Support for both camera capture and gallery selection
- Quality optimization for faster processing

## Development Tips

### Testing the System

1. **Mock Mode**: Enable `USE_MOCK_ANALYSIS=true` for immediate testing
2. **Real API Testing**: Use small batches to test actual Claude integration
3. **Data Reset**: Use `dataStore.clearAllData()` to reset test data

### Debugging

1. **Check Console**: All API calls and errors logged to console
2. **Data Inspection**: Use `dataStore.exportData()` to view stored data
3. **Network Issues**: Verify API key and network connectivity

### Customization

1. **Scoring Criteria**: Modify the prompt in `generatePrompt()` method
2. **Muscle Groups**: Update the default scores in `getDefaultScores()`
3. **UI Feedback**: Customize loading states and error messages

## Future Enhancements

### Cloud Integration
The system is designed to easily transition to cloud storage (Supabase):
- User profiles → Supabase Auth + Profiles table
- Images → Supabase Storage buckets
- Scores → Physique records table

### Advanced Features
- Multiple angle analysis (front, side, back views)
- Body fat percentage estimation
- Workout recommendations based on weak points
- Social features (sharing progress)

## Troubleshooting

### Common Issues

1. **"User profile not found"**
   - Ensure onboarding is completed
   - Check if `dataStore.getUserProfile()` returns data

2. **Analysis always fails**
   - Verify API key is correctly set
   - Check network connectivity
   - Try mock mode first

3. **No progress data showing**
   - Take at least one photo analysis
   - Check if `useFocusEffect` is triggering data reload

4. **Image upload fails**
   - Verify camera/gallery permissions
   - Check image size and format
   - Test with different images

### Support

For issues with:
- **Claude API**: Check [Anthropic documentation](https://docs.anthropic.com/)
- **React Native**: Check [React Native docs](https://reactnative.dev/)
- **AsyncStorage**: Check [AsyncStorage docs](https://react-native-async-storage.github.io/)

## Security Notes

- API keys should never be committed to version control
- Use environment variables for all sensitive configuration
- Consider API key rotation for production apps
- Local data is not encrypted by default (enhance for production)

## Performance Considerations

- Image compression before API submission
- Debounced API calls to prevent spam
- Local caching of analysis results
- Background processing for better UX

---

The physique analysis system is now ready for testing and development. Start with mock mode to test the flow, then switch to real API analysis when ready! 