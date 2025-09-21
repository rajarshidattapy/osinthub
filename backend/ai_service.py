import google.generativeai as genai
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv
from document_parser import DocumentParser, DocumentChange
import json

load_dotenv()


class EnhancedAIService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(os.getenv("GOOGLE_GEMINI_MODEL", "gemini-pro"))
        self.document_parser = DocumentParser()

    async def validate_merge_request_with_documents(
            self,
            title: str,
            description: str,
            file_changes: List[Dict],
            source_repo_description: str,
            target_repo_description: str,
            document_changes: List[DocumentChange] = None
    ) -> Dict:
        """
        Enhanced validation that considers actual document content changes
        """
        try:
            # Prepare context including document content analysis
            context = f"""
            OSINT Case Repository Analysis

            Source Repository: {source_repo_description}
            Target Repository: {target_repo_description}

            Merge Request Title: {title}
            Description: {description}

            File Changes Summary:
            {self._format_file_changes_enhanced(file_changes)}

            Document Content Changes:
            {self._format_document_changes(document_changes) if document_changes else 'No document content changes provided'}

            As an AI assistant for OSINT research validation, please analyze this merge request for:

            1. RELEVANCE (0-100): How relevant are these changes to the investigation/case?
            2. ACCURACY: Are the added facts, evidence, or information credible and well-sourced?
            3. COMPLETENESS: Do the changes provide sufficient context and documentation?
            4. DUPLICATION: Are there any signs of duplicate or redundant information?
            5. LEGAL/ETHICAL CONCERNS: Any potential issues with sensitive information or privacy?
            6. SOURCE QUALITY: Assessment of information sources and citations

            Provide your analysis in this JSON format:
            {{
                "decision": "APPROVED|REJECTED|NEEDS_REVIEW",
                "relevance_score": 0-100,
                "accuracy_score": 0-100,
                "completeness_score": 0-100,
                "overall_score": 0-100,
                "concerns": ["list", "of", "concerns"],
                "suggestions": ["list", "of", "improvement", "suggestions"],
                "reasoning": "detailed explanation of the decision"
            }}
            """

            response = await self.model.generate_content_async(context)

            # Parse AI response
            analysis = self._parse_enhanced_ai_response(response.text)

            return {
                "status": analysis.get("decision", "needs_review").lower(),
                "score": analysis.get("overall_score", 50),
                "relevance_score": analysis.get("relevance_score", 50),
                "accuracy_score": analysis.get("accuracy_score", 50),
                "completeness_score": analysis.get("completeness_score", 50),
                "feedback": analysis.get("reasoning", response.text),
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

    async def analyze_document_credibility(self, content: str, filename: str) -> Dict:
        """Analyze the credibility and quality of a document"""
        prompt = f"""
        Analyze the following document for OSINT research credibility:

        Filename: {filename}
        Content Preview: {content[:2000]}...

        Please assess:
        1. Source reliability indicators
        2. Information completeness
        3. Potential bias or misinformation
        4. Legal document authenticity markers
        5. Citation quality
        6. Date relevance

        Provide credibility score (0-100) and detailed analysis.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_credibility_response(response.text)
        except Exception as e:
            return {"credibility_score": 50, "analysis": f"Error: {str(e)}"}

    async def detect_sensitive_information(self, content: str) -> Dict:
        """Detect potentially sensitive information that shouldn't be public"""
        prompt = f"""
        Analyze this content for sensitive information that might need redaction in public OSINT research:

        Content: {content[:1500]}...

        Look for:
        1. Personal identifiers (SSN, addresses, phone numbers)
        2. Financial information
        3. Legal case sensitive details
        4. Privacy-protected information
        5. Security-sensitive data

        Provide locations and sensitivity levels.
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_sensitivity_response(response.text)
        except Exception as e:
            return {"sensitive_items": [], "risk_level": "unknown"}

    async def suggest_document_improvements(self, content: str, case_context: str) -> List[str]:
        """Suggest improvements for document quality and completeness"""
        prompt = f"""
        Given this case context: {case_context}

        And this document content: {content[:1000]}...

        Suggest specific improvements for OSINT research quality:
        1. Missing information that should be included
        2. Better source attribution needed
        3. Additional verification steps
        4. Organization improvements
        5. Cross-referencing opportunities
        """

        try:
            response = await self.model.generate_content_async(prompt)
            return self._extract_suggestions(response.text)
        except Exception as e:
            return [f"Error generating suggestions: {str(e)}"]

    def _format_file_changes_enhanced(self, file_changes: List[Dict]) -> str:
        """Enhanced formatting of file changes with more context"""
        if not file_changes:
            return "No file changes provided"

        formatted = []
        for change in file_changes:
            formatted.append(f"- {change['change_type']}: {change['file_path']}")
            if change.get('diff_content'):
                # Show more context from diff
                diff_preview = change['diff_content'][:500]
                formatted.append(f"  Changes: {diff_preview}...")
            if change.get('additions', 0) > 0 or change.get('deletions', 0) > 0:
                formatted.append(f"  Stats: +{change.get('additions', 0)} -{change.get('deletions', 0)} lines")

        return "\n".join(formatted)

    def _format_document_changes(self, document_changes: List[DocumentChange]) -> str:
        """Format document content changes for AI analysis"""
        if not document_changes:
            return "No document content changes"

        formatted = []
        for change in document_changes:
            formatted.append(f"Document Change Type: {change.change_type}")
            formatted.append(f"Similarity Score: {change.similarity_score:.2f}")

            if change.change_type == 'added':
                formatted.append(f"New Content Preview: {change.new_content[:300]}...")
            elif change.change_type == 'modified':
                formatted.append(f"Content Diff: {change.diff[:500]}...")
            elif change.change_type == 'deleted':
                formatted.append(f"Deleted Content Preview: {change.old_content[:300]}...")

            formatted.append("---")

        return "\n".join(formatted)

    def _parse_enhanced_ai_response(self, response: str) -> Dict:
        """Parse enhanced AI response with JSON extraction"""
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
        except:
            pass

        # Fallback to text parsing
        analysis = {
            "decision": "needs_review",
            "relevance_score": 50,
            "accuracy_score": 50,
            "completeness_score": 50,
            "overall_score": 50,
            "concerns": [],
            "suggestions": [],
            "reasoning": response
        }

        # Extract decision
        if "APPROVED" in response.upper():
            analysis["decision"] = "approved"
        elif "REJECTED" in response.upper():
            analysis["decision"] = "rejected"

        # Extract scores
        import re
        score_patterns = [
            (r'relevance[^:]*:\s*(\d+)', 'relevance_score'),
            (r'accuracy[^:]*:\s*(\d+)', 'accuracy_score'),
            (r'completeness[^:]*:\s*(\d+)', 'completeness_score'),
            (r'overall[^:]*:\s*(\d+)', 'overall_score')
        ]

        for pattern, key in score_patterns:
            match = re.search(pattern, response.lower())
            if match:
                analysis[key] = int(match.group(1))

        return analysis

    def _parse_credibility_response(self, response: str) -> Dict:
        """Parse credibility analysis response"""
        # Extract credibility score
        import re
        score_match = re.search(r'(\d+)[^\d]*credibility', response.lower())
        score = int(score_match.group(1)) if score_match else 50

        return {
            "credibility_score": score,
            "analysis": response,
            "indicators": self._extract_indicators(response)
        }

    def _parse_sensitivity_response(self, response: str) -> Dict:
        """Parse sensitive information detection response"""
        # This would need more sophisticated parsing
        return {
            "sensitive_items": [],
            "risk_level": "medium",
            "details": response
        }

    def _extract_suggestions(self, response: str) -> List[str]:
        """Extract suggestions from AI response"""
        lines = response.split('\n')
        suggestions = []
        for line in lines:
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('•') or line[0].isdigit()):
                # Clean up the line
                cleaned = re.sub(r'^[-•\d\.\s]+', '', line).strip()
                if cleaned:
                    suggestions.append(cleaned)
        return suggestions[:10]  # Limit to top 10 suggestions

    def _extract_indicators(self, text: str) -> List[str]:
        """Extract credibility indicators from analysis"""
        indicators = []
        # This is a simplified implementation
        indicator_keywords = ['source', 'citation', 'date', 'author', 'verification', 'bias']
        for keyword in indicator_keywords:
            if keyword in text.lower():
                indicators.append(keyword)
        return indicators