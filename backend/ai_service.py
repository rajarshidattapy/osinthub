import google.generativeai as genai
import os
from typing import Dict, List, Tuple
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(os.getenv("GOOGLE_GEMINI_MODEL", "gemini-pro"))
    
    async def validate_merge_request(
        self, 
        title: str, 
        description: str, 
        file_changes: List[Dict],
        source_repo_description: str,
        target_repo_description: str
    ) -> Dict:
        """
        Validate a merge request using AI to ensure relevance, accuracy, and quality
        """
        try:
            # Prepare context for AI analysis
            context = f"""
            Source Repository: {source_repo_description}
            Target Repository: {target_repo_description}
            
            Merge Request Title: {title}
            Description: {description}
            
            File Changes:
            {self._format_file_changes(file_changes)}
            
            Please analyze this merge request and provide:
            1. Relevance Score (0-100): How relevant are these changes to the target repository?
            2. Quality Assessment: Are the changes well-structured and logical?
            3. Potential Issues: Any concerns about accuracy, duplication, or relevance?
            4. Recommendations: Suggestions for improvement
            5. Overall Decision: APPROVED, REJECTED, or NEEDS_REVIEW
            """
            
            response = await self.model.generate_content_async(context)
            
            # Parse AI response and extract structured data
            analysis = self._parse_ai_response(response.text)
            
            return {
                "status": analysis.get("decision", "needs_review"),
                "score": analysis.get("relevance_score", 0),
                "feedback": analysis.get("feedback", ""),
                "concerns": analysis.get("concerns", []),
                "suggestions": analysis.get("suggestions", []),
                "ai_analysis": response.text
            }
            
        except Exception as e:
            return {
                "status": "needs_review",
                "score": 0,
                "feedback": f"AI validation failed: {str(e)}",
                "concerns": ["AI validation error"],
                "suggestions": ["Review manually"],
                "ai_analysis": f"Error: {str(e)}"
            }
    
    def _format_file_changes(self, file_changes: List[Dict]) -> str:
        """Format file changes for AI analysis"""
        formatted = []
        for change in file_changes:
            formatted.append(f"- {change['change_type']}: {change['file_path']}")
            if change.get('diff_content'):
                formatted.append(f"  Diff: {change['diff_content'][:200]}...")
        return "\n".join(formatted)
    
    def _parse_ai_response(self, response: str) -> Dict:
        """Parse AI response to extract structured data"""
        # This is a simplified parser - in production, you'd want more robust parsing
        analysis = {
            "decision": "needs_review",
            "relevance_score": 50,
            "feedback": response,
            "concerns": [],
            "suggestions": []
        }
        
        # Try to extract decision
        if "APPROVED" in response.upper():
            analysis["decision"] = "approved"
        elif "REJECTED" in response.upper():
            analysis["decision"] = "rejected"
        
        # Try to extract score
        import re
        score_match = re.search(r'(\d+)[^\d]*relevance', response.lower())
        if score_match:
            analysis["relevance_score"] = int(score_match.group(1))
        
        return analysis
    
    async def summarize_content(self, content: str, max_length: int = 200) -> str:
        """Generate a summary of content using AI"""
        try:
            prompt = f"Please provide a concise summary of the following content in {max_length} characters or less:\n\n{content}"
            response = await self.model.generate_content_async(prompt)
            return response.text[:max_length]
        except Exception as e:
            return content[:max_length] + "..." if len(content) > max_length else content
    
    async def detect_duplicates(self, new_content: str, existing_contents: List[str]) -> List[Dict]:
        """Detect potential duplicate content"""
        try:
            prompt = f"""
            Compare the following new content with existing content and identify potential duplicates:
            
            New Content:
            {new_content}
            
            Existing Contents:
            {chr(10).join([f"{i+1}. {content[:100]}..." for i, content in enumerate(existing_contents)])}
            
            For each potential duplicate, provide:
            - Content ID (1, 2, 3...)
            - Similarity percentage (0-100)
            - Brief explanation of similarity
            """
            
            response = await self.model.generate_content_async(prompt)
            
            # Parse response to extract duplicate information
            # This is simplified - in production you'd want more robust parsing
            duplicates = []
            lines = response.text.split('\n')
            for line in lines:
                if any(keyword in line.lower() for keyword in ['duplicate', 'similar', 'match']):
                    duplicates.append({
                        "content_id": 0,
                        "similarity": 50,
                        "explanation": line.strip()
                    })
            
            return duplicates
            
        except Exception as e:
            return [{"content_id": 0, "similarity": 0, "explanation": f"Error: {str(e)}"}]
