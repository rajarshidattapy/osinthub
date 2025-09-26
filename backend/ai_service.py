import google.generativeai as genai
import os
from typing import Dict, List, Optional, AsyncGenerator
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
        self.model = genai.GenerativeModel(os.getenv("GOOGLE_GEMINI_MODEL", "models/gemini-1.5-flash-8b-latest"))
        self.document_parser = DocumentParser()

    async def validate_merge_request(
        self,
        title: str,
        description: str,
        file_changes: List[Dict],
        source_repo_description: str,
        target_repo_description: str
    ) -> Dict:
        """Backward-compatible wrapper used by routers.

        Currently delegates to validate_merge_request_with_documents without document diff enrichment.
        Keeping the simple signature to avoid changing existing router code.
        """
        return await self.validate_merge_request_with_documents(
            title=title,
            description=description,
            file_changes=file_changes,
            source_repo_description=source_repo_description,
            target_repo_description=target_repo_description,
            document_changes=None
        )

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

    async def generate_repository_chatbot_response(
        self,
        question: str,
        repository_data: Dict,
        commits_data: List[Dict],
        files_data: List[Dict]
    ) -> str:
        """
        Generate chatbot response about repository content using Gemini
        """
        try:
            # Prepare repository context with more detailed information
            repo_context = f"""
            REPOSITORY OVERVIEW:
            ===================
            Name: {repository_data.get('name', 'Unknown')}
            Description: {repository_data.get('description', 'No description')}
            Owner: {repository_data.get('owner', 'Unknown')}
            Created: {repository_data.get('createdAt', 'Unknown')}
            Last Updated: {repository_data.get('updatedAt', 'Unknown')}
            
            COMMIT HISTORY ({len(commits_data)} commits):
            ==========================================
            """
            
            # Add detailed commit information
            for i, commit in enumerate(commits_data[:15]):  # Show more commits
                author_info = commit.get('author', {})
                author_name = author_info.get('username', 'Unknown') if isinstance(author_info, dict) else str(author_info)
                
                repo_context += f"""
            {i+1}. Commit: {commit.get('sha', 'Unknown')[:8]}
               Message: {commit.get('message', 'No message')}
               Author: {author_name}
               Date: {commit.get('timestamp', 'Unknown')}
               Parent: {commit.get('parent_sha', 'None')[:8] if commit.get('parent_sha') else 'None'}
               """
            
            # Add detailed file information with content analysis
            repo_context += f"""
            
            FILE STRUCTURE ({len(files_data)} files):
            ======================================
            """
            
            # Group files by directory for better structure understanding
            file_structure = {}
            for file in files_data:
                path = file.get('path', 'Unknown')
                dir_path = '/'.join(path.split('/')[:-1]) if '/' in path else 'root'
                if dir_path not in file_structure:
                    file_structure[dir_path] = []
                file_structure[dir_path].append(file)
            
            for dir_path, files in file_structure.items():
                repo_context += f"""
            📁 {dir_path if dir_path != 'root' else '/'}:
            """
                for file in files:
                    file_type = file.get('type', 'Unknown')
                    file_size = file.get('size', 0)
                    file_content = file.get('content', '')
                    
                    repo_context += f"""
               📄 {file.get('name', 'Unknown')} ({file_type}, {file_size} bytes)
                  Last Modified: {file.get('lastModified', 'Unknown')}
                  """
                    
                    # Add content analysis for different file types
                    if file_content:
                        if file_type == 'json':
                            try:
                                import json
                                json_data = json.loads(file_content)
                                if isinstance(json_data, dict):
                                    repo_context += f"""
                  JSON Structure: {list(json_data.keys())}
                  """
                                    # Add specific content for JSON files
                                    if 'domains' in json_data:
                                        domains = json_data.get('domains', [])
                                        repo_context += f"""
                  Contains {len(domains)} domains
                  """
                                    if 'ip_addresses' in json_data:
                                        ips = json_data.get('ip_addresses', [])
                                        repo_context += f"""
                  Contains {len(ips)} IP addresses
                  """
                            except:
                                pass
                        
                        elif file_type == 'markdown':
                            # Extract key sections from markdown
                            lines = file_content.split('\n')
                            headers = [line for line in lines if line.startswith('#')]
                            if headers:
                                repo_context += f"""
                  Sections: {', '.join([h.strip('# ').strip() for h in headers[:5]])}
                  """
                        
                        # Add content preview for all text files
                        if file_type in ['txt', 'md', 'json', 'py', 'js', 'ts', 'csv']:
                            content_preview = file_content[:800]  # Increased preview size
                            repo_context += f"""
                  Content Preview:
                  {content_preview}
                  """
            
            # Add repository statistics
            total_files = len(files_data)
            total_commits = len(commits_data)
            file_types = {}
            for file in files_data:
                file_type = file.get('type', 'unknown')
                file_types[file_type] = file_types.get(file_type, 0) + 1
            
            repo_context += f"""
            
            REPOSITORY STATISTICS:
            =====================
            Total Files: {total_files}
            Total Commits: {total_commits}
            File Types: {dict(file_types)}
            """
            
            # Create the enhanced prompt for Gemini
            prompt = f"""
            You are an expert repository assistant. Analyze the repository data below and answer the user's question with detailed, accurate information.

            CRITICAL RULES:
            1. ONLY use information explicitly provided in the repository data below
            2. If information is not available, clearly state "I don't have that information from this repo."
            3. Be thorough but concise in your analysis
            4. Format code snippets, file paths, and technical details properly
            5. Use clear, professional language
            6. When showing lists (commits, files, functions), format them clearly with proper numbering
            7. Analyze file contents and structure when relevant to the question
            8. Provide specific details like file sizes, dates, and technical information when available

            REPOSITORY DATA:
            {repo_context}

            USER QUESTION: {question}

            Provide a comprehensive, accurate answer based solely on the repository information above. Include specific details, file contents, commit information, and technical analysis as relevant to the question.
            """

            response = await self.model.generate_content_async(prompt)
            return response.text.strip()

        except Exception as e:
            return f"I'm sorry, I encountered an error while processing your question: {str(e)}"

    async def generate_repository_chatbot_response_stream(
        self,
        question: str,
        repository_data: Dict,
        commits_data: List[Dict],
        files_data: List[Dict]
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming chatbot response about repository content using Gemini
        """
        try:
            # Prepare concise repository context
            repo_context = f"""
            REPOSITORY: {repository_data.get('name', 'Unknown')}
            DESCRIPTION: {repository_data.get('description', 'No description')}
            OWNER: {repository_data.get('owner', 'Unknown')}
            CREATED: {repository_data.get('createdAt', 'Unknown')}
            
            RECENT COMMITS ({len(commits_data)} total):
            """
            
            # Add only essential commit information
            for i, commit in enumerate(commits_data[:8]):  # Limit to 8 most recent
                author_info = commit.get('author', {})
                author_name = author_info.get('username', 'Unknown') if isinstance(author_info, dict) else str(author_info)
                
                repo_context += f"""
            {i+1}. {commit.get('sha', 'Unknown')[:8]} - {commit.get('message', 'No message')} - {author_name} - {commit.get('timestamp', 'Unknown')}
            """
            
            # Add essential file information
            repo_context += f"""
            
            FILES ({len(files_data)} total):
            """
            
            # Group files by directory for better structure understanding
            file_structure = {}
            for file in files_data:
                path = file.get('path', 'Unknown')
                dir_path = '/'.join(path.split('/')[:-1]) if '/' in path else 'root'
                if dir_path not in file_structure:
                    file_structure[dir_path] = []
                file_structure[dir_path].append(file)
            
            for dir_path, files in file_structure.items():
                repo_context += f"""
            📁 {dir_path if dir_path != 'root' else '/'}:
            """
                for file in files[:5]:  # Limit files per directory
                    file_type = file.get('type', 'Unknown')
                    file_size = file.get('size', 0)
                    file_content = file.get('content', '')
                    
                    repo_context += f"""
               📄 {file.get('name', 'Unknown')} ({file_type}, {file_size} bytes)
            """
                    
                    # Add minimal content analysis for key files
                    if file_content and file_type in ['json', 'md', 'txt']:
                        if file_type == 'json':
                            try:
                                import json
                                json_data = json.loads(file_content)
                                if isinstance(json_data, dict):
                                    keys = list(json_data.keys())[:3]  # Only first 3 keys
                                    repo_context += f"""
                  Keys: {keys}
            """
                            except:
                                pass
                        elif file_type == 'md':
                            lines = file_content.split('\n')
                            headers = [line for line in lines if line.startswith('#')][:3]  # Only first 3 headers
                            if headers:
                                repo_context += f"""
                  Sections: {', '.join([h.strip('# ').strip() for h in headers])}
            """
            
            # Create the optimized prompt for concise responses
            prompt = f"""
            You are a concise repository assistant. Answer the user's question about this repository with SHORT, DIRECT answers.

            CRITICAL RULES:
            1. Keep answers under 100 words
            2. Use bullet points for lists
            3. Only use information from the repository data below
            4. If information is not available, say "Not available in this repo"
            5. Be direct and to the point
            6. Format code snippets in backticks
            7. Use simple language

            REPOSITORY DATA:
            {repo_context}

            USER QUESTION: {question}

            Provide a SHORT, DIRECT answer based only on the repository information above.
            """

            # Use streaming generation
            response = await self.model.generate_content_async(prompt, stream=True)
            
            # Stream the response
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            yield f"Error: {str(e)}"