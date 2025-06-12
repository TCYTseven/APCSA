# BODMAX - APCSA 2025
By Tejas and Kavin

## 1. Prerequisites

Before getting started, ensure your environment has node and expo installed.

## 2. Installation

### Build from Source

```bash
git clone https://github.com/TCYTseven/APCSA
cd Bodmax
npm install
```

## 3. Environment Setup

1. **Create a `.env` file** in the root directory.

2. **Get your Anthropic API key** from:  
   [https://console.anthropic.com/](https://console.anthropic.com/)

3. **Add the following to your `.env` file**:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
USE_MOCK_ANALYSIS=false 
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 4. Database Setup

- Run SQL code to generate required tables:  
  **{coming soon}**

## 6. Usage

Start the app using:

```bash
npx expo start
```
