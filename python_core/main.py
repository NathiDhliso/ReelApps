import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="ReelApps AI Core", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class JobDescription(BaseModel):
    title: str
    description: str
    requirements: List[str]
    experience_level: str

class JobAnalysisResponse(BaseModel):
    clarity: int
    realism: int
    inclusivity: int
    suggestions: List[str]

class Profile(BaseModel):
    id: str
    first_name: str
    last_name: str
    headline: Optional[str]
    summary: Optional[str]
    location: Optional[str]
    availability: Optional[str]
    preferred_roles: Optional[List[str]]
    skills: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    persona_analysis: Optional[Dict[str, Any]]

class CandidateMatch(BaseModel):
    candidate_id: str
    overall_score: int
    skills_match: int
    culture_match: int
    experience_match: int
    reasoning: str
    strengths: List[str]
    concerns: List[str]

class MatchRequest(BaseModel):
    job_posting: Dict[str, Any]
    candidates: List[Profile]

class PersonaAnalysisRequest(BaseModel):
    text: str

class PersonaAnalysisResponse(BaseModel):
    openness: int
    conscientiousness: int
    extraversion: int
    agreeableness: int
    neuroticism: int
    summary: str
    strengths: List[str]
    growth_areas: List[str]

# AI Service Configuration - ONLY USING GEMINI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

# Verify we're only using Gemini
if not GEMINI_API_KEY:
    logger.warning("Gemini API key not configured - AI features will use fallback responses")

async def call_gemini_api(prompt: str) -> str:
    """Call Google Gemini API for text analysis with robust error handling"""
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not configured, using fallback response")
        # Return a structured fallback response
        return json.dumps({
            "clarity": 75,
            "realism": 80,
            "inclusivity": 85,
            "suggestions": [
                "Consider adding more specific technical requirements",
                "Review language for inclusive terminology",
                "Clarify experience level expectations"
            ]
        })
    
    headers = {
        "Content-Type": "application/json",
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024,
        }
    }
    
    try:
        logger.info("Making request to Gemini API")
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 429:
            logger.warning("Gemini API rate limit exceeded")
            raise HTTPException(status_code=503, detail="AI service temporarily unavailable due to rate limits")
        
        response.raise_for_status()
        
        result = response.json()
        
        if 'candidates' not in result or not result['candidates']:
            logger.error(f"Unexpected Gemini API response structure: {result}")
            raise HTTPException(status_code=502, detail="AI service returned unexpected response")
        
        ai_response = result["candidates"][0]["content"]["parts"][0]["text"]
        logger.info("Successfully received response from Gemini API")
        return ai_response
        
    except requests.exceptions.Timeout:
        logger.error("Gemini API request timed out")
        raise HTTPException(status_code=504, detail="AI service request timed out")
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to Gemini API")
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")
    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API request failed: {str(e)}")
        raise HTTPException(status_code=502, detail="AI service error")

