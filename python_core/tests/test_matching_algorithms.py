import pytest
import numpy as np
from unittest.mock import Mock, patch
from main import (
    calculate_skills_match,
    calculate_experience_match,
    calculate_culture_match,
    JobDescription,
    Profile
)

class TestSkillsMatching:
    """Test suite for skills matching algorithm"""
    
    def test_perfect_skills_match(self):
        """Test perfect match scenario"""
        job_requirements = ["Python", "React", "Machine Learning"]
        candidate_skills = [
            {"name": "Python", "description": "Expert in Python programming", "years_experience": 5},
            {"name": "React", "description": "Frontend development with React", "years_experience": 3},
            {"name": "Machine Learning", "description": "ML model development", "years_experience": 2}
        ]
        
        score, strengths, concerns = calculate_skills_match(job_requirements, candidate_skills)
        
        assert score >= 80, f"Expected high match score, got {score}"
        assert len(strengths) > 0, "Should identify strengths for perfect match"
        assert "Python" in strengths or "React" in strengths, "Should identify key skills as strengths"
    
    def test_no_skills_match(self):
        """Test scenario with no matching skills"""
        job_requirements = ["Java", "Spring Boot", "Kubernetes"]
        candidate_skills = [
            {"name": "Python", "description": "Python programming", "years_experience": 5},
            {"name": "Django", "description": "Web development", "years_experience": 3}
        ]
        
        score, strengths, concerns = calculate_skills_match(job_requirements, candidate_skills)
        
        assert score < 50, f"Expected low match score for unrelated skills, got {score}"
        assert len(concerns) > 0, "Should identify concerns for poor match"
    
    def test_empty_candidate_skills(self):
        """Test handling of empty skills list"""
        job_requirements = ["Python", "React"]
        candidate_skills = []
        
        score, strengths, concerns = calculate_skills_match(job_requirements, candidate_skills)
        
        assert score == 0, "Empty skills should result in 0 score"
        assert "No skills listed" in concerns, "Should identify lack of skills as concern"
    
    def test_partial_skills_match(self):
        """Test partial match scenario"""
        job_requirements = ["Python", "React", "AWS", "Docker"]
        candidate_skills = [
            {"name": "Python", "description": "Advanced Python", "years_experience": 4},
            {"name": "JavaScript", "description": "Frontend JS", "years_experience": 2}
        ]
        
        score, strengths, concerns = calculate_skills_match(job_requirements, candidate_skills)
        
        assert 20 <= score <= 80, f"Expected moderate score for partial match, got {score}"
        assert "Python" in strengths, "Should identify Python as strength"

class TestExperienceMatching:
    """Test suite for experience matching algorithm"""
    
    def test_perfect_experience_match(self):
        """Test perfect experience level match"""
        candidate_skills = [
            {"years_experience": 5},
            {"years_experience": 4},
            {"years_experience": 6}
        ]
        
        score = calculate_experience_match("senior", candidate_skills)
        assert score == 100, f"Expected perfect match for senior level, got {score}"
    
    def test_under_experienced_candidate(self):
        """Test under-experienced candidate"""
        candidate_skills = [
            {"years_experience": 1},
            {"years_experience": 2}
        ]
        
        score = calculate_experience_match("senior", candidate_skills)
        assert score < 80, f"Expected lower score for under-experienced candidate, got {score}"
    
    def test_over_experienced_candidate(self):
        """Test over-experienced candidate (should have less penalty)"""
        candidate_skills = [
            {"years_experience": 15},
            {"years_experience": 12}
        ]
        
        score = calculate_experience_match("mid", candidate_skills)
        assert score >= 60, f"Over-experienced should have moderate penalty, got {score}"
    
    def test_empty_skills_experience(self):
        """Test handling of empty skills for experience"""
        score = calculate_experience_match("mid", [])
        assert score == 0, "Empty skills should result in 0 experience score"
    
    def test_entry_level_match(self):
        """Test entry level matching"""
        candidate_skills = [{"years_experience": 1}]
        
        score = calculate_experience_match("entry", candidate_skills)
        assert score >= 80, f"Entry level candidate should match entry level job, got {score}"

