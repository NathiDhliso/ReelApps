import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from main import app, JobDescription, Profile

client = TestClient(app)

class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check_success(self):
        """Test successful health check"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data
        assert "services" in data

class TestJobAnalysisEndpoint:
    """Test job description analysis endpoint"""
    
    def test_valid_job_analysis(self):
        """Test analysis with valid job description"""
        job_data = {
            "title": "Senior Python Developer",
            "description": "We are looking for an experienced Python developer to join our team.",
            "requirements": ["Python", "Django", "PostgreSQL"],
            "experience_level": "senior"
        }
        
        with patch('main.call_gemini_api') as mock_gemini:
            mock_gemini.return_value = json.dumps({
                "clarity": 85,
                "realism": 90,
                "inclusivity": 80,
                "suggestions": ["Add salary range", "Include remote work policy"]
            })
            
            response = client.post("/analyze/job-description", json=job_data)
            
            assert response.status_code == 200
            data = response.json()
            assert "clarity" in data
            assert "realism" in data
            assert "inclusivity" in data
            assert "suggestions" in data
            assert isinstance(data["suggestions"], list)
    
    def test_job_analysis_with_ai_failure(self):
        """Test job analysis when AI service fails"""
        job_data = {
            "title": "Test Job",
            "description": "Test description",
            "requirements": ["Python"],
            "experience_level": "mid"
        }
        
        with patch('main.call_gemini_api') as mock_gemini:
            mock_gemini.side_effect = Exception("AI service unavailable")
            
            response = client.post("/analyze/job-description", json=job_data)
            
            # Should still return a response with fallback analysis
            assert response.status_code == 200
            data = response.json()
            assert data["clarity"] == 70  # Fallback values
            assert data["realism"] == 75
            assert data["inclusivity"] == 80
    
    def test_invalid_job_data(self):
        """Test analysis with invalid job data"""
        invalid_data = {
            "title": "",  # Empty title
            "description": "",  # Empty description
            "requirements": [],  # Empty requirements
            "experience_level": "invalid"  # Invalid experience level
        }
        
        response = client.post("/analyze/job-description", json=invalid_data)
        
        # Should handle gracefully and return fallback analysis
        assert response.status_code == 200

class TestCandidateMatchingEndpoint:
    """Test candidate matching endpoint"""
    
    def test_valid_candidate_matching(self):
        """Test matching with valid data"""
        job_posting = {
            "id": "job-1",
            "title": "Python Developer",
            "description": "Looking for a Python developer with Django experience",
            "requirements": ["Python", "Django"],
            "experience_level": "mid"
        }
        
        candidates = [
            {
                "id": "candidate-1",
                "first_name": "John",
                "last_name": "Doe",
                "headline": "Python Developer",
                "summary": "Experienced Python developer",
                "location": "San Francisco",
                "availability": "available",
                "preferred_roles": ["Backend Developer"],
                "skills": [
                    {
                        "name": "Python",
                        "category": "technical",
                        "proficiency": "advanced",
                        "years_experience": 4,
                        "description": "Python development"
                    }
                ],
                "projects": [],
                "persona_analysis": {
                    "work_style": {"collaboration": 80, "independence": 70},
                    "cultural_fit": {"innovation": 85}
                }
            }
        ]
        
        request_data = {
            "job_posting": job_posting,
            "candidates": candidates
        }
        
        response = client.post("/match/candidates", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        
        match = data[0]
        assert "candidate_id" in match
        assert "overall_score" in match
        assert "skills_match" in match
        assert "culture_match" in match
        assert "experience_match" in match
        assert "reasoning" in match
        assert "strengths" in match
        assert "concerns" in match
    
    def test_empty_candidates_list(self):
        """Test matching with empty candidates list"""
        request_data = {
            "job_posting": {"title": "Test Job", "requirements": []},
            "candidates": []
        }
        
        response = client.post("/match/candidates", json=request_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data == []  # Should return empty list
    
    def test_malformed_candidate_data(self):
        """Test matching with malformed candidate data"""
        job_posting = {
            "title": "Test Job",
            "requirements": ["Python"],
            "experience_level": "mid"
        }
        
        malformed_candidates = [
            {
                "id": "candidate-1",
                # Missing required fields
                "skills": "not a list",  # Invalid skills format
                "persona_analysis": None
            }
        ]
        
        request_data = {
            "job_posting": job_posting,
            "candidates": malformed_candidates
        }
        
        response = client.post("/match/candidates", json=request_data)
        
        # Should handle gracefully and continue processing
        assert response.status_code == 200

class TestErrorHandling:
    """Test API error handling"""
    
    def test_invalid_json_request(self):
        """Test handling of invalid JSON"""
        response = client.post(
            "/analyze/job-description",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422  # Unprocessable Entity
    
    def test_missing_required_fields(self):
        """Test handling of missing required fields"""
        incomplete_data = {
            "title": "Test Job"
            # Missing description, requirements, experience_level
        }
        
        response = client.post("/analyze/job-description", json=incomplete_data)
        
        assert response.status_code == 422  # Validation error

class TestRateLimiting:
    """Test rate limiting and abuse prevention"""
    
    @pytest.mark.slow
    def test_rapid_requests(self):
        """Test handling of rapid successive requests"""
        job_data = {
            "title": "Test Job",
            "description": "Test description",
            "requirements": ["Python"],
            "experience_level": "mid"
        }
        
        # Make multiple rapid requests
        responses = []
        for _ in range(10):
            response = client.post("/analyze/job-description", json=job_data)
            responses.append(response)
        
        # All requests should be handled (no rate limiting implemented yet)
        # In production, some might return 429 Too Many Requests
        success_count = sum(1 for r in responses if r.status_code == 200)
        assert success_count > 0, "At least some requests should succeed"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])