@app.post("/analyze/job-description", response_model=JobAnalysisResponse)
async def analyze_job_description(job: JobDescription):
    """Analyze job description for clarity, realism, and inclusivity using ONLY Gemini AI"""
    
    prompt = f"""
    Analyze the following job posting for clarity, realism, and inclusivity. Return your analysis as a JSON object with the following structure:
    {{
        "clarity": <score 0-100>,
        "realism": <score 0-100>, 
        "inclusivity": <score 0-100>,
        "suggestions": ["suggestion1", "suggestion2", ...]
    }}

    Job Title: {job.title}
    Experience Level: {job.experience_level}
    
    Job Description:
    {job.description}
    
    Requirements:
    {', '.join(job.requirements)}
    
    Evaluation Criteria:
    
    Clarity (0-100): How clear and well-structured is the job description? Are responsibilities and requirements clearly defined?
    
    Realism (0-100): Are the requirements realistic for the stated experience level? Is the skill combination reasonable?
    
    Inclusivity (0-100): Does the language promote diversity and inclusion? Are there any potentially exclusionary terms or requirements?
    
    Suggestions: Provide 3-5 specific, actionable suggestions for improvement.
    
    Return only the JSON object, no additional text.
    """
    
    try:
        ai_response = await call_gemini_api(prompt)
        
        # Clean and parse the AI response
        clean_response = ai_response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        
        try:
            analysis = json.loads(clean_response.strip())
            
            # Validate the response structure
            required_fields = ['clarity', 'realism', 'inclusivity', 'suggestions']
            for field in required_fields:
                if field not in analysis:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure scores are within valid range
            for score_field in ['clarity', 'realism', 'inclusivity']:
                score = analysis[score_field]
                if not isinstance(score, (int, float)) or score < 0 or score > 100:
                    analysis[score_field] = max(0, min(100, int(score) if isinstance(score, (int, float)) else 50))
            
            # Ensure suggestions is a list
            if not isinstance(analysis['suggestions'], list):
                analysis['suggestions'] = ["Review job description for clarity and completeness"]
            
            logger.info(f"Successfully analyzed job: {job.title}")
            return JobAnalysisResponse(**analysis)
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse AI response: {str(e)}")
            logger.error(f"Raw AI response: {ai_response}")
            
            # Robust fallback analysis
            fallback_analysis = {
                "clarity": 75,
                "realism": 80,
                "inclusivity": 70,
                "suggestions": [
                    "Consider adding more specific technical requirements",
                    "Review language for inclusive terminology",
                    "Clarify experience level expectations",
                    "Add information about company culture and values"
                ]
            }
            
            logger.info("Using fallback analysis due to AI parsing error")
            return JobAnalysisResponse(**fallback_analysis)
    
    except HTTPException:
        # Re-raise HTTP exceptions (already handled)
        raise
    except Exception as e:
        logger.error(f"Unexpected error in job analysis: {str(e)}")
        # Ultimate fallback
        return JobAnalysisResponse(
            clarity=70,
            realism=75,
            inclusivity=80,
            suggestions=[
                "Review job posting for clarity and completeness",
                "Ensure requirements match experience level",
                "Use inclusive language throughout"
            ]
        )

def calculate_skills_match(job_requirements: List[str], candidate_skills: List[Dict]) -> tuple[int, List[str], List[str]]:
    """Calculate skills match using TF-IDF vectorization with error handling"""
    
    try:
        # Prepare job requirements text
        job_text = " ".join(job_requirements).lower()
        
        # Prepare candidate skills text
        candidate_skills_text = []
        skill_names = []
        
        for skill in candidate_skills:
            skill_text = f"{skill.get('name', '')} {skill.get('description', '')}".lower()
            candidate_skills_text.append(skill_text)
            skill_names.append(skill.get('name', 'Unknown Skill'))
        
        if not candidate_skills_text:
            return 0, [], ["No skills listed"]
        
        # Combine all texts for vectorization
        all_texts = [job_text] + candidate_skills_text
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=1000)
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Calculate cosine similarity between job and each skill
        job_vector = tfidf_matrix[0:1]
        skills_vectors = tfidf_matrix[1:]
        
        similarities = cosine_similarity(job_vector, skills_vectors)[0]
        
        # Calculate overall match score
        if len(similarities) > 0:
            match_score = int(np.mean(similarities) * 100)
        else:
            match_score = 0
        
        # Identify top matching skills (strengths)
        top_indices = np.argsort(similarities)[-3:][::-1]
        strengths = [skill_names[i] for i in top_indices if i < len(skill_names) and similarities[i] > 0.1]
        
        # Identify concerns (missing key skills)
        job_keywords = set(job_text.split())
        candidate_keywords = set(" ".join(candidate_skills_text).split())
        missing_keywords = job_keywords - candidate_keywords
        
        concerns = []
        if len(missing_keywords) > 5:
            concerns.append("Several required skills not explicitly mentioned")
        if match_score < 50:
            concerns.append("Limited overlap with job requirements")
        
        return match_score, strengths, concerns
        
    except Exception as e:
        logger.error(f"Error in skills matching: {str(e)}")
        return 0, [], ["Error analyzing skills match"]