class TestCultureMatching:
    """Test suite for culture matching algorithm"""
    
    def test_strong_culture_match(self):
        """Test strong culture alignment"""
        job_description = "We are looking for a collaborative team player who can work independently and lead innovative projects in a fast-paced environment."
        
        persona_analysis = {
            "work_style": {
                "collaboration": 90,
                "independence": 85,
                "leadership": 80
            },
            "cultural_fit": {
                "innovation": 95,
                "structure": 60
            }
        }
        
        score = calculate_culture_match(job_description, persona_analysis)
        assert score >= 70, f"Expected high culture match, got {score}"
    
    def test_no_persona_data(self):
        """Test handling of missing persona analysis"""
        job_description = "Team-oriented role requiring collaboration"
        
        score = calculate_culture_match(job_description, None)
        assert score == 50, "Missing persona data should return neutral score"
    
    def test_culture_mismatch(self):
        """Test culture mismatch scenario"""
        job_description = "Highly structured environment requiring systematic approach and process adherence"
        
        persona_analysis = {
            "work_style": {
                "collaboration": 30,
                "independence": 95
            },
            "cultural_fit": {
                "innovation": 95,
                "structure": 20
            }
        }
        
        score = calculate_culture_match(job_description, persona_analysis)
        # Score should reflect the mismatch but not be too harsh
        assert 40 <= score <= 80, f"Culture mismatch should give moderate score, got {score}"

class TestErrorHandling:
    """Test error handling in matching algorithms"""
    
    def test_malformed_skills_data(self):
        """Test handling of malformed skills data"""
        job_requirements = ["Python"]
        malformed_skills = [
            {"name": "Python"},  # Missing description and years_experience
            {"description": "Some skill"},  # Missing name
            {}  # Empty skill object
        ]
        
        # Should not raise exception
        score, strengths, concerns = calculate_skills_match(job_requirements, malformed_skills)
        assert isinstance(score, int), "Should return integer score even with malformed data"
        assert isinstance(strengths, list), "Should return list of strengths"
        assert isinstance(concerns, list), "Should return list of concerns"
    
    def test_invalid_experience_level(self):
        """Test handling of invalid experience level"""
        candidate_skills = [{"years_experience": 3}]
        
        # Should handle unknown experience levels gracefully
        score = calculate_experience_match("unknown_level", candidate_skills)
        assert isinstance(score, int), "Should return integer score for unknown experience level"
        assert 0 <= score <= 100, "Score should be within valid range"

# Integration test fixtures
@pytest.fixture
def sample_job_description():
    return JobDescription(
        title="Senior Python Developer",
        description="We are seeking a senior Python developer to join our innovative team. The role involves building scalable web applications, mentoring junior developers, and collaborating with cross-functional teams.",
        requirements=["Python", "Django", "PostgreSQL", "AWS", "Docker"],
        experience_level="senior"
    )

@pytest.fixture
def sample_candidate_profile():
    return Profile(
        id="test-candidate-1",
        first_name="John",
        last_name="Doe",
        headline="Senior Python Developer with 6 years experience",
        summary="Experienced developer passionate about clean code and scalable architecture",
        location="San Francisco, CA",
        availability="available",
        preferred_roles=["Backend Developer", "Full Stack Developer"],
        skills=[
            {
                "name": "Python",
                "category": "technical",
                "proficiency": "expert",
                "years_experience": 6,
                "description": "Expert in Python development with Django and Flask"
            },
            {
                "name": "Django",
                "category": "technical", 
                "proficiency": "advanced",
                "years_experience": 4,
                "description": "Building scalable web applications"
            },
            {
                "name": "PostgreSQL",
                "category": "technical",
                "proficiency": "advanced", 
                "years_experience": 5,
                "description": "Database design and optimization"
            }
        ],
        projects=[],
        persona_analysis={
            "work_style": {
                "collaboration": 85,
                "independence": 80,
                "leadership": 75
            },
            "cultural_fit": {
                "innovation": 90,
                "structure": 70
            }
        }
    )

class TestIntegrationScenarios:
    """Integration tests combining multiple matching algorithms"""
    
    def test_complete_matching_pipeline(self, sample_job_description, sample_candidate_profile):
        """Test the complete matching pipeline"""
        # Test skills matching
        skills_score, strengths, concerns = calculate_skills_match(
            sample_job_description.requirements,
            sample_candidate_profile.skills
        )
        
        # Test experience matching
        experience_score = calculate_experience_match(
            sample_job_description.experience_level,
            sample_candidate_profile.skills
        )
        
        # Test culture matching
        culture_score = calculate_culture_match(
            sample_job_description.description,
            sample_candidate_profile.persona_analysis
        )
        
        # Calculate overall score
        overall_score = int(
            skills_score * 0.4 + 
            experience_score * 0.3 + 
            culture_score * 0.3
        )
        
        # Assertions
        assert 0 <= skills_score <= 100, "Skills score should be in valid range"
        assert 0 <= experience_score <= 100, "Experience score should be in valid range"
        assert 0 <= culture_score <= 100, "Culture score should be in valid range"
        assert 0 <= overall_score <= 100, "Overall score should be in valid range"
        
        # This candidate should be a good match
        assert overall_score >= 70, f"Good candidate should have high overall score, got {overall_score}"
        assert len(strengths) > 0, "Should identify candidate strengths"

if __name__ == "__main__":
    pytest.main([__file__])