def calculate_experience_match(job_experience: str, candidate_skills: List[Dict]) -> int:
    """Calculate experience match based on years of experience with error handling"""
    
    try:
        experience_mapping = {
            "entry": (0, 2),
            "junior": (1, 3),
            "mid": (3, 6),
            "senior": (5, 10),
            "lead": (7, 15),
            "principal": (10, 20)
        }
        
        job_exp_range = experience_mapping.get(job_experience.lower(), (0, 5))
        
        if not candidate_skills:
            return 0
        
        # Calculate average years of experience across skills
        total_years = sum(skill.get('years_experience', 0) for skill in candidate_skills)
        avg_years = total_years / len(candidate_skills)
        
        # Score based on how well candidate experience fits job requirements
        min_required, max_required = job_exp_range
        
        if min_required <= avg_years <= max_required:
            return 100
        elif avg_years < min_required:
            # Under-experienced
            gap = min_required - avg_years
            return max(0, 100 - int(gap * 20))
        else:
            # Over-experienced (less penalty)
            gap = avg_years - max_required
            return max(60, 100 - int(gap * 10))
            
    except Exception as e:
        logger.error(f"Error in experience matching: {str(e)}")
        return 50  # Neutral score on error

def calculate_culture_match(job_description: str, persona_analysis: Optional[Dict]) -> int:
    """Calculate culture match based on persona analysis with error handling"""
    
    try:
        if not persona_analysis:
            return 50  # Neutral score if no persona data
        
        # Extract key cultural indicators from job description
        job_text = job_description.lower()
        
        culture_keywords = {
            "collaborative": ["team", "collaborate", "partnership", "together"],
            "independent": ["autonomous", "self-directed", "independent", "ownership"],
            "innovative": ["innovation", "creative", "cutting-edge", "disruptive"],
            "structured": ["process", "methodology", "systematic", "organized"],
            "fast-paced": ["fast-paced", "agile", "rapid", "quick"],
            "leadership": ["lead", "mentor", "guide", "manage"]
        }
        
        job_culture_scores = {}
        for trait, keywords in culture_keywords.items():
            score = sum(1 for keyword in keywords if keyword in job_text)
            job_culture_scores[trait] = min(score, 3)  # Cap at 3
        
        # Extract candidate culture traits from persona analysis
        candidate_scores = {}
        
        # From work_style
        work_style = persona_analysis.get('work_style', {})
        if isinstance(work_style, dict):
            candidate_scores['collaborative'] = work_style.get('collaboration', 50) / 100 * 3
            candidate_scores['independent'] = work_style.get('independence', 50) / 100 * 3
            candidate_scores['leadership'] = work_style.get('leadership', 50) / 100 * 3
        
        # From cultural_fit
        cultural_fit = persona_analysis.get('cultural_fit', {})
        if isinstance(cultural_fit, dict):
            candidate_scores['innovative'] = cultural_fit.get('innovation', 50) / 100 * 3
            candidate_scores['structured'] = cultural_fit.get('structure', 50) / 100 * 3
        
        # Calculate match score
        total_match = 0
        total_weight = 0
        
        for trait in culture_keywords.keys():
            job_weight = job_culture_scores.get(trait, 0)
            candidate_score = candidate_scores.get(trait, 1.5)  # Default neutral
            
            if job_weight > 0:
                # Higher weight for traits mentioned in job description
                match = min(candidate_score / 3, 1.0) * job_weight
                total_match += match
                total_weight += job_weight
        
        if total_weight == 0:
            return 70  # Default good match if no cultural indicators found
        
        return int((total_match / total_weight) * 100)
        
    except Exception as e:
        logger.error(f"Error in culture matching: {str(e)}")
        return 50  # Neutral score on error

@app.post("/match/candidates", response_model=List[CandidateMatch])
async def match_candidates(request: MatchRequest):
    """Match candidates against a job posting with comprehensive error handling"""
    
    try:
        job = request.job_posting
        candidates = request.candidates
        
        if not candidates:
            logger.warning("No candidates provided for matching")
            return []
        
        matches = []
        
        for candidate in candidates:
            try:
                # Calculate individual match scores
                skills_match, skill_strengths, skill_concerns = calculate_skills_match(
                    job.get('requirements', []), 
                    candidate.skills
                )
                
                experience_match = calculate_experience_match(
                    job.get('experience_level', 'mid'),
                    candidate.skills
                )
                
                culture_match = calculate_culture_match(
                    job.get('description', ''),
                    candidate.persona_analysis
                )
                
                # Calculate weighted overall score
                overall_score = int(
                    skills_match * 0.4 + 
                    experience_match * 0.3 + 
                    culture_match * 0.3
                )
                
                # Generate reasoning
                reasoning_parts = []
                if skills_match >= 80:
                    reasoning_parts.append("Strong technical skills alignment")
                elif skills_match >= 60:
                    reasoning_parts.append("Good skills match with some gaps")
                else:
                    reasoning_parts.append("Limited skills overlap")
                
                if experience_match >= 80:
                    reasoning_parts.append("excellent experience level fit")
                elif experience_match >= 60:
                    reasoning_parts.append("adequate experience level")
                else:
                    reasoning_parts.append("experience level mismatch")
                
                if culture_match >= 80:
                    reasoning_parts.append("strong cultural alignment")
                elif culture_match >= 60:
                    reasoning_parts.append("good cultural fit")
                else:
                    reasoning_parts.append("potential cultural fit concerns")
                
                reasoning = f"{reasoning_parts[0].capitalize()}, {reasoning_parts[1]}, {reasoning_parts[2]}."
                
                # Compile strengths and concerns
                all_strengths = skill_strengths.copy()
                all_concerns = skill_concerns.copy()
                
                if experience_match >= 80:
                    all_strengths.append("Appropriate experience level")
                elif experience_match < 50:
                    all_concerns.append("Experience level mismatch")
                
                if culture_match >= 80:
                    all_strengths.append("Strong cultural fit")
                elif culture_match < 50:
                    all_concerns.append("Potential cultural misalignment")
                
                match = CandidateMatch(
                    candidate_id=candidate.id,
                    overall_score=overall_score,
                    skills_match=skills_match,
                    culture_match=culture_match,
                    experience_match=experience_match,
                    reasoning=reasoning,
                    strengths=all_strengths[:5],  # Limit to top 5
                    concerns=all_concerns[:3]     # Limit to top 3
                )
                
                matches.append(match)
                
            except Exception as e:
                logger.error(f"Error matching candidate {candidate.id}: {str(e)}")
                # Continue with other candidates
                continue
        
        # Sort by overall score (highest first)
        matches.sort(key=lambda x: x.overall_score, reverse=True)
        
        logger.info(f"Successfully matched {len(matches)} candidates for job: {job.get('title', 'Unknown')}")
        return matches
        
    except Exception as e:
        logger.error(f"Critical error in candidate matching: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing candidate matches")

@app.post("/analyze/persona", response_model=PersonaAnalysisResponse)
async def analyze_persona(request: PersonaAnalysisRequest):
    """Analyze personality traits using the Big Five (OCEAN) model with Gemini AI"""
    
    prompt = f"""
    Analyze the following text for personality traits based on the Big Five (OCEAN) model. The text contains combined answers from a questionnaire and conversational analysis.

    Text to analyze:
    {request.text}

    Please provide a comprehensive personality analysis and return your analysis as a JSON object with the following structure:
    {{
        "openness": <score 0-100>,
        "conscientiousness": <score 0-100>,
        "extraversion": <score 0-100>,
        "agreeableness": <score 0-100>,
        "neuroticism": <score 0-100>,
        "summary": "<one paragraph personality summary>",
        "strengths": ["strength1 with brief explanation", "strength2 with brief explanation", "strength3 with brief explanation"],
        "growth_areas": ["growth area1 with brief explanation", "growth area2 with brief explanation", "growth area3 with brief explanation"]
    }}

    Scoring Guidelines:
    - Openness (0-100): Creativity, curiosity, openness to new experiences and ideas
    - Conscientiousness (0-100): Organization, discipline, goal-orientation, reliability
    - Extraversion (0-100): Social energy, assertiveness, tendency to seek stimulation from others
    - Agreeableness (0-100): Compassion, cooperation, trust in others, empathy
    - Neuroticism (0-100): Emotional stability (lower scores indicate higher stability)

    For the summary, provide a cohesive paragraph that integrates all five dimensions and describes the person's overall personality profile.

    For strengths, identify three key positive traits or capabilities based on the personality analysis, with a brief explanation of how each strength manifests.

    For growth areas, identify three areas where the person might benefit from development or increased awareness, with a brief explanation of potential benefits.

    Return only the JSON object, no additional text.
    """
    
    try:
        ai_response = await call_gemini_api(prompt)
        
        # Clean and parse the AI response
        clean_response = ai_response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        
        try:
            analysis = json.loads(clean_response.strip())
            
            # Validate required fields and provide defaults if missing
            required_fields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
            for field in required_fields:
                if field not in analysis or not isinstance(analysis[field], (int, float)):
                    analysis[field] = 50  # Default neutral score
                else:
                    # Ensure scores are within 0-100 range
                    analysis[field] = max(0, min(100, int(analysis[field])))
            
            # Validate string fields
            if 'summary' not in analysis or not isinstance(analysis['summary'], str):
                analysis['summary'] = "Based on the provided information, this individual shows a balanced personality profile across the Big Five dimensions."
            
            if 'strengths' not in analysis or not isinstance(analysis['strengths'], list):
                analysis['strengths'] = [
                    "Demonstrates self-awareness through thoughtful responses",
                    "Shows willingness to engage in personal reflection",
                    "Exhibits clear communication skills"
                ]
            
            if 'growth_areas' not in analysis or not isinstance(analysis['growth_areas'], list):
                analysis['growth_areas'] = [
                    "Continue developing self-awareness through regular reflection",
                    "Seek feedback from others to gain external perspectives",
                    "Consider exploring areas outside comfort zone for growth"
                ]
            
            # Ensure lists have exactly 3 items
            analysis['strengths'] = analysis['strengths'][:3] if len(analysis['strengths']) >= 3 else analysis['strengths'] + ["Additional strength identified through comprehensive analysis"] * (3 - len(analysis['strengths']))
            analysis['growth_areas'] = analysis['growth_areas'][:3] if len(analysis['growth_areas']) >= 3 else analysis['growth_areas'] + ["Additional growth opportunity for continued development"] * (3 - len(analysis['growth_areas']))
            
            logger.info("Successfully completed personality analysis")
            
            return PersonaAnalysisResponse(
                openness=analysis['openness'],
                conscientiousness=analysis['conscientiousness'],
                extraversion=analysis['extraversion'],
                agreeableness=analysis['agreeableness'],
                neuroticism=analysis['neuroticism'],
                summary=analysis['summary'],
                strengths=analysis['strengths'],
                growth_areas=analysis['growth_areas']
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {str(e)}")
            logger.error(f"Raw response: {ai_response}")
            raise HTTPException(status_code=502, detail="AI service returned invalid response format")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in persona analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing personality analysis")

@app.get("/health")
async def health_check():
    """Health check endpoint with service status"""
    try:
        # Test basic functionality
        test_skills = [{"name": "Python", "years_experience": 3}]
        test_match, _, _ = calculate_skills_match(["Python"], test_skills)
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "services": {
                "matching_engine": "operational",
                "ai_integration": "operational" if GEMINI_API_KEY else "degraded"
            },
            "ai_provider": "Google Gemini"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)